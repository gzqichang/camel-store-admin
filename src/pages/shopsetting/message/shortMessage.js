import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import {List, Card, Icon, Modal, Spin, Button, InputNumber, Form, message, Alert, Table} from 'antd';
import moment from 'moment';

@connect(({ shopsetting, loading }) => ({
  Loading: loading.models.shopsetting,
  messageSwitch: shopsetting.messageSwitch,
}))

class ShortMessage extends Component {
  state = {
    amount: 0,
    balance: 0,
    visible: false,
    qrcode: {},
    recordList: [],
    recordListCount: 0,
    page: 1,
  };

  componentDidMount() {
    this.initSwitch();
    this.initBalance();
    this.initRecord();
  }

  initSwitch = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'shopsetting/fetchMessageSwitch',
    })
  }

  initBalance = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'shopsetting/fetchBalance',
    }).then((res) => {
      this.setState({balance: res, visible: false, amount: 0})
    })
  }

  initRecord = () => {
    const {dispatch} = this.props;
    const {page} = this.state;
    dispatch({
      type: 'shopsetting/fetchMessageRecord',
      paylaod: {
        page
      }
    }).then(res => {
      if (res) {
        this.setState({
          recordList: res.results,
          recordListCount: res.count,
        })
      }
    })
  }

  handleSwitch = (item) => {
    const {dispatch} = this.props;
    const self = this;
    Modal.confirm({
      centered: true,
      title: '确定操作',
      content: (
        <Fragment>
          确定<span style={{ color: 'red' }}>{item.switch ? '关闭' : '开启'} </span>
          {item.label} 短信服务
        </Fragment>),
      onOk() {
        dispatch({
          type: 'shopsetting/setMessageSwitch',
          payload: {
            sms_type: item.sms_type,
            switch: !item.switch ? 'true' : 'false',
          }
        }).then(res => res && self.initSwitch())
      },
    })
  }

  addAmount = () => {
    const {amount} = this.state;
    const {dispatch} = this.props;
    const self = this;
    if (!amount)
      return message.error('请输入充值金额');
    dispatch({
      type: 'shopsetting/addMessageBlance',
      payload: {
        amount
      }
    }).then(res => {
      if (res && res.return_code === 'SUCCESS') {
        self.setState({
          visible: true,
          qrcode: res,
        })
      }

    });
  }

  render() {
    const {amount, balance, visible, qrcode, page, recordList, recordListCount} = this.state;
    const {Loading, messageSwitch} = this.props;

    const columns = [
      {
        title: '发送时间',
        dataIndex: 'add_time',
        key: 'add_time',
        render: (t) => t && moment(t).format('YYYY-MM-DD kk:mm')
      },
      {
        title: '接受号码',
        dataIndex: 'phone',
        key: 'phone',
      },
    ];

    const pagination = {
      pageSize: 10,
      current: page,
      total: recordListCount,
      onChange: page => {
        this.setState({ page }, () => this.initRecord());
      },
    };

    return (
      <PageHeaderWrapper>
        <Spin spinning={Loading}>
        <Card
          bordered={false}
          title={'短信服务开关'}>
          <List
            bordered
            dataSource={messageSwitch}
            renderItem={item => (
              <List.Item actions={[
                item.switch
                  ? <Icon style={{color: 'green'}} type="check-circle" theme="filled" onClick={() => this.handleSwitch(item)}/>
                  : <Icon style={{color: 'red'}} type="close-circle" theme="filled" onClick={() => this.handleSwitch(item)}/>]}>
                {item.sms_type === 'daily_remind'? '未处理订单每日提醒' : item.label}
              </List.Item>
            )}/>
        </Card>
        <Card
          style={{marginTop: 30}}
          bordered={false}
          title={'充值'}>
          <Form.Item>短信服务通知剩余：{balance} 条</Form.Item>
          <Form.Item>
            充值金额：
            <InputNumber
              min={10}
              value={amount}
              formatter={value => `${Math.ceil(value * 1)}`}
              parser={value => `${Math.ceil(value * 1)}`}
              onChange={(e) => this.setState({amount: e})}/>
            <Button style={{marginLeft: 20}} type={'primary'} onClick={this.addAmount}>充值</Button>
          </Form.Item>
          <Card
            bordered={false}
            bodyStyle={{
              borderTop: '1px solid #eee',
              marginTop: 24,
            }}
          >
            <div style={{fontSize: 16, fontWeight: 500}}>
              <p>说明</p>
            </div>
            <p>1、短信发送收费￥0.1/条</p>
            <p>2、充值逢百送十，如充值￥100，实得￥110（即1100条短信），充值￥270，实得￥290（即2900条短信），以此类推。</p>
            <p>3、每次充值金额不少于￥10的整数。</p>
          </Card>
        </Card>
        <Card
          title={'短信发送记录'}
          bordered={false}
          style={{marginTop: 30}}>
          <Table
            size={'small'}
            columns={columns}
            dataSource={recordList}
            pagination={pagination}/>
        </Card>
        <Modal
          centered
          closable={false}
          visible={visible}
          bodyStyle={{ display: 'flex',flexDirection: 'column', alignItems: 'center'}}
          title={<div style={{lineHeight: '28px', display: 'inline-flex'}}>
            <Icon style={{color: '#52c41a', fontSize: 28, marginRight: 8}} type="wechat"/>微信充值支付
          </div>}
          footer={[
            <Button
              onClick={this.initBalance}
              type={'primary'}>确定</Button>,
            <Button
              onClick={() => this.setState({visible: false})}>
              取消支付
            </Button>]}>
          <img src={qrcode.base64_qr_cde && 'data:image/png;base64,' + qrcode.base64_qr_cde}/>
          <Alert type="info" showIcon message="请用微信扫一扫支付，支付成功后点击“确定”"/>
        </Modal>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default ShortMessage;
