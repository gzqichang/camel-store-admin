import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import moment from 'moment';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Button,
  Card,
  Table,
  message,
  Row,
  Col,
  DatePicker,
  Input, Spin,
} from 'antd';
import styles from '../finance/finance.less';
import CollapseItem from '@/components/CostomCom/collapseItem';
import Link from 'umi/link';

const itemsPerPage = 10;
const { RangePicker } = DatePicker;

@connect(({ finance, order, global, loading }) => ({
  accountlogList:finance.accountlogList,
  accountlogListCount:finance.accountlogListCount,
  searchform: global.searchform,
  accountlogLoading: loading.effects['finance/fetchaccountlogList'],
}))
class tradeProfie extends Component {
  state = {
    page:1,
    accountform:{},
    accountlist: []
  }

  columns = [
    {
      title: '返利用户',
      dataIndex: 'user_info',
      key: 'user_info',
      align:"left",
      render: (t) => <Link to={{pathname:'/user/userlist/edituser',query:{id:t.id} } }>
        <img src={t.avatar_url} width="30"/>
        <span style={{marginLeft: 10,color:'rgba(0,0,0,0.56)'}}>{t.nickname}</span>
      </Link>
    },{
      title: '返利金额',
      dataIndex: 'asset',
      key: 'asset',
    },{
      title: '返利时间',
      dataIndex: 'add_time',
      key: 'add_time',
      render: (t) => (moment(t).format('YYYY-MM-DD HH:mm:ss'))
    },{
      title: '消费用户',
      dataIndex: 'referral_name',
      key: 'referral_name',
      render: (t,r) => <Fragment>
        {r.referral_avatar_url && <img src={r.referral_avatar_url} width="30" style={{marginRight: 10}}/> || null}
        <span style={{color:'rgba(0,0,0,0.56)'}}>{t}</span>
      </Fragment>
    },{
      title: '订单编号',
      dataIndex: 'number',
      key: 'number',
      render: (t,r) => (
        <span onClick={() => this.setid(r)}>
          <a>{t}</a>
        </span>
      )
    },{
      title: '消费金额',
      dataIndex: 'cost',
      key: 'cost'
    }];
  creditcolumns = [
    {
      title: '返利用户',
      dataIndex: 'user_info',
      key: 'user_info',
      align:"left",
      render: (t) => <Link to={{pathname:'/user/userlist/edituser',query:{id:t.id} } }>
        <img src={t.avatar_url} width="30"/>
        <span style={{marginLeft: 10,color:'rgba(0,0,0,0.56)'}}>{t.nickname}</span>
      </Link>
    },{
      title: '返利积分',
      dataIndex: 'credit',
      key: 'credit',
    },{
      title: '返利时间',
      dataIndex: 'add_time',
      key: 'add_time',
      render: (t) => (moment(t).format('YYYY-MM-DD HH:mm:ss'))
    },{
      title: '订单编号',
      dataIndex: 'number',
      key: 'number',
      render: (t,r) => (
        <span onClick={() => this.setid(r)}>
          <a>{t}</a>
        </span>
      )
    }];

  setid = (record) =>{
    const orderType = {
      ord: { detail:'/order/orderlist/editorder' },
      sub: { detail: '/order/subscribeOrderlist/subscribeEditorder' },
      repl: { detail: '/order/replOrderlist/editreplorder' }
    }
    if(record.detail){
      const path = orderType[record.detail.model_type].detail
      this.props.history.push({pathname:path,query:{id: record.detail.link && record.detail.link.split('/').reverse()[1]}});
    }
  }

