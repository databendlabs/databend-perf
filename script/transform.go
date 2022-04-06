package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"sort"
	"strings"
	"sync"
)

// input
type Meta struct {
	Table string `json:"table"`
	Tag   string `json:"tag"`
	Size  string `json:"size"`
}
type Schema struct {
	Name     string    `json:"name"`
	Sql      string    `json:"sql"`
	Min      float32   `json:"min"`
	Max      float32   `json:"max"`
	Median   float64   `json:"median"`
	StdDev   float64   `json:"std_dev"`
	ReadRow  uint64    `json:"read_row"`
	ReadByte uint64    `json:"read_byte"`
	Times    []float32 `json:"time"`
	Errors   []error   `json:"error"`
	Mean     float64   `json:"mean"`
}
type Data struct {
	Meta    Meta     `json:"metadata"`
	Schemas []Schema `json:"schema"`
}

func (d *Data) GetSchema(name string) *Schema {
	for i, schema := range d.Schemas {
		if schema.Name == name {
			return &d.Schemas[i]
		}
	}
	return nil
}

// output
type Result struct {
	Title    string   `json:"title"`
	Sql      string   `json:"sql"`
	Lines    []*Line  `json:"lines"`
	Type     string   `json:"-"`
	Index    int      `json:"-"`
	Versions []string `json:"version"`
	Legends  []string `json:"legend"`
	X        []string `json:"xAxis"`
}
type Line struct {
	Name string    `json:"name"`
	Data []float32 `json:"data"`
}

var (
	sampleTemplate  = `('%s',%.3f,'%s')`
	srcDir, destDir string
)

const (
	JsonSuffix = `.json`
)

func (r *Result) Bytes() []byte {
	bs, err := json.Marshal(r)
	if err != nil {
		fmt.Printf("marshal result err: %v\n", err)
		return nil
	}
	return bs
}

func (r *Result) String() string {
	bs, err := json.Marshal(r)
	if err != nil {
		fmt.Printf("marshal result err: %v\n", err)
		return ""
	}
	return string(bs)
}

func init() {
	srcDir = *flag.String("src", "collector", "source directory")
	destDir = *flag.String("desc", "temp", "generated directory")
	flag.Parse()
}

func main() {
	if ok := PrepareDestDir(); !ok {
		return
	}
	HandleSourceDir()
	for k, v := range typeMap {
		results := PrepareResults(v)
		WriteResults(results, k)
	}
	WriteTypeIndexFile()
}

func WriteTypeIndexFile() {
	indexJson, err := json.Marshal(types)
	if err != nil {
		fmt.Printf("write index file err: %v\n", err)
	}
	err = ioutil.WriteFile(destDir+"/"+"type"+JsonSuffix, indexJson, 0644)
	if err != nil {
		fmt.Printf("write file err: %v\n", err)
		return
	}
}

func PrepareDestDir() bool {
	fmt.Printf("Prepare destination dir: %s\n", destDir)
	var err error
	if _, err = os.Stat(destDir); os.IsNotExist(err) {
		fmt.Println("Destination dir not exist, start making dir")
		err = os.Mkdir(destDir, 0777)
		if err != nil {
			fmt.Printf("Prepare destination err: %v\n", err)
			return false
		}
		fmt.Println("Detination dir Ready")
		return true
	}
	return true
}

var typeMap = make(map[string]*sync.Map)
var types = make([]string, 0)

func HandleSourceDir() {
	fmt.Printf("Start reading source dir: %s\n", srcDir)
	fs, err := ioutil.ReadDir(srcDir)
	if err != nil {
		fmt.Printf("Failed to read source dir, err: %s\n", err)
		return
	}
	for _, v := range fs {
		if !v.IsDir() {
			continue
		}
		typeMap[v.Name()] = &sync.Map{}
		types = append(types, v.Name())
	}
	for k, _ := range typeMap {
		HandleTypeDir(k)
	}
}

