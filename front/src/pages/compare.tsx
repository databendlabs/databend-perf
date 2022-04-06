import { FC, ReactElement, useState, useEffect } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { DatePicker, Form, Row, Col, Select, Button, message, Table } from 'antd';
import moment from 'moment';
import { getCategories } from '../api';
const { RangePicker } = DatePicker;
const { Option } = Select;
const a: FC = (): ReactElement=> {
  const [formRef] = Form.useForm();
  const [category, setCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState<any>('');
  const [graphKind] = useState([
    {
      name: 'Raw',
      value: 'raw'
    }
  ]);
  const columns = [
    {
      title: 'benchmark',
      dataIndex: 'title',
      key: 'title'
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
    },
    {
      title: 'max',
      key: 'max',
      dataIndex: 'max'
    },
    {
      title: 'median',
      dataIndex: 'median',
      key: 'median',
    },
    {
      title: 'mean',
      key: 'mean',
      dataIndex: 'mean'
    }
  ];
  
  const data = [
    {
      key: '1',
      title: 'Q1',
      sql: 'select * from ',
      min: 2.1,
      max: 2.2,
      median: 3.5,
      mean: 3.6
    }
  ];
  useMount(()=>{
    getAllInfo();
  });
  const submit = ()=>{
    
  }
  async function getAllInfo() {
    let allCategory = await getCategories();
    setCategory(allCategory || []);
    if (allCategory.length>0) {
      formRef.setFieldsValue({
        category: allCategory[0]
      });
    }
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
              name="date1"
              label="Before">
              <DatePicker style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="date2"
              label="After">
              <DatePicker style={{width: '100%'}}/>
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
      <Table 
        pagination={false}
        columns={columns} 
        dataSource={data} />
    </div>
  );
};
export default a;