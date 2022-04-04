import { FC, ReactElement, useState } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { DatePicker, Form,Row, Col, Select, Button } from 'antd';
import { getApiListByCategory, getCategories, getGraph } from '../api';
import { Link } from "react-router-dom";
import * as echarts from 'echarts';
const { RangePicker } = DatePicker;
const { Option } = Select;
let chartInstance:any = {};
const Graphs: FC = (): ReactElement=> {
  const [category, setCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState('');
  const [formRef] = Form.useForm();
  const [graphKind] = useState([
    {
      name: 'Raw',
      value: 'raw'
    }
  ]);
  const [container, setContainer] = useState([]);
  useMount(()=>{
    getAllInfo();
  });
  useUnmount(()=>{
    chartInstance = {};
  });
  async function getAllInfo(){
    let allCategory = await getCategories();
    setCategory(allCategory || []);
    if (allCategory.length>0) {
      formRef.setFieldsValue({
        category: allCategory[0]
      });
      setDefaultCategory(allCategory[0])
      const defaultCategoryList = await getApiListByCategory(allCategory[0]);
      setContainer(defaultCategoryList)
      getAllGraph(allCategory[0], defaultCategoryList);
    }
  }
  async function changeCategory(value: string) {
    setDefaultCategory(value)
    const defaultCategoryList = await getApiListByCategory(value);
    setContainer(defaultCategoryList)
    getAllGraph(value, defaultCategoryList);
  }
  async function  getAllGraph(category:string, graphList:string) {
    const len = graphList.length;
    for (let i = 0; i < len; i++) {
      const graph = graphList[i];
      const graphData =  await getGraph(category, graph)
      drawCharts(category, graph, graphData, i);
    }
  }
  function drawCharts(category: string,graph: string, graphData: any, i:number) {
    const name = `${category}-${graph}`;
    const container = document.getElementById(`${name}`) as HTMLElement;
    let chart = null;
    if (chartInstance[name]) {
      chart = chartInstance[name];
      console.log(1)
    } else {
      chart = echarts.init(container);
      chartInstance[name] = chart;
      console.log(2)
    }
    const {
      legend,
      lines,
      sql,
      title,
      version,
      xAxis
    } = graphData;
    lines?.map((item:any)=>{
      return item.type = 'line'
    })
    chart.setOption({
      legend: {
        data: legend,
        y: 'bottom'
      },
      title: {
        left: 'center',
        text:`${title}`
      },
      tooltip: {
        trigger: 'axis',
        position: function(point:any[]){
          if (i%3 == 2) {
            return 'right';
          } else if (i%3 == 1) {
            return point;
          }
          return [point[0]+10, 0];
        },
        formatter(parames:any){
          let str =`<div style="font-size: '12px';">${sql}</div>${parames[0].axisValue}<span style="display:inline-block;padding-left: 20px;">${version[parames[0].dataIndex]}</span></br>`;
          parames.forEach((item:any, index:number) => {
            str +=
               `<div>${item.marker} ${item.seriesName}:${item.data}</div>`;
          });
          return str;
        }
      },
      xAxis: {
        data: xAxis,
        name: 'date'
      },
      yAxis: {
        name: 'ms'
      },
      series: lines
    });
  }
  return ( 
    <div>
      <Form
        form={formRef}
        initialValues={
          {
            kind: "raw",
            category: defaultCategory
          }
        }
      >
        <Row gutter={10}>
          <Col span={6}>
            <Form.Item
              name="date"
              label="Date range">
              <RangePicker style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="kind"
              label="Graph kind">
              <Select>
                {graphKind.map((item, index)=>{
                  return  <Option key={index} value={item.value}>{item.name}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="category"
              label="Category">
              <Select onChange={changeCategory}>
                {category.map((item, index)=>{
                  return  <Option key={index} value={item}>{item}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
          <Button type='primary'>Submit</Button>
        </Row>
      </Form>
      <div>
        <div style={{marginBottom: '20px'}}>
          <div>See <Link to="/compare">compare page</Link> for descriptions of what the names mean.</div>
          <div>Note: pink in the graphs represent data points that are interpolated due to missing data. Interpolated data is simply the last known data point repeated until another known data point is found.</div>
        </div>
        <Row id='allChartWrap'>
            {
              container?.map((item)=>{
                return <Col span={8}  key={item} style={{marginBottom: '20px'}}>
                  <div style={{height: '300px', width: '100%'}} id={`${defaultCategory}-${item}`}>
                    {item}
                  </div>
                </Col>
              })
            } 
        </Row>
      </div>
    </div>
  );
};
export default Graphs;