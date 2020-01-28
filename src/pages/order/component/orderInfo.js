import React, { Component, Fragment } from 'react';
import moment from 'moment';
import Link from 'umi/link';
import styles from '../orderlist.less';
import { Button, Card, Form, Input, Spin, Table } from 'antd';
import { connect } from 'dva';

const formItemLayout = {
  labelCol: { md: { span: 6 }, lg:{ span: 4 }, xxl:{ span: 2 } },
  wrapperCol: { md: { span: 18 }, lg:{ span: 18 }, xxl:{ span: 20 } },
};
const FormItem = props => <Form.Item {...formItemLayout} {...props} />;
const orderstatus_group = {
  paying: '待付款',
  'has paid': '待发货',
  receiving: '待收货',
  done: '交易成功',
  close: '交易关闭',
  groupbuy: '拼团中'
};

@connect(({ costom, finance, loading }) => ({
  shopid: global.shopid,
}))
class orderInfo extends Component {
  state = {
    edit_order: false,
    singerform: {},
    onLoading: false,
    order_sn: '',
    accountLogs: [],
    accountCount: 0,
    acc_page: 1,
    acc_columns: [],
    creditLogs: [],
    creditCount: 0,
    cred_page: 1,
    cred_columns: []
  }

  componentDidMount(){
    this.setState({
      acc_columns: this.changeColumn('asset'),
      cred_columns: this.changeColumn('credit'),
    })
  }

  fetchAccountData = (page) => {
    const { dispatch, formdata } = this.props;
    const { acc_page } = this.state;
    dispatch({
      type: 'finance/fetchaccountlogList',
      payload: { type: 'accountlog',
        data:{
          page: page || acc_page,
          number:formdata && formdata.order_sn || formdata.ptgroup_no
        }
      }
    }).then((res) => {
      if(res){
        this.setState({ accountLogs: res.results, accountCount: res.count })
      }
    })
  }
  fetchCreditData = (page) => {
    const { dispatch, formdata } = this.props;
    const { cred_page } = this.state;
    dispatch({
      type: 'finance/fetchaccountlogList',
      payload: { type: 'creditlog',
        data:{
          page: page || cred_page,
          number:formdata && formdata.order_sn || formdata.ptgroup_no
        }
      }
    }).then((res) => {
      if(res) {
        this.setState({ creditLogs: res.results, creditCount: res.count  })
      }
    })
  }

  changeColumn = (type) => {
    return [
      {
        title: '返利用户',
        dataIndex: 'user_info',
        key: 'user_info',
        render: (t) => <Link to={{pathname:'/user/userlist/edituser',query:{id:t.id} } }>
          <img src={t.avatar_url} width="30"/>
          <span style={{marginLeft: 10, color:'rgba(0,0,0,0.56)'}}>{t.nickname}</span>
          </Link>
      },
      {
        title: '变动金额',
        dataIndex: type,
        key: type,
        render: (t) => t.toString()[0] === '+'
          ? <span style={{color:'orange'}}>{t} {type === 'credit' ? '积分' : '元'}</span>
          : <span style={{color:'red'}}>{t} {type === 'credit' ? '积分' : '元'}</span>
      },
      {
        title: '日期时间',
        dataIndex: 'add_time',
        key: 'add_time',
        render: (t) => moment(t).format('YYYY-MM-DD kk:mm:ss')
      },
    ]
  }

  componentDidUpdate(preprops,prestate){
    const { singerform, formdata, ordertype } = this.props
    if(singerform && singerform.url && this.state.singerform.url !== singerform.url){
      this.setState({ singerform })
    }
    if(ordertype !=='pt' && ordertype !== 'repl'
      && formdata.order_sn && this.state.order_sn !== formdata.order_sn){
      this.setState({ order_sn:formdata.order_sn })
      this.fetchAccountData()
      this.fetchCreditData()
    }
    if(ordertype ==='pt'
      && formdata.ptgroup_no && this.state.order_sn !== formdata.ptgroup_no){
      this.setState({ order_sn:formdata.ptgroup_no })
      this.fetchAccountData()
      this.fetchCreditData()
    }
  }

  singerHandle = (e, key) => {
    const { singerform } = this.state;
    singerform[key] = e.target.value;
    this.setState({ singerform });
  };

  orderhandle = key => {
    const { singerform } = this.state;
    const { formdata } = this.props
    if (key === 0) {
      this.setState({ singerform: formdata.delivery_address, edit_order: false });
    } else {
      this.setState({ onLoading: true, edit_order: false });
      this.handlesubmit(singerform.url);
    }
  };

