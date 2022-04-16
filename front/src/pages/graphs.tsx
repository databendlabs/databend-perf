import { FC, ReactElement, useState, useEffect, useRef } from 'react';
import { useMount } from 'ahooks';
import { DatePicker, Form, Row, Col, Select, Button, message, Tag } from 'antd';
import { getApiListByCategory, getCategories, getGraph } from '../api';
import { Link } from "react-router-dom";
import * as echarts from 'echarts';
import moment from 'moment';
import { formatterDate } from '../utils/tools';
import styles from './css/styles.module.scss';
import { deviceType } from '../utils/device-type';
import ShareButton from '../componnent/ShareButton';
const { RangePicker } = DatePicker;
const { Option } = Select;
const Graphs: FC = (): ReactElement=> {
  const { isPhone } = deviceType();
  const [category, setCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState<any>('');
  const [formRef] = Form.useForm();
  const [xAxisdate, setXAxisdate] = useState([]);
  const [isFullDate, setIsFullDate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState('');
  const dateRef = useRef(null);
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
  // const [cacheCategory, setcaCheCategory] = useLocalStorageState("CATEGORY")
  useMount(()=>{
    getAllInfo();
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
    const { types: allCategory, env } = await getCategories();
    setEnvironment(env);
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
    setLoading(true)
    try {
      for (let i = 0; i < len; i++) {
        const graph = graphList[i];
        getGraph(category, graph)
          .then((graphData)=>{
            i===0 && setXAxisdate(graphData?.xAxis);
            drawCharts(category, graph, graphData, i, isFullDate);
          })
      }
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  function drawCharts(category: string,graph: string, graphData: any, i:number, isFullDate: boolean) {
    const name = `${category}-${graph}`;
    const container = document.getElementById(`${name}`) as HTMLElement;
    if (container) {
      let t = document.getElementById(`${name}-title`) as HTMLElement;
      let chart:any = echarts.init(container);
      let {
        legend,
        lines,
        sql,
        title,
        version,
        xAxis
      } = graphData;
      t.innerHTML = `
        <span style='display: flex;'>
          <span style='font-weight: bold; padding-right: 10px;'>${title}:</span><span style="font-size: 12px;">${sql}</span>
        </span>
      `;
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
          y: '10'
        },
        dataZoom: [
          {
            type: 'inside',
            zoomLock: true,
            moveOnMouseMove: true,
            preventDefaultMouseMove: false,
            zoomOnMouseWheel: false,
          },
          {
            type: 'slider',
            handleIcon:
            'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }
        ],
        tooltip: {
          extraCssText: 'z-index: 10',
          trigger: 'axis',
          position: isPhone?['20%', '-30%']: undefined,
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
      });
      chart = null;
    }
  }
  function disabledRangeTime(current:any) {
    return current > moment().add(0, 'days');
  }
  async function submit(){
    const {category, date, kind} = formRef.getFieldsValue();
    setDefaultCategory(category)
    let starDate = null;
    let endDate = null;
    let newStart: null |string|number = starDate;
    if (date && date.length>1) {
      starDate = formatterDate(date[0]),
      endDate = formatterDate(date[1])

      /*newStart = starDate;
      let i  = 0;
      while(xAxisdate.indexOf(newStart as never) === -1) {
        newStart = moment(newStart).add(1, 'd').format('yyyy-MM-DD');
        i++;

        if (endDate && new Date(newStart).getTime() > new Date(endDate).getTime()) {
          newStart = starDate;
          break;
        }
      }

      starDate = newStart;*/
    }
   
    const start = xAxisdate.indexOf(starDate as never);
    const end =  xAxisdate.indexOf(endDate as never);
    // console.log(newStart)
    const startIndex = start ===-1 ? 0 : start;
    const endIndex = end;
    let realDate = [];
    if (endIndex===-1){
      realDate = xAxisdate.slice(startIndex)
    } else {
      realDate = xAxisdate.slice(startIndex, endIndex+1)
    }
    if (realDate.length<=0) {
      message.warning('No data was generated for this time range');
      return
    }
    setIsFullDate(false)
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
          <Col span={isPhone?24:6}>
            <Form.Item
              name="date"
              label="Date range">
              <RangePicker
                inputReadOnly
                ref={dateRef}
                disabledDate={disabledRangeTime}
                style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={isPhone?12:4}>
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
          <Col span={isPhone?12:4}>
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
          <Button style={isPhone?{width: '100%', marginBottom: '20px'}:{width: 'auto'}} loading={loading} type='primary' onClick={submit}>Submit</Button>
        </Row>
      </Form>
      <div>
        <div style={{marginBottom: '20px'}}>
          <div>See <Link to="/compare">compare page</Link> for descriptions of what the names mean.</div>
          <Tag style={{marginTop: '5px'}} color="blue">Environment: {environment}</Tag>
        </div>
        <Row className={styles.allChartWrap} id='allChartWrap' gutter={10}>
            {
              container?.map((item)=>{
                return <Col span={isPhone?24:8}  key={item} style={{marginBottom: '20px'}}>
                        <div className={styles.content}>
                          <div className={styles.title} id={`${defaultCategory}-${item}-title`}></div>
                          <div style={{height: '340px', width: '100%', background: '#fff'}} id={`${defaultCategory}-${item}`}></div>
                          <ShareButton category={defaultCategory} graph={item}></ShareButton>
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