// Copyright 2022 Datafuse Labs.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	dc "github.com/databendcloud/databend-go"
	"github.com/montanaflynn/stats"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

func main() {
	cmd := NewCmdBenchmark()
	if err := cmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

type benchmarkOptions struct {
	WarmCount    int
	TestCount    int
	TestDir      string
	OutputFormat string
	OutputDir    string
	Tag          string
	Size         string

	ConnOpts ConnOptions
}

type ConnOptions struct {
	Username string
	Password string
	Database string
}

func NewCmdBenchmark() *cobra.Command {
	opts := &benchmarkOptions{}

	cmd := &cobra.Command{
		Use:   "benchmark",
		Short: "Run Benchmark",
		Long:  "Run Benchmark for Databend",
		RunE: func(cmd *cobra.Command, args []string) error {
			dsn := os.Getenv("DATABEND_DSN")
			if dsn == "" {
				dsn = "databend://localhost:8000?sslmode=disable"
				fmt.Printf("DATABEND_DSN is not set, use default: %s", dsn)
			}
			dcConfig, err := dc.ParseDSN(dsn)
			if err != nil {
				return errors.Wrap(err, "failed to parse dsn")
			}
			cli := dc.NewAPIClientFromConfig(dcConfig)

			fmt.Printf("Running benchmark with options: %+v\n", opts)
			targets, err := ReadTargetFiles(opts.TestDir)
			if err != nil {
				return errors.Wrap(err, "ReadTargetFiles")
			}
			for _, target := range targets {
				err := runTarget(target, cli, opts)
				if err != nil {
					return err
				}
			}
			return nil
		},
	}

	cmd.Flags().IntVarP(&opts.WarmCount, "warm", "w", 3, "warm up count for each benchmark")
	cmd.Flags().IntVarP(&opts.TestCount, "count", "c", 10, "test count for each benchmark")
	cmd.Flags().StringVarP(&opts.TestDir, "test-dir", "t", "./testdata", "test directory")
	cmd.Flags().StringVarP(&opts.OutputFormat, "output-format", "f", "json", "comma separated format: json, yaml, md")
	cmd.Flags().StringVarP(&opts.OutputDir, "output-dir", "o", "./target", "output directory to store tests")
	cmd.Flags().StringVarP(&opts.Tag, "tags", "", "", "tag for the test")
	cmd.Flags().StringVarP(&opts.Size, "size", "", "", "size of the test")

	cmd.Flags().StringVarP(&opts.ConnOpts.Username, "username", "u", "", "Optional username")
	cmd.Flags().StringVarP(&opts.ConnOpts.Password, "password", "p", "", "Optional password")
	cmd.Flags().StringVarP(&opts.ConnOpts.Database, "database", "d", "", "Optional database")

	return cmd
}

func runQuery(cli *dc.APIClient, query string) (*dc.QueryStats, error) {
	r0, err := cli.DoQuery(query, nil)
	if err != nil {
		return nil, errors.Wrap(err, "DoQuery")
	}
	if r0.Error != nil {
		return nil, fmt.Errorf("query has error: %s", r0.Error)
	}
	s := r0.Stats
	nextURI := r0.NextURI
	for nextURI != "" {
		p, err := cli.QueryPage(nextURI)
		if err != nil {
			return nil, errors.Wrap(err, "QueryPage")
		}
		if p.Error != nil {
			return nil, fmt.Errorf("query page has error: %s", p.Error)
		}
		nextURI = p.NextURI
		if p.Stats.RunningTimeMS > 0 {
			s = p.Stats
		}
	}
	return &s, nil
}

func runTarget(target *InputQueryFile, cli *dc.APIClient, opts *benchmarkOptions) error {
	output := &OutputFile{}
	output.MetaData.Tag = opts.Tag
	output.MetaData.Size = opts.Size
	output.MetaData.Table = target.MetaData.Table
	output.Schema = make([]OutputSchema, 0)

	for _, i := range target.Statements {
		fmt.Printf("\nstart to run query %s : %s\n", i.Name, i.Query)

		o := OutputSchema{}
		o.Error = make([]string, 0)
		o.Time = make([]float64, 0)
		o.Name = i.Name
		o.SQL = i.Query

		for j := 0; j < opts.WarmCount; j++ {
			_, _ = runQuery(cli, i.Query)
		}
		fmt.Printf("%s finished warm up %d times\n", i.Name, opts.WarmCount)

		testOK := false
		for j := 0; j < opts.TestCount; j++ {
			fmt.Printf("%s[%d] running...\n", i.Name, j)

			if s, err := runQuery(cli, i.Query); err != nil {
				fmt.Printf("%s[%d] result has error: %s\n", i.Name, j, err.Error())
				o.Error = append(o.Error, err.Error())
			} else {
				testOK = true
				fmt.Printf("%s[%d] result stats: %.2f ms, %d bytes, %d rows\n",
					i.Name, j, s.RunningTimeMS, s.ScanProgress.Bytes, s.ScanProgress.Rows)
				o.ReadRow = s.ScanProgress.Rows
				o.ReadByte = s.ScanProgress.Bytes
				ms := s.RunningTimeMS
				t := float64(time.Duration(ms)*time.Millisecond) / float64(time.Second)
				o.Time = append(o.Time, t)
			}
		}
		if len(o.Time) > 0 {
			o.Min, _ = stats.Min(o.Time)
			o.Max, _ = stats.Max(o.Time)
			o.Median, _ = stats.Median(o.Time)
			o.Mean, _ = stats.GeometricMean(o.Time)
			o.StdDev, _ = stats.StandardDeviation(o.Time)
		}
		if !testOK {
			return fmt.Errorf("test failed for %s", i.Name)
		}
		output.Schema = append(output.Schema, o)
	}
	return generateOutput(opts, output)
}

func generateOutput(opts *benchmarkOptions, output *OutputFile) error {
	for _, format := range strings.Split(opts.OutputFormat, ",") {
		var data []byte
		switch format {
		case "json":
			b, err := json.Marshal(output)
			if err != nil {
				return errors.Wrap(err, "failed to marshal json")
			}
			data = b
		case "yaml":
			b, err := yaml.Marshal(output)
			if err != nil {
				fmt.Printf("failed to marshal yaml : %+v\n", err)
			}
			data = b
		case "markdown", "md":
			text := fmt.Sprintf("## Benchmark for %s with `%s`\n\n", output.MetaData.Table, output.MetaData.Size)
			if output.MetaData.Tag != "" {
				text += fmt.Sprintf("tag: `%s`\n\n", output.MetaData.Tag)
			}
			text += "|Name|Min|Max|Median|Mean|StdDev|ReadRow|ReadByte|\n"
			text += "|----|---|---|------|----|------|-------|--------|\n"
			for _, o := range output.Schema {
				text += fmt.Sprintf("|%s|%.2f ms|%.2f ms|%.2f ms|%.2f ms|%.2f ms|%d|%d|\n",
					o.Name, o.Min, o.Max, o.Median, o.Mean, o.StdDev, o.ReadRow, o.ReadByte)
			}
			data = []byte(text)
		default:
			return errors.Errorf("unsupported output type %s", format)
		}
		outFile := filepath.Join(opts.OutputDir, output.MetaData.Table+"."+format)
		err := os.WriteFile(outFile, data, 0644)
		if err != nil {
			return errors.Wrapf(err, "cannot write %s", outFile)
		}
	}
	return nil
}

// Input

type QueryStatement struct {
	Name  string `json:"name"`
	Query string `json:"query"`
}

type MetaData struct {
	Table string `json:"table"`
}

type InputQueryFile struct {
	Statements []QueryStatement `json:"statements"`
	MetaData   MetaData         `json:"metadata"`
}

func (f *InputQueryFile) Decode(b []byte) error {
	err := yaml.Unmarshal(b, f)
	if err != nil {
		return err
	}
	return nil
}

func ReadTargetFiles(directory string) ([]*InputQueryFile, error) {
	res := make([]*InputQueryFile, 0)
	fileInfo, err := os.Stat(directory)
	if err != nil {
		// error handling
		return nil, err
	}

	if !fileInfo.IsDir() {
		// is a directory
		// handle file there
		if strings.HasSuffix(directory, ".yaml") {
			b, err := os.ReadFile(directory)
			if err != nil {
				return nil, err
			}
			var r = &InputQueryFile{}
			err = r.Decode([]byte(b))
			if err != nil {
				log.Printf("error during parsing file %s, %+v", directory, err)
				return nil, err
			}
			res = append(res, r)
		}
		return res, nil
	}
	items, err := os.ReadDir(directory)
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		if item.IsDir() {
			continue
		} else {
			// handle file there
			if strings.HasSuffix(item.Name(), ".yaml") {
				b, err := os.ReadFile(directory + "/" + item.Name())
				if err != nil {
					return nil, err
				}
				var r = &InputQueryFile{}
				if err := r.Decode(b); err != nil {
					log.Printf("error during parsing file %s, %+v", item.Name(), err)
					return nil, err
				}
				res = append(res, r)
			}
		}
	}
	return res, nil
}

// Output

type OutputMetaData struct {
	Table string `json:"table"`
	Tag   string `json:"tag"`
	Size  string `json:"size"`
}

type OutputSchema struct {
	Name     string    `json:"name"`
	SQL      string    `json:"sql"`
	Min      float64   `json:"min"`
	Max      float64   `json:"max"`
	Median   float64   `json:"median"`
	StdDev   float64   `json:"std_dev"`
	ReadRow  uint64    `json:"read_row"`
	ReadByte uint64    `json:"read_byte"`
	Time     []float64 `json:"time"`
	Error    []string  `json:"error"`
	Mean     float64   `json:"mean"`
}

type OutputFile struct {
	MetaData OutputMetaData `json:"metadata"`
	Schema   []OutputSchema `json:"schema"`
}
