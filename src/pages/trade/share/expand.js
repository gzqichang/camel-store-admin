import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  InputNumber,
  Form,
  Button,
  Card,
  Spin,
  message,
  Row,
  Col
} from 'antd'
import styles from '../trade.less'

const FormItem = Form.Item;

@connect(({ trade, global }) => ({
  bonus_switch:global.bonus_switch,
  rebate_switch:global.rebate_switch,
  bonus:trade.bonus,
  rebate:trade.rebate
}))
class Expand extends Component {
  state = {
    bonus:null,
    rebate:null,
    expandLoading:false
  };

  componentDidMount(){
    this.init()
  }
  init = () => {
    const { dispatch } = this.props
    this.setState({ expandLoading:true })
    dispatch({
      type:'trade/getExpandData'
    }).then((res) => {
      this.setState({
        bonus:res.bonus,
        rebate:res.rebate,
        expandLoading:false
      })
    })
  }

  handleSubmit = () => {
    const { dispatch } = this.props
    const { bonus, rebate } = this.state
    this.setState({ expandLoading:true })
    dispatch({
      type: 'trade/setExpandData',
      payload: {
        bonus,
        rebate
      }
    }).then(() => {
      message.success('修改成功')
      this.setState({ expandLoading:false })
    }).catch(() => {
      message.error('修改失败')
      this.setState({ expandLoading:false })
    })
  }

  render(){
    const { rebate, expandLoading } = this.state
    const { rebate_switch } = this.props
    const formItemLayout = {
      labelCol: { sm:{ span: 8 }, lg: { span: 7 } },
      wrapperCol: { sm:{ span: 16 },lg: { span: 17 } },
    };

    return(
      <PageHeaderWrapper >
        <Spin spinning={expandLoading}>
        <Card className={styles.main}>
          { rebate_switch ?
          <Form className={styles.editform}>
            <FormItem label="商品推广返利门槛（元）" required {...formItemLayout}
                      help="例：输入88，则用户在商城消费满88元可获得商品分享返利特权">
              <InputNumber
                min={0}
                step={1}
                value={rebate}
                style={{width:'100%'}}
                onChange={(e) => this.setState({rebate:e})}
              />
            </FormItem>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type='primary' style={{ marginLeft: 8 }} onClick={this.handleSubmit}>保存</Button>
              </Col>
            </Row>
          </Form>
          : <span>您没有开启分享返利功能</span> }

        </Card>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default Expand