  componentDidMount() {
    const { dispatch, location } = this.props
    const key = (location.pathname.includes('distribution') && 'profile')
      || (location.pathname.includes('share') && 'credit')
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key }
    }).then(() => { this.initData('init') })
  }
  initData = (type) => {
    const { dispatch, searchform:{ profile, credit }, location } = this.props;
    const textType = [
      { type: 'accountlog', searchkey: {...profile}, path: location.pathname.includes('distribution') },
      { type: 'creditlog', searchkey: {...credit,log_type:'share'}, path: location.pathname.includes('share') },
    ]
    const result = textType.filter(item => item.path)
    const { accountform } = this.state
    let _accountform = { log_type: result[0].type === 'creditlog' ? 'share' : undefined }
    if(type === 'init'){
      _accountform = { ...result[0].searchkey }
      this.setState({ accountform:{ ...result[0].searchkey } })
    }
    else if(type === 'reset'){
      this.setState({ accountform:result[0].type === 'creditlog' ? {log_type:'share'} : {}, date:null })
    }
    else if(type === 'search'){
      _accountform = { ...accountform, page: 1, log_type: result[0].type === 'creditlog' ? 'share' : undefined }
      this.setState({ accountform:{ ..._accountform } })
    }
    else{
      _accountform = { ...accountform,log_type: result[0].type === 'creditlog' ? 'share' : undefined }
    }
    dispatch({
      type: 'finance/fetchaccountlogList',
      payload: {
        type:result[0].type,
        data:{
          page_size:itemsPerPage,
          ..._accountform
        }
      }
    }).then((res) => {
      if(res){
        this.setState({ accountlist: res.results })
      }
    })
  }

  componentWillUnmount(){
    const { accountform } = this.state
    const { dispatch, location } = this.props
    const searchfrom = (location.pathname.includes('distribution') && {profile: {...accountform} } )
      || (location.pathname.includes('share') && {credit: {...accountform}})
    dispatch({
      type:'global/searchFormKey',
      payload:{ ...searchfrom }
    })
  }

  handleAccount = (e,key) =>{
    const { accountform } = this.state
    accountform[key] = e.target.value
    this.setState({ accountform })
  }
  ondateChange = (date, dateString) => {
    const { accountform } = this.state
    accountform['date_after'] = dateString[0]
    accountform['date_before'] = dateString[1]
    this.setState({  accountform });
  }
  searchSubmit = () => {
    this.initData('search')
  }

  render(){
    const { accountlogListCount, accountlogLoading, location } = this.props
    const { accountform, accountlist } = this.state
    const type = (location.pathname.includes('distribution') && 'accountlog')
      || (location.pathname.includes('share') && 'creditlog')
    const pagination = {
      pageSize: itemsPerPage,
      current: accountform.page,
      total: accountlogListCount,
      onChange: (page) => {
        this.setState({ accountform: {...accountform, page } });
        const { dispatch } = this.props;
        dispatch({
          type:'finance/fetchaccountlogList',
          payload: {
            type,
            data:{
              ...accountform,
              page: page,
              page_size:itemsPerPage,
            }
          }
        }).then((res) => {
          if(res){
            this.setState({ accountlist: res.results })
          }
        })
      },
    };

    return(
      <PageHeaderWrapper>
      <Card className={styles.main}>
        <Spin spinning={false}>
          <CollapseItem
            renderSimpleForm={() =>
              <Fragment>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>{type === 'accountlog' ? '消费用户:' : '返利用户:' }</span>
                  <Input
                    value={accountform.user}
                    onChange={(e) => {this.handleAccount(e,'user')} }
                    placeholder={type === 'accountlog' ? "请输入消费用户" : "请输入用户"}
                    style={{ width: 200 }}/>
                </div>
                {type === 'accountlog' &&
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>奖励用户: </span>
                  <Input
                    value={accountform.referral}
                    onChange={(e) => {
                      this.handleAccount(e, 'referral')
                    }}
                    placeholder="请输入奖励用户"
                    style={{ width: 200 }}/>
                </div>
                }
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>返利时间: </span>
                  <RangePicker
                    value={accountform.date_after ? [moment(accountform.date_after, 'YYYY-MM-DD'), moment(accountform.date_before, 'YYYY-MM-DD')] : null}
                    onChange={this.ondateChange}
                  />
                </div>
              </Fragment>}/>
        </Spin>
        <Row><Col span={24} style={{ textAlign: 'right' }}>
            <div style={{marginBottom: 20}}>
              <Button type="primary" style={{marginLeft: 30}} onClick={this.searchSubmit}>查询</Button>
              <Button type="danger" style={{ marginLeft: 20}} onClick={() => this.initData('reset')}>重置</Button>
            </div>
          </Col>
        </Row>
        <Table
          loading={accountlogLoading}
          dataSource={accountlist}
          columns={type === 'accountlog' ? this.columns : this.creditcolumns}
          pagination={pagination}
          scroll={{ x:800 }}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default tradeProfie
