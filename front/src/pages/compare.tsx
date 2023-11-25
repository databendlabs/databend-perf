import { FC, ReactElement, useState } from 'react';
import { useMount } from 'ahooks';
import { DatePicker, Form, Row, Col, Select, Button, message, Table, Tag } from 'antd';
import moment from 'moment';
import { getApiListByCategory, getCategories, getGraph } from '../api';
import { DATE_FORMATTER, formatterDate } from '../utils/tools';
import { deviceType } from '../utils/device-type';
import styles from './css/compare.module.scss';
import clsx from 'clsx';
const { Option } = Select;
const Compare: FC = (): ReactElement=> {
  const { isPhone } = deviceType();
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
  const columns:any = [
    {
      title: 'benchmark',
      dataIndex: 'title',
      key: 'title',
      fixed: 'left'
    },
    {
      title: 'sql',
      dataIndex: 'sql',
      key: 'sql',
      render(text: string) {
        return <span className="g-ellipsis5" title={text} style={{fontSize: '12px'}}>{text}</span>
      },
      fixed: 'left'
    },
    {
      title: 'min',
      dataIndex: 'min',
      key: 'min'
    },
    {
      title: 'max',
      key: 'max',
      dataIndex: 'max'
    },
    {
      title: 'median',
      dataIndex: 'median',
      key: 'median'
    },
    {
      title: 'mean',
      key: 'mean',
      dataIndex: 'mean'
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
    const { types: allCategory } = await getCategories();
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
          // const [beforeVersion, afterVersion] = version.slice(-2);
          setCompareDate({
            before: `${before}`, after: `${after}`
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
            message.warning(`${tip} ${title} No data generated, Please select another date for comparison`);
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
    if (comp.length<=1 || comp[0] === 0) {
      return "-"
    }
    if (comp[0] - comp[1]===0) {
      return '0%';
    }
    const d = ((comp[1] / comp[0]-1)*100);
    const s = d.toFixed(2);
    return <span 
            style={{color: d>0?'red':'green', whiteSpace: 'nowrap'}}>
            {'(' + comp[0].toFixed(3) + 's) '+ ((d>0?'+'+s: s ))+ '%' + ' (' + comp[1].toFixed(3) + 's)'}
          </span>;
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
          <Col span={isPhone?12:4}>
            <Form.Item
              name="before"
              label="Before">
              <DatePicker inputReadOnly disabledDate={disabledRangeTime} style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={isPhone?12:4}>
            <Form.Item
              name="after"
              label="After">
              <DatePicker inputReadOnly disabledDate={disabledRangeTime} style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={isPhone?24:4}>
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
          <Button style={isPhone?{width: '100%', marginBottom: '20px'}:{width: 'auto'}} type='primary' onClick={submit}>Compare</Button>
        </Row>
      </Form>
      <div className={styles.compareTitle}>
          <div> Comparing <Tag color="#108ee9">{defaultCategory}</Tag>between <Tag color="blue">{compareDate.before || ' '}</Tag>and <Tag color="blue">{compareDate.after || ' '}</Tag></div>
          <div className={styles.tips}>
            <span className={clsx(styles.improvement, styles.commonli)}>
              <i></i>
              <span>Performance increase</span>
            </span>
            <span className={clsx(styles.degradation, styles.commonli)}>
              <i></i>
              <span>Performance drop</span>
            </span>
            <br data-phone></br>
            <span>
              Show: (before) rate (after)
            </span>
          </div>
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