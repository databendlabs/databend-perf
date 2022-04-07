import { FC, ReactElement, useState, useEffect } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { DatePicker, Form, Row, Col, Select, Button, message } from 'antd';
import { getApiListByCategory, getCategories, getGraph } from '../api';
import { Link } from "react-router-dom";
import * as echarts from 'echarts';
import moment from 'moment';
const { RangePicker } = DatePicker;
const { Option } = Select;
let chartInstance:any = {};
const Graphs: FC = (): ReactElement=> {
  const [category, setCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState<any>('');
  const [formRef] = Form.useForm();
  const [xAxisdate, setXAxisdate] = useState([]);
  const [isFullDate, setIsFullDate] = useState(true);
  const [filterDateObj, setFilterDate] = useState({
    filterDate: [],
    startIndex: 0,
    endIndex: -1
  });
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
  useEffect(()=>{
    if (!isFullDate) {
      getDataByFilter();
    }
  }, [isFullDate])
  async function getDataByFilter() {
    const defaultCategoryList = await getApiListByCategory(defaultCategory);
    setContainer(defaultCategoryList);
    getAllGraph(defaultCategory, defaultCategoryList, false);
  }
  async function getAllInfo(){
    let allCategory = await getCategories();
    setCategory(allCategory || []);
    if (allCategory.length>0) {
      formRef.setFieldsValue({
        category: allCategory[0]
      });
      setIsFullDate(true)
      setDefaultCategory(allCategory[0])
      const defaultCategoryList = await getApiListByCategory(allCategory[0]);
      setContainer(defaultCategoryList);
      getAllGraph(allCategory[0], defaultCategoryList, true);
    }
  }
  async function  getAllGraph(category:string, graphList:string, isFullDate: boolean) {
    const len = graphList.length;
    for (let i = 0; i < len; i++) {
      const graph = graphList[i];
      const graphData =  await getGraph(category, graph)
      i===0 && setXAxisdate(graphData?.xAxis);
      drawCharts(category, graph, graphData, i, isFullDate);
      
    }
  }
  function drawCharts(category: string,graph: string, graphData: any, i:number, isFullDate: boolean) {
    const name = `${category}-${graph}`;
    const container = document.getElementById(`${name}`) as HTMLElement;
    let chart:any = echarts.init(container);
    let {
      legend,
      lines,
      sql,
      title,
      version,
      xAxis
    } = graphData;
    if (!isFullDate){
      const { startIndex, endIndex, filterDate } = filterDateObj;
      if (filterDateObj.endIndex ===-1){
        xAxis = filterDate;
        lines.map((item:any)=>{
          item.data = item.data.slice(startIndex);
        });
        version = version.slice(startIndex);
      } else {
        xAxis = filterDate;
        lines.map((item:any)=>{
          item.data = item.data.slice(startIndex, endIndex+1);
        });
        version = version.slice(startIndex, endIndex+1);
      }
    }
    lines?.map((item:any)=>{
      return item.type = 'line'
    })
    setIsFullDate(true)
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
        name: 's'
      },
      series: lines
    });
    chart = null;
  }
  function disabledRangeTime(current:any) {
    return current > moment().add(0, 'days');
  }
  async function submit(){
    const {category, date, kind} = formRef.getFieldsValue();
    setDefaultCategory(category)
    let starDate = null;
    let endDate = null;
    if (date && date.length>1) {
      starDate = moment(date[0]).format('yyyy-MM-DD');
      endDate = moment(date[1]).format('yyyy-MM-DD');
    }
   
    const start = xAxisdate.indexOf(starDate as never);
    const end =  xAxisdate.indexOf(endDate as never);

    const startIndex = start ===-1 ? 0 : start;
    const endIndex = end;
    let realDate = [];
    if (endIndex===-1){
      realDate = xAxisdate.slice(startIndex)
    } else {
      realDate = xAxisdate.slice(startIndex, endIndex+1)
    }
    if (realDate.length<=0) {
      message.warning('There is no birth data for this time range');
      return
    }
    setIsFullDate(false)
    console.log('realDate:', xAxisdate, startIndex, endIndex, realDate)
    setFilterDate({
      filterDate: realDate,
      startIndex,
      endIndex: endIndex
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
              <RangePicker
                disabledDate={disabledRangeTime}
                style={{width: '100%'}}/>
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
              <Select>
                {category.map((item, index)=>{
                  return  <Option key={index} value={item}>{item}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
          <Button type='primary' onClick={submit}>Submit</Button>
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