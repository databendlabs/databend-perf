import { FC, ReactElement, useState } from 'react';
import { useMount } from 'ahooks';
import { Form, Row, Col, Select, Spin } from 'antd';
import { getCategories, getLatestByCategory } from '../api';
import * as echarts from 'echarts';
import styles from './css/styles.module.less';
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
    const { types: allCategory } = await getCategories();
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
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      drawChart(element, category, i)
    }
    
  }
  function drawChart(element: any, category: string, i:number) {
    const name = `${category}-${element.title}`;
    const container = document.getElementById(`${name}`) as HTMLElement;
    let chart:any = echarts.init(container);
    let t = document.getElementById(`${name}-title`) as HTMLElement;
    const { xAxis, title, lines, sql} = element;
    t.innerHTML = `
        <span style='display: flex'>
          <span style='font-weight: bold; padding-right: 10px;'>${title}:</span><span>${sql}</span>
        </span>
      `;
    chart.setOption({
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
          itemStyle: {
            normal: {
              label: {
                show: true
              },
              color: function(params:any) {
                var colorList = ['#5470c6','#91cc75', '#fac858', '#ee6666'];
                return colorList[params.dataIndex]
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
        <Row className={styles.allChartWrap} style={{minHeight: '400px'}} gutter={10}>
          {
            container?.map((item:any)=>{
              return <Col span={8}  key={item.title} style={{marginBottom: '20px'}}>
                        <div className={styles.content}>
                          <div className={styles.title} id={`${defaultCategory}-${item.title}-title`}></div>
                          <div style={{height: '300px', width: '100%'}} id={`${defaultCategory}-${item.title}`}></div>
                        </div>
                      </Col>
            })
          } 
        </Row>
      </Spin>
    </div>
  );
};
export default Status;