func HandleTypeDir(typeDir string) {
	typePath := srcDir + "/" + typeDir
	fmt.Printf("Start reading type dir: %s\n", typePath)
	dirs, err := os.ReadDir(typePath)
	if err != nil {
		fmt.Printf("Failed to read type dir, err: %v\n", err)
		return
	}
	if ok := PrepareTypeDir(typeDir); !ok {
		return
	}
	for _, item := range dirs {
		var err error
		if item.IsDir() || !strings.HasSuffix(item.Name(), JsonSuffix) {
			continue
		}
		filename := item.Name()
		fmt.Printf("current file: %s\n", filename)
		bs, err := ioutil.ReadFile(typePath + "/" + filename)
		if err != nil {
			fmt.Printf("Failed to read file %s, err: %v\n", filename, err)
			continue
		}

		var data Data
		json.Unmarshal(bs, &data)
		if err != nil {
			fmt.Printf("Unmarshal data err: %v\n", err)
			continue
		}
		HandleData(&data, filename, typeDir)
	}
}

func PrepareTypeDir(typeDir string) bool {
	fmt.Println("Prepare type dir")
	var err error
	typePath := destDir + "/" + typeDir
	if _, err = os.Stat(typePath); os.IsNotExist(err) {
		fmt.Println("Type dir not exist, start making dir")
		err = os.Mkdir(typePath, 0777)
		if err != nil {
			fmt.Printf("Prepare type dir err: %v\n", err)
			return false
		}
		fmt.Println("Type dir Ready")
		return true
	}
	return true
}

func HandleData(data *Data, filename string, t string) {
	for i, schema := range data.Schemas {
		resultMap := typeMap[t]
		r := GetResult(resultMap, schema.Name, i)
		r.Sql = schema.Sql
		r.Type = t
		SetLine(r, &schema, &data.Meta, filename)
		r.X = append(r.X, GetDateFromFilename(filename))
		r.Versions = append(r.Versions, data.Meta.Tag)
	}
}

func GetResult(resultMap *sync.Map, k string, index int) *Result {
	var v interface{}
	var ok bool
	if v, ok = resultMap.Load(k); !ok {
		v = &Result{
			Title:   k,
			Lines:   []*Line{{Name: "min"}, {Name: "max"}},
			Index:   index,
			Legends: []string{"min", "max"},
		}
		resultMap.Store(k, v)
	}
	return v.(*Result)
}

func SetLine(r *Result, schema *Schema, meta *Meta, filename string) {
	for _, l := range r.Lines {
		if l.Name == "min" {
			l.Data = append(l.Data, schema.Min)
		} else if l.Name == "max" {
			l.Data = append(l.Data, schema.Max)
		}
	}
}

func GetDateFromFilename(filename string) string {
	if len(filename) > 10 {
		return filename[0:10]
	}
	return ""
}

func PrepareResults(resultMap *sync.Map) []*Result {
	results := make([]*Result, 0)
	resultMap.Range(func(key, value interface{}) bool {
		if v, ok := resultMap.Load(key); ok {
			r := v.(*Result)
			results = append(results, r)
			return ok
		}
		return false
	})
	return results
}

func WriteResults(results []*Result, t string) {
	indexMap := make(map[int]string, 0)
	var wg sync.WaitGroup
	wg.Add(len(results))
	for _, result := range results {
		indexMap[result.Index] = result.Title + JsonSuffix
		go WriteResult(result, &wg)
	}
	wg.Wait()
	WriteIndexFile(indexMap, t)
}

func WriteResult(r *Result, wg *sync.WaitGroup) {
	defer func() {
		wg.Done()
	}()
	filepath := destDir + "/" + r.Type + "/" + r.Title + JsonSuffix
	err := ioutil.WriteFile(filepath, r.Bytes(), 0666)
	if err != nil {
		fmt.Printf("write file %s err: %v\n", filepath, err)
		return
	}
}

func WriteIndexFile(indexeMap map[int]string, t string) {
	keys := make([]int, 0, len(indexeMap))
	for k := range indexeMap {
		keys = append(keys, k)
	}
	sort.Ints(keys)
	files := make([]string, 0, len(keys))
	for _, k := range keys {
		files = append(files, indexeMap[k])
	}
	indexJson, err := json.Marshal(files)
	if err != nil {
		fmt.Printf("write index file err: %v\n", err)
	}
	err = ioutil.WriteFile(destDir+"/"+t+"/"+t+JsonSuffix, indexJson, 0644)
	if err != nil {
		fmt.Printf("write file err: %v\n", err)
		return
	}
}
