import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import moment from 'moment';
import {
  Form,
  Button,
  Card,
  Spin,
  Table,
  Row,
  Col,
  InputNumber,
  Switch, Modal, message,
} from 'antd';
import styles from './userlist.less'

const FormItem = props => (<Form.Item className={styles.items} {...props}/>);
const itemsPerPage = 10;

@connect(({ user, global, loading }) => ({
  bonus_switch:global.bonus_switch,
  rebate_switch:global.rebate_switch,
  userLoading: loading.models.user,
}))
class EditUser extends Component {
  state = {
    userdata:{},
    userform:{},
    accountLogs: [],
    accountCount: 0,
    acc_page: 1,
    creditLogs: [],
    creditCount: 0,
    cred_page: 1,
    acc_columns: [],
    cred_columns: [],
    relList: [],
    amount: 0,
    action:'',
    key:'',
    id:''
  };

  componentDidMount() {
    const { location } = this.props;
    let id = location.query.id;
    if(id){
      this.setState({ id })
      this.initData('init')
      this.setState({
        acc_columns: this.changeColumn('asset'),
        cred_columns: this.changeColumn('credit'),
      })
    }
  }

  componentDidUpdate(preprops,prestats){
    const { location } = this.props;
    let id = location.query.id;
    if(id !== this.state.id && this.state.id){
      this.setState({ id })
      this.initData('init')
    }
  }

