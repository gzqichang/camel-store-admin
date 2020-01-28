import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import {
  Button,
  Card,
  Table,
  Modal,
  Form,
  Select,
  message,
  Icon,
  Input } from 'antd'
import styles from './rolelist.less'

const Option = Select.Option;
const FormItem = Form.Item;
const dataSource = []
for(var i=0;i<5;i++){
  dataSource.push({
      key:`${i}`,
      num: '20180930122225656',
      name: '四季酒店房券',
      standard: '珠海中邦艺术酒店标准双床房',
      orderstatus:'待付款'
    })
}

class Rolelist extends Component {

  columns = [{
      title: '订单号',
      dataIndex: 'num',
      key: 'num',
    }, {
      title: '商品名',
      dataIndex: 'name',
      key: 'name'
    }, {
      title: '规格',
      dataIndex: 'standard',
      key: 'standard',
    },{
      title: '订单状态',
      dataIndex: 'orderstatus',
      key: 'orderstatus',
  },{
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    render: (text, record) => (
       <span onClick={() => this.toEditpage(record.name)}>
         <a href="javascript:;">编辑(Edit)</a>
       </span>
   )
  }];

  toEditpage = (name) =>{
    this.props.history.push("/setting/editrole");
  }

  render(){
    return(
      <PageHeaderWrapper>
      <Card className={styles.main}>
        <Form layout="inline" className={styles.editform}>
          <FormItem label="订单编号">
            <Input placeholder="请输入订单编号"/>
          </FormItem>
          <FormItem label="订单编号">
            <Select defaultValue="待付款" style={{ width: 150 }}>
              <Option value="待付款">待付款</Option>
              <Option value="待发货">待发货</Option>
              <Option value="待收货">待收货</Option>
              <Option value="已收货">已收货</Option>
              <Option value="已失效">已失效</Option>
            </Select>
          </FormItem>
          <FormItem>
            <Button type="primary">查询</Button>
          </FormItem>
        </Form>
        <Table dataSource={dataSource} columns={this.columns}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Rolelist
