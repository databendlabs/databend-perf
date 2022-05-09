// Copyright 2022 Datafuse Labs.
import { FC, ReactElement, useState } from 'react';
import styles from './css/share.module.scss';
import { useMount } from 'ahooks';
import { getQuery } from '../utils/tools';
import { getGraph, getLatestByCategory } from '../api';
import * as echarts from 'echarts/core';
import {
	TooltipComponent,
	TooltipComponentOption,
	GridComponent,
	GridComponentOption,
	LegendComponent,
	LegendComponentOption,
	ToolboxComponent,
	ToolboxComponentOption,
  DataZoomComponent,
  DataZoomComponentOption
} from 'echarts/components';
import { LineChart, LineSeriesOption, BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { deviceType } from '../utils/device-type';
echarts.use([TooltipComponent, GridComponent, LineChart, BarChart, CanvasRenderer, LegendComponent, ToolboxComponent, DataZoomComponent]);
type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | GridComponentOption 
  | LineSeriesOption | LegendComponentOption 
  | DataZoomComponentOption | ToolboxComponentOption
  | BarSeriesOption
>;
interface IData {
  lines: number[];
  sql: string;
  title: string;
  version: string;
  xAxis: string[]
}
const Share: FC = (): ReactElement=> {
  const category = getQuery('category');
  const graph = getQuery('graph');
  const type = getQuery('type');
  const stateTitle = getQuery('title');
  const idTitle = `${category}-${graph}-title`;
  const idGraph = `${category}-${graph}`;
  const { isPhone } = deviceType();
  const [date, setDate] = useState('');

  useMount(()=>{
    if (category && graph) {
      const container = document.getElementById(`${idGraph}`) as HTMLElement;
      let t = document.getElementById(`${idTitle}`) as HTMLElement;
      let chart:any = echarts.init(container);

      if (type === 'line') {
        getGraph(category, graph)
        .then(graphData=>{
          if (container) {
            let {
              legend,
              lines,
              sql,
              title,
              version,
              xAxis
            } = graphData;
            lines?.map((item:any)=>{
              return item.type = type
            })
            t.innerHTML = `
              <span style='display: flex; justify-content: center'>
                <span style='font-weight: bold; padding-right: 10px;'>${title}:</span><span>${sql}</span>
              </span>
            `;
            const opt: EChartsOption = {
              legend: {
                data: legend,
                top: '15'
              },
              dataZoom: [
                {
                  type: 'inside'
                },
                {
                  type: 'slider',
                  handleIcon:
                  'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                }
              ],
              tooltip: {
                extraCssText: 'z-index: 10',
                trigger: 'axis',
                position: isPhone?['20%', '35%']: undefined,
                formatter(parames:any){
                  let str =`${parames[0].axisValue}<span style="display:inline-block;padding-left: 20px;">${version[parames[0].dataIndex]}</span></br>`;
                  parames.forEach((item:any, index:number) => {
                    str +=
                      `<div>${item.marker} ${item.seriesName}:${item.data}</div>`;
                  });
                  return str;
                }
              },
              xAxis: {
                data: xAxis,
                name: isPhone?'':'date'
              },
              yAxis: {
                name: 's'
              },
              series: lines
            }
            chart.setOption(opt)
           
            chart = null;
          }
        })
      } else {
        getLatestByCategory(category)
        .then(graphData=>{
          const { date,  results} = graphData;
          const itemData = results.find((item: IData)=> item.title === stateTitle);
          if (itemData) {
            setDate(`${date} (${itemData.version})`);
            let {
              lines,
              xAxis,
              sql
            } = itemData;
            t.innerHTML = `
              <span style='display: flex; justify-content: center'>
                <span style='font-weight: bold; padding-right: 10px;'>${stateTitle}:</span><span>${sql}</span>
              </span>
            `;
            const opt: EChartsOption = {
              xAxis: {
                type: 'category',
                data: xAxis
              },
              yAxis: {
                type: 'value',
                name: 's'
              },
              tooltip: {
                trigger: 'axis',
                extraCssText: 'z-index: 10',
                formatter(parames:any){
                  let str = '';
                  parames.forEach((item:any, index:number) => {
                    str +=
                      `<div>${item.marker} ${item.name}:${item.data}</div>`;
                  });
                  return str;
                }
              },
              series: [
                {
                  data: lines.map((data:number)=> data.toFixed(3)),
                  type: 'bar',
                  label: {
                    show: true
                  },
                  itemStyle: {
                    color: function(params:any) {
                      var colorList = ['#5470c6','#91cc75', '#fac858', '#ee6666'];
                      return colorList[params.dataIndex]
                    }
                  }
                }
              ]
            }
            chart.setOption(opt);
          }
        })
      }
    }
    
  })
  return (
    <>
      <div className={styles.content}>
        <div style={{marginBottom: '10px'}}>{date}</div>
        <div className={styles.title} id={idTitle}></div>
        <div style={{height: isPhone?'400px':'550px', width: '100%', background: '#fff'}} id={idGraph}></div>
      </div>
    </>
  );
};
export default Share;