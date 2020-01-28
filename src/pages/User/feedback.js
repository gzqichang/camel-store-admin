import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import moment from 'moment';
import {
  Button,
  Card,
  Table,
  Modal,
  Select,
  Row,
  Col,
  DatePicker,
  Input, Icon, Spin,
  Tabs, LocaleProvider
} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import styles from './userlist.less'
import { getLocalStorage } from '../../utils/authority';
import CollapseItem from '@/components/CostomCom/collapseItem';
import Link from 'umi/link';

const Option = Select.Option;
const { RangePicker } = DatePicker
const itemsPerPage = 10;
const TabPane = Tabs.TabPane;

@connect(({ user, global, costom }) => ({
  feedback:user.feedback,
  feedbackCount:user.feedbackCount,
  searchform: global.searchform,
  shopid: global.shopid
}))
class Feedback extends Component {
  state = {
    loading:false,
    tradeform:{},
    _searchform:{},
    count: 0
  }

  columns = [
    {
      title: '微信用户',
      dataIndex: 'user_info',
      key: 'user_info',
      align: 'left',
      render: (t,r) => (
        <Fragment>
          <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: r.user }} }>
            <img src={t.avatar_url} width="30" height="30" alt="" />
            <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
              overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
              {t.nickname}
            </span>
          </Link>
        </Fragment>
      ),
    }, {
      title: '电话号码',
      dataIndex: 'phone',
      key: 'phone',
      render: (t) => <a href={`tel:${t}`}>{t}</a>
    },{
      title: '反馈内容',
      dataIndex: 'content',
      key: 'content',
      minWidth: 100,
      render: (t) => (<span style={{display:'inline-block',maxWidth:'180px',overflow: 'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{t}</span>)
    },{
      title: '反馈时间',
      dataIndex: 'add_time',
      key: 'add_time',
      width: 180,
      render: (t) => (moment(t).format('YYYY-MM-DD kk:mm:ss'))
    },{
      title: '是否解决',
      dataIndex: 'solve',
      key: 'solve',
      width: 90,
      render: (t,r) => (
        <span onClick={() => this.handleModal(r.update_status,t)} style={{cursor:'pointer'}}>
          {t ? <Icon type="check-circle" theme="filled" style={{color:'green'}} /> :
            <Icon type="close-circle" theme="filled" style={{color:'red'}} />}
        </span>)
    },{
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (t, r) =>(
        <Fragment>
          <span onClick={() => this.checkModal(r)}>
            <a>查看</a>
          </span>
        </Fragment>
      )

   }];

  logcolumns = [
    {
      title: '操作管理员',
      dataIndex: 'admin_name',
      key: 'admin_name',
    }, {
      title: '操作时间',
      dataIndex: 'add_time',
      key: 'add_time',
      width: 180,
      render: (t) => (moment(t).format('YYYY-MM-DD kk:mm:ss'))
    },{
      title: '执行操作',
      dataIndex: 'operation',
      key: 'operation',
    }];

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'feedback' }
    }).then(() => { this.initData('init') })
  }
  initData = (type) => {
    const { dispatch, searchform:{ feedback } } = this.props;
    let { tradeform } = this.state
    let shopid = getLocalStorage('shopid').split('#')[0]
    let _tradeform = {}
    if(type === 'init'){
      _tradeform = { ...feedback }
      this.setState({ tradeform:{ ...feedback } })
    }
    else if(type === 'reset'){
      this.setState({ tradeform:{} })
    }
    else if(type === 'search'){
      _tradeform = { ...tradeform, page: 1 }
      this.setState({ tradeform:{ ..._tradeform } })
    }
    else{
      _tradeform = { ...tradeform }
    }
    shopid !== 'all' ? _tradeform.shop = shopid : null
    delete _tradeform.id
    this.setState({ loading: true })
    dispatch({
      type: 'user/fetchFeedback',
      payload: {
        page_size:itemsPerPage,
        ..._tradeform
      }
    }).then((res) => {
      this.setState({ loading: false })
      if(feedback.id){
        const content = res.filter(item => item.id === feedback.id)
        this.checkModal(content[0])
      }
    })
      .catch(() => this.setState({ loading: false }))
  }

  componentDidUpdate(preprops) {
    const { shopid, feedback } = this.props
    const { count } = this.state
    if(preprops.shopid !== shopid && shopid !== ''){
      this.setState({ loading: true })
      this.initData('reset')
    }
    if(feedback.length > 0 && count < 6){
      this.timer = setTimeout(() => {
        this.setState({ count: count + 1 })
      },500)
    }
    else{
      clearTimeout(this.timer)
    }
  }

  componentWillUnmount() {
    const { tradeform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ feedback: {...tradeform } }
    })
    clearTimeout(this.timer)
  }

  //更新状态
  handleModal = (url,solve) =>{
    const { dispatch } = this.props
    const that = this
    Modal.confirm({
      title:'确认操作',
      content:<Fragment>该反馈问题<span style={{color:'red'}}>{!solve ? '已解决' : '重新打开为未解决'}</span></Fragment>,
      centered: true,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        that.setState({ loading: true })
        dispatch({ type: 'costom/_postUrlData', payload:{ url, data: { solve: !solve ? 'true' : 'false' } }})
          .then((res) => {
            if(res){
              that.initData()
            }
            else{
              that.setState({ loading: false })
            }
          })
      }
    })
  }
  //查看反馈`
  checkModal = (record) => {
    const type = (record.goods && 'goods') || (record.order && 'order') || ''
    const content = String(record.content).replace(/\n/g, '<br />')
    const that = this
    Modal.confirm({
      icon: <Icon type="info-circle" style={{color:"#1890ff"}}/>,
      title:`反馈内容详情${record.solve ? '(已解决)' : ''}`,
      content: (
        <Fragment>
          <Tabs type="card">
            <TabPane tab="反馈情况" key="1">
              <div>用户名：
                {record.user_info &&
                <span style={{cursor: 'pointer'}} onClick={() => this.toUserDeatal(record.user) }>
                  <img src={record.user_info.avatar_url} width="30" height="30" alt="" />
                  <span style={{marginLeft: 10 }}>
                    {record.user_info.nickname}
                  </span>
                </span>}
              </div>
              <div style={{margin:'10px 0'}}>电话号码：<a href={`tel:${record.phone}`}>{record.phone}</a></div>
              <div style={{margin:'10px 0'}}>反馈时间：{moment(record.add_time).format('YYYY-MM-DD kk:mm:ss')}</div>
              <div style={{margin:'15px 0'}}>反馈{type && type === 'goods' ? '商品' : '订单'}：{type
                ? <a onClick={() => this.toGoodpage(record.goods || record.order,
                  (record.goods && record.goods_info) || (record.order && record.order_info), type)}>
                  {type === 'goods' ? '商品' : '订单'}详情<Icon type="export" />
                </a> : null}</div>
              <div style={{margin:'10px 0'}}>反馈内容：</div>
              <div style={{overflowY:'auto',maxHeight:'calc(30vh)'}} dangerouslySetInnerHTML={{__html:content}}/>
            </TabPane>
            <TabPane tab="操作日志" key="2">
              <LocaleProvider locale={zh_CN}>
                <Table
                  dataSource={record.operation_log || []}
                  columns={this.logcolumns}
                  rowKey="add_time"
                  size="small"
                />
              </LocaleProvider>
            </TabPane>
          </Tabs>
        </Fragment>
      ),
      width: '60%',
      centered: true,
      className: styles.infoModal,
      cancelText: '取消',
      okText: <span>{ record.solve ? '标记为未解决' : '标记为已解决'  }</span>,
      onOk() { record.update_status ? that.handleModal(record.update_status,record.solve) : null }
    })
  }
  //跳转商品详情
  toGoodpage = (id,info,type) => {
    const orderType = {
      ord: { detail:'/order/orderlist/editorder', gooddetail: '/good/ordgood/goodlist/editgood' },
      sub: { detail:'/order/subscribeOrderlist/subscribeEditorder', gooddetail: '/good/subgood/subscribegood/subscribeEdit'},
      replace: { detail:'/order/replOrderlist/editreplorder', gooddetail: '/good/replacegood/replacegoodlist/editreplacegood' },
    }
    const pathname = type === 'goods' ? orderType[info.model_type].gooddetail : orderType[info.model_type].detail
    this.props.history.push({ pathname,  query: { id }})
    Modal.destroyAll()
  }
  //用户跳转
  toUserDeatal = (id) =>{
    this.props.history.push({ pathname: `/user/userlist/edituser`, query:{ id }})
    Modal.destroyAll()
  }

  //筛选条件
  handletradeform = (e,key) =>{
    const { tradeform } = this.state
    tradeform[key] = e
    this.setState({  tradeform });
  }
  ondateChange = (date, dateString) => {
    const { tradeform } = this.state
    tradeform['add_time_after'] = dateString[0]
    tradeform['add_time_before'] = dateString[1]
    this.setState({ tradeform });
  }
  searchSubmit = () => {
    this.initData('search')
  }

  render(){
    const { feedback, feedbackCount } = this.props
    const { tradeform, loading } = this.state
    let shopid = getLocalStorage("shopid").split('#')[0]

    const pagination = {
      pageSize: itemsPerPage,
      current: tradeform.page || 1,
      total: feedbackCount,
      onChange: (page) => {
        const { dispatch } = this.props
        this.setState({ tradeform:{...tradeform, page}, loading: true });
        shopid !== 'all' ? tradeform.shop = shopid : null
        dispatch({
          type:'user/fetchFeedback',
          payload: {
            ...tradeform,
            page,
            page_size:itemsPerPage,
          }
        }).then(() => this.setState({ loading: false }))
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
                  <span className={styles.searchitem_span}>微信用户: </span>
                  <Input
                    value={tradeform.nickname}
                    onChange={(e) => {this.handletradeform(e.target.value,'nickname')} }
                    placeholder="请输入用户名"
                    style={{ width: 200 }}/>
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>电话号码: </span>
                  <Input
                    value={tradeform.phone}
                    onChange={(e) => {this.handletradeform(e.target.value,'phone')} }
                    placeholder="请输入电话号码"
                    style={{ width: 200 }}/>
                </div>
              </Fragment>}
            renderAdvancedForm={() =>
              <Fragment>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>是否解决: </span>
                  <Select
                    value={tradeform.solve}
                    onChange={(e) => {this.handletradeform(e,'solve')} }
                    style={{ width: 200 }}
                  >
                    <Option value="true">已解决</Option>
                    <Option value="false">未解决</Option>
                  </Select>
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>反馈时间: </span>
                  <RangePicker
                    value={tradeform.add_time_after ? [moment(tradeform.add_time_after, 'YYYY-MM-DD'), moment(tradeform.add_time_before, 'YYYY-MM-DD')] : null}
                    onChange={this.ondateChange}
                  />
                </div>
              </Fragment>
            }/>
        </Spin>
        <Row>
        <Col  span={24} style={{ textAlign: 'right' }}>
        <div style={{marginBottom: 20}}>
          <Button type="primary" style={{marginLeft: 30}} onClick={this.searchSubmit}>查询</Button>
          <Button type="danger" style={{ marginLeft: 20}} onClick={() => this.initData('reset')}>重置</Button>
        </div>
        </Col>
        </Row>
        <Table
          loading={loading}
          dataSource={feedback}
          columns={this.columns}
          pagination={pagination}
          rowKey="url"
          scroll={{ x: 850 }}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Feedback
