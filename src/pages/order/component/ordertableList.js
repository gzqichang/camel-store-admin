import React, { Component, Fragment } from 'react';
import moment from 'moment';
import tixing from '@/assets/tixing.svg';
import {Divider, Modal, Table, Tooltip, Form,message, Select, Button} from 'antd';
import Link from 'umi/link';
import GoodInfoTable from './goodInfoTable';
import PropTypes from 'prop-types';
import { connect } from 'dva';

const status_group = {
  paying: '待付款',
  'has paid': '待发货',
  receiving: '待收货',
  done: '交易成功',
  close: '交易关闭',
};
const substatus_group = {
  paying: '待付款',
  serving: '服务中',
  done: '已完成',
  close: '已关闭',
};
const statusText = {
  ord: 'has paid',
  sub: 'serving',
  repl: 'has paid'
}
const tailFormItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 8 }, },
  wrapperCol: { xs: { span: 24 }, sm: { span: 16 }, },
};
const FormItem = props => <Form.Item {...tailFormItemLayout} {...props}/>

@connect(({ order, global, loading }) => ({
  loading: loading.models.order,
}))
class ordertableList extends Component {
  state = {
    express: [],
    own:[],
    buyer: [],
    rowdata:{},
    rowdataid: '',
    visible: false,
    detailform: {},
    detailVisible: false,
    count: 0,
    loading: null,
    loadingExport: false,
    checkExport: true,
    loadingQuery: false,
    expressCompany: '',
    rowSelection: [],
    selectedRowKeys: [],
  }

  initData = () => {
    const { initData } = this.props
    if(initData){
      initData()
    }
  }

  componentDidUpdate(){
    const { dataSource, loading } = this.props;
    const { count ,checkExport} = this.state
    if(loading !== this.state.loading){
      this.setState({ count: 0, loading })
    }
    if(loading && !checkExport){
      this.setState({ checkExport: true })
    }
    if(dataSource.length > 0 && count < 20){
      this.timer = setTimeout(() => {
        this.setState({ count: count + 1 })
      },400)
    }
    else{
      clearTimeout(this.timer)
    }
  }

  componentWillUnmount(){
    clearTimeout(this.timer)
  }

  //点击“发货”
  openTable = (record) => {
    let express = [], own = [], buyer = []
    record.items && record.items.map(item => {
      if(item.goods_backup.delivery_method === 'express'){
        express.push(item)
      }
      else if(item.goods_backup.delivery_method === 'own'){
        own.push(item)
      }
      else if(item.goods_backup.delivery_method === 'buyer'){
        buyer.push(item)
      }
    })

    this.setState({ rowdata:record,visible:true, rowdataid:record.id, express, own, buyer })
  }

  //确认关闭弹窗后
  okHandle = () => {
    this.setState({ visible: false })
    const { OKhandle } = this.props
    if(OKhandle){
      OKhandle()
    }
  }

  showDetail = (record) => {
    this.setState({ detailVisible: true, detailform:{...record} })
  }

  freshOrder = (order_sn) => {
    const { dispatch } = this.props
    if (order_sn) {
      dispatch({
        type: 'order/updateOrderPay',
        payload: {
          order_sn
        },
      }).then(res => {
        if (res) {
          message.success('刷新完成，请重新获取数据')
        }
      })
    }
  }

  conversionObject() {
    const { dataSource, pagination, path = '', goodtype, location } = this.props;
    return {
      dataSource,
      pagination,
      path,
      goodtype,
      location
    };
  }