  handlesubmit = (url) => {
    let { singerform } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'costom/_patchUrlData',
      payload: {
        url ,
        data: {
          ...singerform
        },
      },
    })
      .then(res => {
        this.setState({ onLoading: false });
      })
      .catch(() => {
        this.setState({ onLoading: false });
      });
  };

  conversionObject() {
    const { formdata, ordertype } = this.props;
    return {
      formdata,
      ordertype
    };
  }

  render() {
    const { formdata, ordertype } = this.conversionObject();
    const { edit_order, singerform, onLoading,
      accountLogs, acc_columns, acc_page, accountCount,
      creditLogs, cred_columns, cred_page, creditCount } = this.state
    const acc_pagination = {
      pageSize: 10,
      current: acc_page,
      total: accountCount,
      onChange: page => {
        this.setState({ acc_page: page });
        this.fetchAccountData(page)
      },
    };

    const cred_pagination = {
      pageSize: 10,
      current: cred_page,
      total: creditCount,
      onChange: page => {
        this.setState({ cred_page: page });
        this.fetchCreditData(page)
      },
    };

    return(
      <Fragment>
        {ordertype !== 'pt' &&
          <Fragment>
            <Card className={styles.main} title="订单信息">
              <Form className={styles.editform}>
                <FormItem label="订单编号">
                  <span>{formdata.order_sn}</span>
                </FormItem>
                <FormItem label="微信用户">
                  <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: formdata.user_info && formdata.user_info.id }} }>
                    <img src={formdata.user_info && formdata.user_info.avatar_url} width="30" height="30" alt="" />
                    <span style={{marginLeft:10}}>{formdata.user_info && formdata.user_info.nickname}</span>
                  </Link>
                </FormItem>
                <FormItem label="下单时间">
                  <span>{formdata.add_time && moment(formdata.add_time).format('YYYY-MM-DD kk:mm:ss')}</span>
                </FormItem>
                <FormItem label="支付时间">
                <span>
                  {formdata.pay_time &&
                  moment(formdata.pay_time).format('YYYY-MM-DD kk:mm:ss')}
                </span>
                </FormItem>
                <FormItem label="下单门店">
                <span>
                  {formdata.shop_info && formdata.shop_info.name}
                </span>
                </FormItem>
                <FormItem label="配送门店">
                <span>
                  {formdata.entrust_shop_info && formdata.entrust_shop_info.name || formdata.shop_info &&formdata.shop_info.name}
                </span>
                </FormItem>
                {ordertype === 'ord' ?
                  <FormItem label="订单状态">
                    <span>{orderstatus_group[formdata.status]}</span>
                  </FormItem>
                  : null
                }
                {formdata.status === 'paying' ? null : (
                  ordertype === 'repl' ?
                    <FormItem label="积分支付">
                      <span> {formdata.real_amount || 0} 积分</span>
                    </FormItem> :
                    <Fragment>
                      <FormItem label="会员钱包支付">
                        <span>￥ {Number(formdata.wallet_pay).toFixed(2)}</span>
                      </FormItem>
                      <FormItem label="微信付款金额">
                        <span>￥ {formdata.real_amount}</span>
                      </FormItem>
                    </Fragment>
                )}
                <FormItem label="微信支付流水号">
                  <span>{formdata.trade_no}</span>
                </FormItem>
                <FormItem label="备注">
                  <span>{formdata.remark}</span>
                </FormItem>
              </Form>
            </Card>
            {!formdata.fictitious &&
            <Spin tip="操作中" spinning={onLoading}>
              <Card
                className={styles.main}
                title="收货地址信息"
                extra={
                  edit_order ? (
                    <Fragment>
                      <Button onClick={() => this.orderhandle(0)}>取消</Button>
                      <Button
                        type="primary"
                        style={{ marginLeft: 8 }}
                        onClick={() => this.orderhandle(1)}
                      >
                        保存
                      </Button>
                    </Fragment>
                  ) : (
                    <Button
                      type="primary"
                      style={{ marginLeft: 8 }}
                      onClick={() => this.setState({ edit_order: true })}
                    >
                      编辑
                    </Button>
                  )
                }
              >
                <Form className={styles.editform}>
                  <FormItem label="收货人">
                    {edit_order ? (
                      <Input
                        value={singerform.sign_name}
                        autoComplete="false"
                        style={{ width: 400 }}
                        onChange={e => this.singerHandle(e, 'sign_name')}
                      />
                    ) : (
                      <span>{singerform.sign_name}</span>
                    )}
                  </FormItem>
                  <FormItem label="联系电话">
                    {edit_order ? (
                      <Input
                        value={singerform.mobile_phone}
                        autoComplete="false"
                        style={{ width: 400 }}
                        onChange={e => this.singerHandle(e, 'mobile_phone')}
                      />
                    ) : (
                      <span>{singerform.mobile_phone}</span>
                    )}
                  </FormItem>
                  <FormItem label="收货地址">
                    {edit_order ? (
                      <Input.TextArea
                        value={singerform.address_info}
                        autoComplete="false"
                        autosize={{ minRows: 4 }}
                        style={{ width: 400 }}
                        onChange={e => this.singerHandle(e, 'address_info')}
                      />
                    ) : (
                      <span>{singerform.address_info}</span>
                    )}
                  </FormItem>
                </Form>
              </Card>
            </Spin>
            }
            <Card className={styles.main} title="发票信息" style={{marginBottom:0}}>
              <Form className={styles.editform}>
                <FormItem label="抬头">
                  <span>{formdata.invoice && formdata.invoice.title}</span>
                </FormItem>
                <FormItem label="纳税人识别号">
                  <span>{formdata.invoice && formdata.invoice.taxNumber}</span>
                </FormItem>
              </Form>
            </Card>
          </Fragment>
        }
        {ordertype !== 'repl' && ordertype !== 'sub' &&
        <Fragment>
            {ordertype !== 'pt' &&
            <Card title="分销返利记录" style={{ marginTop: 20 }}>
              <Table
                size="small"
                columns={acc_columns}
                dataSource={accountLogs}
                pagination={acc_pagination}/>
            </Card>
            }
            <Card title="分享积分记录" style={{marginTop:20}}>
              <Table
                size="small"
                columns={cred_columns}
                dataSource={creditLogs}
                pagination={cred_pagination}/>
            </Card>
          </Fragment>
        }
      </Fragment>
    )
  }

}

export default orderInfo
