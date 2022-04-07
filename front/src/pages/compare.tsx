import { FC, ReactElement, useState } from 'react';
import { useMount } from 'ahooks';
import { DatePicker, Form, Row, Col, Select, Button, message, Table, Tag } from 'antd';
import moment from 'moment';
import { getApiListByCategory, getCategories, getGraph } from '../api';
import { DATE_FORMATTER, formatterDate } from '../utils/tools';
const { Option } = Select;
const Compare: FC = (): ReactElement=> {
  const [formRef] = Form.useForm();
  const [category, setCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState<any>('');
  const [loading, setLoading] = useState(false);
  const [compareDate, setCompareDate] = useState<{
    before: string| undefined,
    after: string| undefined
  }>({
    before: undefined,
    after: undefined
  });
  const [tableData, setTableData] = useState<any>([]);
  const columns = [
    {
      title: 'benchmark',
      dataIndex: 'title',
      key: 'title',
      width: 150
    },
    {
      title: 'sql',
      dataIndex: 'sql',
      key: 'sql',
    },
    {
      title: 'min',
      dataIndex: 'min',
      key: 'min',
      render: (text:string)=> renderText(text)
    },
    {
      title: 'max',
      key: 'max',
      dataIndex: 'max',
      render: (text:string)=> renderText(text)
    },
    {
      title: 'median',
      dataIndex: 'median',
      key: 'median',
      render: (text:string)=> renderText(text)
    },
    {
      title: 'mean',
      key: 'mean',
      dataIndex: 'mean',
      render: (text:string)=> renderText(text)
    }
  ];
  useMount(()=>{
    getAllInfo();
  });
  const submit = ()=>{
    const { before, after, category } = formRef.getFieldsValue();
    let b = before;
    if (before) {
      b = formatterDate(before);
    }
    setDefaultCategory(category);
    getAllDateByCategory(b, formatterDate(after), category);
  }
  async function getAllInfo() {
    let allCategory = await getCategories();
    setCategory(allCategory || []);
    if (allCategory.length>0) {
      formRef.setFieldsValue({
        category: allCategory[0]
      });
      setDefaultCategory(allCategory[0]);
      getAllDateByCategory(undefined, undefined, allCategory[0]);
    }
  }
  async function getAllDateByCategory(before: string | undefined, after: string | undefined, category: string) {
    setLoading(true)
    try {
      const urlList = await getApiListByCategory(category);
      let data = [];
      let compareData = [];
      for (let i = 0; i < urlList.length; i++) {
        const element = urlList[i];
        const graphData =  await getGraph(category, element);
        const { lines, sql,  title, version, xAxis} = graphData;
        if (!before) {
          const [before, after] = xAxis.slice(-2);
          const [beforeVersion, afterVersion] = version.slice(-2);
          setCompareDate({
            before: `${before} (${beforeVersion})`, after: `${after} (${afterVersion})`
          })
          compareData = lines.map((item:any)=>{
            return {
              name: item.name,
              data: item.data.slice(-2)
            };
          });
          formRef.setFieldsValue({
            before: moment(before, DATE_FORMATTER),
            after: moment(after, DATE_FORMATTER)
          })
        } else {
          let beforexAxis = xAxis.indexOf(before);
          let afterxAxis = xAxis.indexOf(after);

          if (beforexAxis===-1 || afterxAxis===-1) {
            let tip: string | undefined = before;
            if (afterxAxis===-1){
              tip = after;
            }
            message.warning(`${tip} No data generated, Please select another date for comparison`);
            break;
          }
          
          setCompareDate({
            before: `${before} (${version[beforexAxis]})`, after: `${after} (${version[afterxAxis]})`
          })
          compareData = lines.map((item:any)=>{
            return {
              name: item.name,
              data: [item.data[beforexAxis], item.data[afterxAxis]]
            };
          });
        }
        data.push({
          key: title,
          title,
          sql,
          min: countGrowthRate(compareData[0].data),
          max: countGrowthRate(compareData[1].data),
          median: countGrowthRate(compareData[2].data),
          mean: countGrowthRate(compareData[3].data)
        })
      }
      
      setTableData([...data])
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  function countGrowthRate(comp: number[]){
    if (comp.length<=1) {
      return "-"
    }
    if (comp[0] - comp[1]===0) {
      return '0%';
    }
    return (((comp[1] - comp[0]) / comp[0]) * 100).toFixed(4) + '%';
  }
  function renderText(text: string) {
    let n = parseFloat(text)
    return <span style={{color: n>0?'red':'green'}}>{n>0?'+'+text:text}</span>
  }
  function disabledRangeTime(current:any) {
    return current > moment().add(0, 'days');
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
        <Row gutter={10}>
          <Col span={4}>
            <Form.Item
              name="before"
              label="Before">
              <DatePicker disabledDate={disabledRangeTime} style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="after"
              label="After">
              <DatePicker disabledDate={disabledRangeTime} style={{width: '100%'}}/>
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
          <Button type='primary' onClick={submit}>Compare</Button>
        </Row>
      </Form>
      <div style={{textAlign: 'center', marginBottom: '20px', fontWeight: 'bold'}}>
        Comparing <Tag color="#108ee9">{defaultCategory}</Tag>between <Tag color="blue">{compareDate.before || ' '}</Tag>and <Tag color="blue">{compareDate.after || ' '}</Tag>
      </div>
      <Table
        loading={loading}
        pagination={false}
        columns={columns} 
        dataSource={tableData} />
    </div>
  );
};
export default Compare;