  render() {
    const { dataSource, pagination, path, goodtype } = this.conversionObject();
    const { express, own, buyer, rowdataid, rowdata, detailVisible, visible, detailform,expressCompany,selectedRowKeys,loadingQuery,checkExport } = this.state
    const { loading, scroll } = this.props;
    const wh = window.screen.height

    //普通订单column
    const usualcolumns = [
      {
        title: '订单号',
        dataIndex: 'order_sn',
        key: 'order_sn',
        width:250,
        render: (t,{items}) => {
          let content = t;
          let code = [];
          if (items) {
            items.map(({delivery_info}) => {
              if (delivery_info) {
                const {buyer_code, buyer_no} = delivery_info;
                if (buyer_code && buyer_no)
                  code.push(`自提号：${buyer_no}，自提码：${buyer_code}`)
              }
            });
          }
          return (
            <Fragment>
              {content}
              {code.map(item => <div>{item}</div>)}
            </Fragment>
          )
        },
      },
      {
        title: '商品-规格',
        dataIndex: 'goods_backup',
        key: 'goods_backup',
        render: t => (
          <Fragment>
            {t.map(item => {
              return <div>{item.goods_name + '-' + item.gtype_name + '*' + item.num}</div>;
            })}
          </Fragment>
        ),
      },
      {
        title: goodtype === 'repl' ? '订单积分' : '订单金额',
        dataIndex: 'order_amount',
        key: 'order_amount',
        render: (t,r) => (t * 1 + r.postage_total * 1).toFixed(2)
      },
      {
        title: '下单时间',
        dataIndex: 'add_time',
        key: 'add_time',
        render: t => (t ? moment(t).format('YYYY-MM-DD kk:mm:ss') : null),
      },
      {
        title: '微信用户',
        dataIndex: 'user_info',
        key: 'user_info',
        align: 'left',
        render: (t) => (
          <Fragment>
            <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: t.id }} }>
              <img src={t.avatar_url} width="30" height="30" alt="" />
              <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
                overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
              {t.nickname}
            </span>
            </Link>
          </Fragment>
        ),
      },
      {
        title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width:100,
        render: (t,r) => <span>{goodtype === 'sub' ? substatus_group[t] : status_group[t]}{ t === 'paying' && <a onClick={() => this.freshOrder(r.order_sn)}>(刷新)</a> }</span>,
      },
    ];

    //线下支付column
    const outusualcolumns = [
      {
        title: '订单号',
        dataIndex: 'order_sn',
        key: 'order_sn',
      },
      {
        title:'订单金额',
        dataIndex: 'order_amount',
        key: 'order_amount',
      },
      {
        title:'会员钱包扣款额',
        dataIndex: 'wallet_pay',
        key: 'wallet_pay',
        render: (t) => Number(t) === 0 ? '--' : t  //.status === 'close' ? '--' : t
      },
      {
        title:'微信支付金额',
        dataIndex: 'real_amount',
        key: 'real_amount',
        render: (t) => Number(t) === 0 ? '--' : t
      },
      {
        title: '订单支付时间',
        dataIndex: 'pay_time',
        key: 'pay_time',
        render: t => (t ? moment(t).format('YYYY-MM-DD kk:mm:ss') : '--'),
      },
      {
        title: '微信用户',
        dataIndex: 'user_info',
        key: 'user_info',
        align: 'left',
        render: (t,r) => (
          <Fragment>
            <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: t.id }} }>
              <img src={t.avatar_url} width="30" height="30" alt="" />
              <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
                overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
              {t.nickname}
            </span>
            </Link>
          </Fragment>
        ),
      },
      {
        title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        render: t => status_group[t]
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width: 60,
        render: (t,r) => <a onClick={() => this.showDetail(r)}>详情</a>
      }
    ];

    //订阅订单column
    const subcolumn = [
      {
        title: '下次配送时间',
        dataIndex: 'next_send',
        key: 'next_send',
        width: 150,
        render: (t,r) => (t ?
            <Fragment>
              {moment(t).format('YYYY-MM-DD')}{' '}
              {r.status === statusText[goodtype]
                ? (moment().add(1,'days') >= moment(t)
                  ? <Tooltip placement="top"
                             title={moment().subtract(1,'days') < moment(t) ? "订单即将到期，请及时处理" : "订单已到期，请及时处理" }
                             arrowPointAtCenter>
                    <img style={{ width:20, marginLeft: '5px'}} src={tixing} />
                  </Tooltip>
                  : null )
                : null
              }
            </Fragment>
            : null
        ),
      },
    ]

    //操作列
    const actioncolumn = [
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width:120,
        render: (text, record) => (
          <Fragment>
          <span>
            <Link to={{ pathname: path, query:{ id:record.id} }}>编辑</Link>
          </span>
            {record.status === statusText[goodtype] ?
              <Fragment>
                <Divider type="vertical"/>
                <a onClick = {() => this.openTable(record)}>发货</a>
              </Fragment>
              : null
            }
          </Fragment>
        ),
      }
    ]

    const textColumn = {
      ord: [...usualcolumns, ...actioncolumn],
      sub: [...usualcolumns,...subcolumn,...actioncolumn],
      repl: [...usualcolumns, ...actioncolumn],
      qrpay: [...outusualcolumns]
    }

    const rowSelection = {
      selectedRowKeys,
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected && checkExport){
          this.setState({loadingQuery: true}, () => {
            this.props.dispatch({
              type: 'trade/queryExcelBatch',
              payload: {orders: selectedRows.map(({id}) => (id))},
            }).then((res) => {
              const ids = res.map(({order}) => (order))
              const rowSelection_ = this.state.rowSelection.filter(({id}) => (!ids.includes(id)));
              const selectedRowKeys_ = rowSelection_.map((i) => (i.url));
              this.setState({
                rowSelection: rowSelection_,
                selectedRowKeys: selectedRowKeys_,
                loadingQuery: false,
                checkExport: false,
              });
            })
          })
        }
      },
      onChange: (RowKeys, selectedRows) => {
        this.setState({
          rowSelection: selectedRows,
          selectedRowKeys: RowKeys,
        });
      },
    };

    return(
      <Fragment>
        <Table
          loading={loading || loadingQuery}
          dataSource={dataSource}
          columns={textColumn[goodtype]}
          pagination={pagination}
          rowKey="url"
          scroll={{ x: scroll || textColumn[goodtype].length * 150 }}
          rowSelection={rowSelection}
          footer={() => {
            return (
              <Fragment>
                <Select
                  value={expressCompany}
                  onChange={(e) => this.setState({expressCompany: e})}
                  style={{width: 120, marginRight: 10}}>
                  <Select.Option value='SF'>顺丰</Select.Option>
                  <Select.Option value='ZT'>中通</Select.Option>
                </Select>
                <Button loading={this.state.loadingExport} onClick={() => {
                  if (!expressCompany)
                    return message.warn('请选择导出格式');
                  if (!this.state.rowSelection.length)
                    return message.warn('请选择导出的订单');

                  const data = {
                    delivery: expressCompany,
                    orders: this.state.rowSelection.map((i) => (i.id))
                  };

                  this.setState({loadingExport: true});

                  this.props.dispatch({
                    type: 'trade/queryExcelBatch',
                    payload: data,
                  }).then((res) => {
                    this.setState({loadingExport: false})
                    if (res && res.length) {
                      Modal.confirm({
                        title: '以下订单已有导出记录，是否继续导出',
                        content: (
                          <Fragment>
                            {res.map((r) => (r.name ? <Fragment><span>{r.name}</span><br/></Fragment> : null))}
                          </Fragment>
                        ),
                        onOk: () => {
                          return this.props.dispatch({
                            type: 'trade/exportExcelBatch',
                            payload: data,
                          })
                        },
                      })
                    } else {
                      this.props.dispatch({
                        type: 'trade/exportExcelBatch',
                        payload: data,
                      })
                    }
                  })
                }}>
                  导出寄件信息
                </Button>
              </Fragment>
            )
          }}
        />
        <Modal
          visible={visible}
          title="商品配送情况"
          centered
          width="80%"
          maskClosable={false}
          bodyStyle={{maxHeight: `${wh-380}px`, overflowY: 'auto'}}
          okText="确定"
          cancelText="取消"
          onOk={() => this.okHandle()}
          onCancel={() => this.setState({ visible: false })}
        >
          {express.length > 0 ?
            <Fragment>
              {!rowdata.fictitious && <h3><b>快递公司配送</b></h3>}
              <GoodInfoTable goodtype={goodtype}
                             initData={() => this.initData()}
                             fictitious={rowdata.fictitious}
                             value={{ rowdataid, orderdata_item:express, isdetail: false,delivery_method:'express'}} {...this.props}/>
            </Fragment>
            : null
          }
          {own.length > 0 ?
            <Fragment>
              {!rowdata.fictitious && <h3><b>商家自配送</b></h3>}
              <GoodInfoTable goodtype={goodtype}
                             initData={() => this.initData()}
                             fictitious={rowdata.fictitious}
                             value={{ rowdataid, orderdata_item:own, isdetail: false, delivery_method:'own', pay_time:rowdata.pay_time }} {...this.props}/>
            </Fragment>
            : null
          }
          {buyer.length > 0 ?
            <Fragment>
              {!rowdata.fictitious && <h3><b>用户自提</b></h3>}
              <GoodInfoTable goodtype={goodtype}
                             initData={() => this.initData()}
                             fictitious={rowdata.fictitious}
                             value={{ rowdataid, orderdata_item:buyer, isdetail: false, delivery_method:'buyer' }} {...this.props}/>
            </Fragment>
            : null
          }
        </Modal>
        <Modal
          title="支付订单详情"
          centered={true}
          visible={detailVisible}
          onOk={() => this.setState({ detailVisible: false })}
          onCancel={() => this.setState({ detailVisible: false })}>
          <Form>
            <FormItem label="订单号">
              {detailform.order_sn}
            </FormItem>
            <FormItem label="用户名">
              <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: detailform.user_info &&detailform.user_info.id }} }>
                <img src={detailform.user_info &&detailform.user_info.avatar_url} width="30" height="30" alt="" />
                <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
                  overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
                  {detailform.user_info &&detailform.user_info.nickname}
                </span>
              </Link>
            </FormItem>
            <FormItem label="订单金额">
              ￥ {detailform.order_amount}
            </FormItem>
            <FormItem label="会员钱包扣款额">
              {Number(detailform.wallet_pay) === 0 ? '--' : `￥ ${detailform.wallet_pay}`}
            </FormItem>
            <FormItem label="微信支付金额">
              {Number(detailform.real_amount) === 0 ? '--' : `￥ ${detailform.real_amount}`}
            </FormItem>
            <FormItem label="微信支付流水号">
              {detailform.trade_no || '--' }
            </FormItem>
            <FormItem label="支付时间">
              {detailform.pay_time && moment(detailform.pay_time).format('YYYY-MM-DD kk:mm:ss') || '--'}
            </FormItem>
            <FormItem label="订单状态">
              {status_group[detailform.status]}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    )
  }
}
ordertableList.propTypes = {
  dataSource: PropTypes.array.isRequired, //订单数据
  goodtype: PropTypes.string.isRequired,  //订单的类型: ord/sub/repl/qrpay
  path: PropTypes.string.isRequired,      //订单详情页的路径
  initData: PropTypes.func,               //当前订单页刷新，用于goodInfoTable组件中订阅商品完成发货时刷新
  scroll: PropTypes.string,               //表格横向滚动的距离
  pagination: PropTypes.object,           //antd的table的pagination
  location: PropTypes.object,             //this.props.location
  OKhandle: PropTypes.func,               //点击弹窗“确定”的响应
};
export default ordertableList