  changeColumn = (type) => {
    return [
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
        render: (t) => moment(t).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '类型',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (t,r) => (r.detail || r.number) && <a onClick={() => this.toDetailPage(r)}>查看详情</a> || '/'
      },
    ]
  }

  initData = (type) => {
    const { dispatch, location } = this.props;
    let id = location.query.id;
    dispatch({
      type:'user/fetchUser',
      payload: { id }
    }).then((res) => {
      if(res){
        this.setState({
          userdata:res,
          userform: { bonus_right: res.bonus_right, rebate_right: res.rebate_right, testers: res.testers, upload_perm: res.upload_perm }
        })
        if(type === 'init'){
          this.fetchAccountData(res);
          this.fetchCreditData(res);
          this.fetchReferral(res);
        }
      }
    })
  }
  fetchAccountData = (result, page) => {
    const { dispatch} = this.props;
    const { acc_page } = this.state;
    dispatch({
      type:'user/AccountCreditlist',
      payload: { url: result.url, type: 'account_logs', data:{ page: page || acc_page } }
    }).then((res) => {
      if(res){
        this.setState({ accountLogs: res.results, accountCount: res.count })
      }
    })
  }
  fetchCreditData = (result, page) => {
    const { dispatch} = this.props;
    const { cred_page } = this.state;
    dispatch({
      type:'user/AccountCreditlist',
      payload: { url: result.url, type: 'credit_logs', data:{ page: page || cred_page } }
    }).then((res) => {
      if(res) {
        this.setState({ creditLogs: res.results, creditCount: res.count })
      }
    })
  }
  fetchReferral = (result) => {
    const { dispatch} = this.props;
    dispatch({
      type:'user/AccountCreditlist',
      payload: { url: result.url, type: 'referrals_list' }
    }).then((res) => {
      if(res) {
        this.setState({ relList: res })
      }
    })
  }

  //查看详情
  toDetailPage = (record, type) => {
    const { dispatch } = this.props;
    const {detail} = record;
    const is_pt = detail && detail.is_pt || null;
    const orderType = {
      ord: {
        detail: is_pt ? '/order/mixOrderlist/orderDetail' : '/order/orderlist/editorder',
        list: '/order/orderlist',
        searchkey: { order: {user: record.nickname, user_id: record.id} }
      },
      sub: {
        detail:is_pt ? '/order/mixOrderlist/suborderDetail' : '/order/subscribeOrderlist/subscribeEditorder',
        list: '/order/subscribeOrderlist',
        searchkey: { suborder:{user: record.nickname, user_id: record.id} }},
      repl: {
        detail:'/order/replOrderlist/editreplorder',
        list: '/order/replOrderlist',
        searchkey: { replorder:{user: record.nickname, user_id: record.id} }},
      qrpay: {
        detail: '/offline/orders',
        list: '/offline/orders',
        searchkey: {outorder: {order_sn: record.number}},//线下支付
      },
      teamuser: { detail:'/trade/distribution/teamlist/teamdetail'},
    }
    if(!type){
      let pathname = '', searchkey = {}
      switch ((record.detail && record.detail.model_type) || record.a_type || record.log_type) {
        case 'recharge':
          pathname = '/finance/recharge';
          searchkey = { recharge:{rchg_no:record.number} };
          break;//充值记录
        case 'withdraw':
          pathname = '/finance/money';
          searchkey = { money:{withdraw_no:record.number} };
          break;//提现记录
        case 'fail_withdraw_return':
          pathname = '/finance/money';
          searchkey = { money:{withdraw_no:record.number} };break;//提现失败记录
        case 'use':
          pathname = '/offline/orders';
          searchkey = { outorder:{order_sn:record.number} };break;//线下支付
        case 'qrpay':
          pathname = '/offline/orders';
          searchkey = { outorder:{order_sn:record.number} };break;//线下支付
        default: pathname = record.detail && orderType[record.detail.model_type].detail || null;break;
      }

      if(record.log_type !== 'grouping') {
        (!record.detail ||
          (record.a_type === 'use'
            && record.detail
            && record.detail.model_type === 'qrpay'))
        && dispatch({
          type: 'global/searchFormKey',
          payload: { ...searchkey },
        }).then(() => this.props.history.push({ pathname }))
        record.detail
        && record.detail.model_type !== 'qrpay'
        && this.props.history.push({ pathname, query: { id: record.detail.link.split('/').reverse()[1] } })
      }
      else {
        dispatch({
          type: 'ptgroup/fetchptgroup',
          payload: {
            ptgroup_no: record.number
          },
        }).then((res) => {
          if (res && res[0]) {
            this.props.history.push({ pathname: '/order/mixOrderlist/mixEditorder', query: { id: res[0].id } })
          }
        })
      }
    }

    if(type){ //查看订单
      orderType[type].searchkey
      ? dispatch({
        type: 'global/searchFormKey',
        payload: {  ...orderType[type].searchkey },
      }).then(() => this.props.history.push({ pathname: orderType[type].list }))
      : this.props.history.push({ pathname: orderType[type].detail, query:{ id: record.id } })
    }
  }

  //数据更改
  handleModalUser = (type_bool,type_name) => {
    let cn_type_name = ''; let dispatch_type = ''; let _type_bool = ''
    if(type_name === 'testers'){
      cn_type_name = '测试人员'
      dispatch_type = 'user/testerUser'
      _type_bool = type_bool
    }
    else if(type_name === 'bonus_right'){
      cn_type_name = '分销返佣'
      dispatch_type = 'user/bonusUser'
      _type_bool = type_bool ? 'true' : 'false'
    }
    else if(type_name === 'rebate_right'){
      cn_type_name = '推广返利'
      dispatch_type = 'user/rebateUser'
      _type_bool = type_bool ? 'true' : 'false'
    }
    else if(type_name === 'upload_perm'){
      cn_type_name = '短视频上传'
      dispatch_type = 'user/videoUser';
      _type_bool = type_bool
    }
    this.handleTester(_type_bool,type_name,cn_type_name,dispatch_type)
  }

  handleTester = (type_bool,en_type_name,cn_type_name,dispatch_type) => {
    const { dispatch } = this.props
    const { userdata, userform } = this.state
    const that = this
    const _ = type_bool === 'false' || type_bool === 'true'
    const data = { [en_type_name]: type_bool }
    Modal.confirm({
      title: '确认操作 ',
      centered: true,
      content: (<span>确认用户
        <span style={{ color:'red'}}>
          { _ ?
            ( type_bool === 'true' ? `启动` : `关闭` ) :
            ( !type_bool ? `关闭` : `启动` )
          }
        </span>
        {cn_type_name} 功能
      </span>),
      okText: '确认',
      okType: 'primary',
      cancelText: '取消 ',
      onOk() {
        dispatch({
          type:dispatch_type,
          payload:{
            url: userdata.url,
            ...data
          }
        }).then((res) => {
          userform[en_type_name] = type_bool
          console.log(userform)
          that.setState({ userform})
          message.success(res)
        }).catch((err) => {
          message.error(err)
        })
      }
    })
  }
  //会员钱包和积分
  handlePrice = (action, key) => this.setState({ visible: true, action, key, amount: 0 })
  okModal = () => {
    const { amount, userdata, action, key } = this.state;
    const { dispatch } = this.props;
    const that = this;
    dispatch({
      type:'user/AccountCreditlist',
      payload:{
        url: userdata.url,
        type: 'change_account',
        method: 'POST',
        postdata: {
          account: key,
          operation: action,
          amount,
        }
      }
    }).then((res) => {
      this.setState({ visible: false })
      if (res) {
        that.initData()
        message.success('操作成功')
      }
      else {
        message.error('操作失败')
      }
    })
  }

  render(){
    const { userdata, userform, creditLogs, cred_columns, creditCount, cred_page,
      accountLogs, acc_columns, accountCount,acc_page, amount, visible, action, key, relList } = this.state
    const { userLoading, bonus_switch, rebate_switch } = this.props
    const textKey = {
      wallet: '钱包余额',
      credit: '积分',
      add: '增加',
      subtract: '减少'
    }

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    };

    const acc_pagination = {
      pageSize: itemsPerPage,
      current: acc_page,
      total: accountCount,
      onChange: page => {
        this.setState({ acc_page: page });
        this.fetchAccountData(userdata, page)
      },
    };

    const cred_pagination = {
      pageSize: itemsPerPage,
      current: cred_page,
      total: creditCount,
      onChange: page => {
        this.setState({ cred_page: page });
        this.fetchCreditData(userdata, page)
      },
    };

    return(
      <PageHeaderWrapper>
        <Spin spinning={userLoading}>
        <Card>
          <Card type="innner" title="客户基本信息">
            <div className={styles.main} >
              <Form className={styles.editform}>
            <FormItem label="用户昵称" {...formItemLayout}>
              <span>
                <img src={userdata.avatar_url} width="30" height="30" alt="" />
                <span style={{marginLeft: 10 }}>{userdata.nickname}</span>
              </span>
            </FormItem>
            <FormItem label="用户性别" {...formItemLayout}>
              <span>{userdata.gender === 1 ? '男' : '女'}</span>
            </FormItem>
            <FormItem label="介绍人" {...formItemLayout}>
              {userdata.referrer && userdata.referrer.id &&
                <span>
                  <Link style={{marginLeft: 10,color:"rgba(0, 0, 0, 0.65)" }} to={{ pathname: `/user/userlist/edituser`, query:{id: userdata.referrer.id }} }>
                    {userdata.referrer.avatar_url && <img src={userdata.referrer.avatar_url} width="30" height="30" alt="" />}
                    <span style={{marginLeft: 10 }}>{userdata.referrer.nickname}</span>
                  </Link>
                </span>
              }
            </FormItem>
            <FormItem label="团队" {...formItemLayout}>
              <span>{relList.length} 人</span>
              <Button size="small" type="primary"
                      onClick={() => this.toDetailPage(userdata,'teamuser')}>查看</Button>
            </FormItem>
            <FormItem label="会员等级" {...formItemLayout}>
              <span>{userdata.level && userdata.level.title}</span>
            </FormItem>
            <FormItem label="省份" {...formItemLayout}>
              <span>{userdata.province}</span>
            </FormItem>
            <FormItem label="城市" {...formItemLayout}>
              <span>{userdata.city}</span>
            </FormItem>
            <FormItem label="会员钱包余额" {...formItemLayout}>
              <span>￥{(userdata.asset + userdata.recharge).toFixed(2) || 0}</span>
              <Button type="primary" size="small" style={{marginLeft:10, marginRight: 10 }}
                      onClick={() => this.handlePrice('add','wallet')}>赠送</Button>
              <Button type="danger" size="small"
                      onClick={() => this.handlePrice('subtract','wallet')}>扣减</Button>
            </FormItem>
            <FormItem label="奖励收益" {...formItemLayout}>
              <span>￥{userdata.asset && userdata.asset.toFixed(2)}</span>
            </FormItem>
            <FormItem label="积分" {...formItemLayout}>
              <span>{userdata.credit}</span>
              <Button type="primary" size="small" style={{marginLeft:10, marginRight: 10 }}
                      onClick={() => this.handlePrice('add','credit')}>赠送</Button>
              <Button type="danger" size="small"
                      onClick={() => this.handlePrice('subtract','credit')}>扣减</Button>
            </FormItem>
            <FormItem label="加入时间" {...formItemLayout}>
              <span>{userdata.date_joined && moment(userdata.date_joined).format('YYYY-MM-DD HH:mm:ss')}</span>
            </FormItem>
            <FormItem label="普通商品订单" {...formItemLayout}>
              <span>{userdata.order_count && userdata.order_count.ord_order_count} 个</span>
              <Button size="small" type="primary"
                      onClick={() => this.toDetailPage(userdata,'ord')}>查看</Button>
              <span style={{marginLeft: 40 }}>订阅商品订单：</span>
              {userdata.order_count && userdata.order_count.sub_order_count} 个
              <span><Button size="small" type="primary"
                            onClick={() => this.toDetailPage(userdata,'sub')}>查看</Button></span>
            </FormItem>
            {bonus_switch ?
              <FormItem label="分销返佣" {...formItemLayout}>
                <span>
                <Switch
                  checked={userform.bonus_right === 'true'}
                  onChange={(e) => this.handleModalUser(e,'bonus_right')}
                />
                </span>
              </FormItem>
              : null
            }
            {rebate_switch ?
              <FormItem label="商品推广返利" {...formItemLayout}>
              <span>
                <Switch
                  checked={userform.rebate_right === 'true'}
                  onChange={(e) => this.handleModalUser(e,'rebate_right')}
                />
                </span>
              </FormItem>
              : null
            }
            <FormItem label="测试人员" {...formItemLayout}>
            <span>
              <Switch
                checked={userform.testers}
                onChange={(e) => this.handleModalUser(e,'testers')}
              />
              </span>
            </FormItem>
            <FormItem label="短视频上传" {...formItemLayout}>
            <span>
              <Switch
                checked={userform.upload_perm}
                onChange={(e) => this.handleModalUser(e,'upload_perm')}
              />
              </span>
            </FormItem>
            {
              userform.bonus_right === 'true' && (
                <FormItem label="分销小程序码" {...formItemLayout}>
                  <span>
                    <img src={userdata.qrcode_url} alt='' style={{width:120}}/>
                  </span>
                  <span>
                    <Button size="small"
                            onClick={() => {
                              const name = '分销小程序码.png';
                              const imgsrc = userdata.qrcode_url;
                              let image = new Image();
                              image.setAttribute("crossOrigin", "anonymous");
                              image.onload = function() {
                                let canvas = document.createElement("canvas");
                                canvas.width = image.width;
                                canvas.height = image.height;
                                let context = canvas.getContext("2d");
                                context.drawImage(image, 0, 0, image.width, image.height);
                                let url = canvas.toDataURL("image/png");
                                let a = document.createElement("a");
                                let event = new MouseEvent("click");
                                a.download = name || "photo";
                                a.href = url;
                                a.dispatchEvent(event);
                              };
                              image.src = imgsrc;
                            }}>
                      下载
                    </Button>
                  </span>
                </FormItem>
              )
            }
          </Form>
            </div>
          </Card>
          <Card type="innner" title="会员钱包记录" style={{margin: '15px 0'}}>
            <Table
              size="small"
              columns={acc_columns}
              dataSource={accountLogs}
              pagination={acc_pagination}
              rowKey="url"
            />
          </Card>
          <Card type="innner" title="会员积分记录">
            <Table
              size="small"
              columns={cred_columns}
              dataSource={creditLogs}
              pagination={cred_pagination}
              rowKey="url"
            />
          </Card>
          <Row>
            <Col span={24} style={{ textAlign: 'right', marginTop: 10 }}>
              <Link to='/user/userlist'>
                <Button>返回</Button>
              </Link>
            </Col>
          </Row>
        </Card>
          <Modal
            visible={visible}
            centered={true}
            title={`${textKey[key]}操作`}
            onOk={() => this.okModal()}
            onCancel={() => this.setState({ visible: false })}>
            <Fragment>
              会员{textKey[key]}{textKey[action]}{key === 'wallet' && '(元)'}：
              <InputNumber
                min={0}
                // max={action === 'subtract' ? (key === 'wallet' ? (userdata.asset + userdata.recharge) : userdata[key]) : Infinity}
                value={amount}
                precision={key === 'wallet' ? 2 : 0}
                parser={value => key === 'wallet' ? value : value.replace(/\$\s?|(,*)/g, '')}
                step={1}
                onChange={(e) => this.setState({ amount: e })}/>
            </Fragment>
          </Modal>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default EditUser
