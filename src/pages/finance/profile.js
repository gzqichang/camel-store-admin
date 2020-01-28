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
  Select,
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
const Option = Select.Option;

@connect(({ finance, order, global, loading }) => ({
  accountlogList:finance.accountlogList,
  accountlogListCount:finance.accountlogListCount,
  searchform: global.searchform,
  accountlogLoading: loading.effects['finance/fetchaccountlogList'],
}))
class profile extends Component {
  state = {
    page:1,
    accountform:{},
    accountlist: []
  }

  creditcolumns = [
    {
      title: '微信用户',
      dataIndex: 'user_info',
      key: 'user_info',
      align:"left",
      render: (t) => <Link to={{pathname:'/user/userlist/edituser',query:{id:t.id} } }>
        <img src={t.avatar_url} width="30"/>
        <span style={{marginLeft: 10,color:'rgba(0,0,0,0.56)'}}>{t.nickname}</span>
      </Link>
    },{
      title: '类型',
      dataIndex: 'remark',
      key: 'remark',
    },{
      title: '数额',
      dataIndex: 'credit',
      key: 'credit',
    },{
      title: '时间',
      dataIndex: 'add_time',
      key: 'add_time',
      render: (t) => (moment(t).format('YYYY-MM-DD kk:mm:ss'))
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
    const { dispatch } = this.props
    const orderType = {
      ord: { detail:'/order/orderlist/editorder' },
      sub: { detail: '/order/subscribeOrderlist/subscribeEditorder' },
      repl: { detail: '/order/replOrderlist/editreplorder' },
    }
    if(record.detail){
      const path = orderType[record.detail.model_type].detail
      this.props.history.push({pathname:path,query:{id: record.detail.link && record.detail.link.split('/').reverse()[1]}});
    }
    if(record.log_type === 'grouping'){
      dispatch({
        type: 'ptgroup/fetchptgroup',
        payload: {
          ptgroup_no:record.number
        },
      }).then((res) => {
        if(res && res[0]){
          this.props.history.push({ pathname:'/order/mixOrderlist/mixEditorder', query:{ id: res[0].id} })
        }
      })
    }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key: 'credit' }
    }).then(() => { this.initData('init') })
  }
  initData = (type) => {
    const { dispatch, searchform:{ credit } } = this.props;
    const { accountform } = this.state
    let _accountform = { }
    if(type === 'init'){
      _accountform = { ...credit }
      this.setState({ accountform:{ ...credit } })
    }
    else if(type === 'reset'){
      this.setState({ accountform:{} })
    }
    else if(type === 'search'){
      _accountform = { ...accountform, page: 1,}
      this.setState({ accountform:{ ..._accountform } })
    }
    else{
      _accountform = { ...accountform }
    }
    dispatch({
      type: 'finance/fetchaccountlogList',
      payload: {
        type: 'creditlog',
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
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ credit: {...accountform} }
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
    const { accountlogListCount, accountlogLoading } = this.props
    const { accountform, accountlist } = this.state
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
            type: 'creditlog',
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
                  <span className={styles.searchitem_span}>微信用户</span>
                  <Input
                    value={accountform.user}
                    onChange={(e) => {this.handleAccount(e,'user')} }
                    placeholder={"请输入用户"}
                    style={{ width: 200 }}/>
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>返利时间: </span>
                  <RangePicker
                    value={accountform.date_after ? [moment(accountform.date_after, 'YYYY-MM-DD'), moment(accountform.date_before, 'YYYY-MM-DD')] : null}
                    onChange={this.ondateChange}
                  />
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>类型: </span>
                  <Select
                    style={{ width: 200 }}
                    value={accountform.log_type}
                    onChange={(e) => this.handleAccount({target: { value:e }}, 'log_type')}>
                    <Option key={'share'}>分享返利</Option>
                    <Option key={'grouping'}>拼团积分</Option>
                    <Option key={'replace'}>积分消费</Option>
                    <Option key={'gift'}>店铺赠送</Option>
                    <Option key={'deduction'}>店铺扣减</Option>
                  </Select>
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
          columns={this.creditcolumns}
          pagination={pagination}
          scroll={{ x:800 }}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default profile
