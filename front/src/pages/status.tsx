import { FC, ReactElement, useState } from 'react';
import { useMount } from 'ahooks';
import { Form, Row, Col, Select, Spin } from 'antd';
import { getCategories, getLatestByCategory } from '../api';
import * as echarts from 'echarts';
const { Option } = Select;
const Status: FC = (): ReactElement=> {
  const [formRef] = Form.useForm();
  const [category, setCategory] = useState([]);
  const [container, setContainer] = useState<any>([]);
  const [defaultCategory, setDefaultCategory] = useState<any>('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  useMount(()=>{
    getAllInfo();
  });
  async function getAllInfo() {
    let allCategory = await getCategories();
    setCategory(allCategory || []);
    if (allCategory.length>0) {
      formRef.setFieldsValue({
        category: allCategory[0]
      });
      getLatest((allCategory[0]));
    }
  }

  async function getLatest(category: string){
    setLoading(true);
    try {
      setDefaultCategory(category);
      let {date, results} = await getLatestByCategory(category);
      setDate(date);
      setContainer(results);
      getAllGraph(category, results)
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }
  function getAllGraph(category: string, results: any){
    console.log(results)
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      drawChart(element, category, i)
    }
    
  }
  function drawChart(element: any, category: string, i:number) {
    const name = `${category}-${element.title}`;
    const container = document.getElementById(`${name}`) as HTMLElement;
    let chart:any = echarts.init(container);
    chart.setOption({
      xAxis: {
        type: 'category',
        data: element.xAxis
      },
      title: {
        left: 'center',
        text:`${element?.title}`
      },
      yAxis: {
        type: 'value',
        name: 'ms'
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
          let str =`<div style="font-size: '12px';">${element.sql}</div><span style="display:inline-block;">${element.version}</span></br>`;
          parames.forEach((item:any, index:number) => {
            str +=
              `<div>${item.marker} ${item.name}:${item.data}</div>`;
          });
          return str;
        }
      },
      series: [
        {
          data: element.lines.map((data:number)=> data.toFixed(4)),
          type: 'line',
          itemStyle: {
            normal: {
              label: {
                show: true
              }
            }
          }
        }
      ]
    });
  }
  return (
    <div>
      <Form
        form={formRef}
        initialValues={
          {
            category: defaultCategory
          }
        }
      >
      <Row gutter={20}>
        <Col span={4}>
          <Form.Item
            name="category"
            label="Category">
            <Select
              onChange={getLatest}
            >
              {category.map((item, index)=>{
                return  <Option key={index} value={item}>{item}</Option>
              })}
            </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
           <Form.Item label="Latest">
            <span>{date} ({container && container.length>0 && container[0].version})</span>
           </Form.Item>
          </Col>
        </Row>
      </Form>
      <Spin spinning={loading}>
        <Row style={{minHeight: '400px'}}>
          {
            container?.map((item:any)=>{
              return <Col span={8}  key={item.title} style={{marginBottom: '20px'}}>
                <div style={{height: '300px', width: '100%'}} id={`${defaultCategory}-${item.title}`}></div>
              </Col>
            })
          } 
        </Row>
      </Spin>
    </div>
  );
};
export default Status;