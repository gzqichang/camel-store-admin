import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage } from '@/utils/authority'
import moment from 'moment'
import {
  Button,
  Card,
  Table,
  Modal,
  Select,
  Divider,
  DatePicker,
  message,
  Icon,
  Row,
  Col,
  Input, Spin,
} from 'antd';
import styles from '../trade.less';
import CollapseItem from '@/components/CostomCom/collapseItem';

const Option = Select.Option;
const itemsPerPage = 10;
const { RangePicker } = DatePicker;

@connect(({ trade, global, loading }) => ({
  shoplist:trade.shoplist,
  shoplistCount:trade.shoplistCount,
  searchform: global.searchform,
  shoploading:loading.effects['trade/fetchShop']
}))
class Msglist extends Component {

  state = {
    shopform:{},
  }

  columns = [
     {
      title: '消息标题',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
    }, {
      title: '排序',
      dataIndex: 'index',
      key: 'index'
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (t) => moment(t).format('YYYY-MM-DD kk:mm:ss')
    },{
      title: '启用',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (t,r) => (
        <span onClick={() => this.handleModaluse(r.id,!t,r.title)} style={{cursor:'pointer'}}>
            {t ?
              <Icon type="check-circle" theme="filled" style={{color:'green'}} /> :
              <Icon type="close-circle" theme="filled" style={{color:'red'}} />}
        </span>
      )
  },{
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width:160,
    render: (t, r) => (
      <Fragment>
         <span onClick={() => this.delModal(r.id,r.title)}>
           <a>删除</a>
         </span>
        <Divider type="vertical" />
        <Link to={{pathname: `/trade/shopmessage/editmessage`,query: { id:r.id}}}>
           <span>编辑</span>
        </Link>
      </Fragment>
   )
  }];

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'msg' }
    }).then(() => { this.initData('init') })
  }
  initData = (type) => {
    const { dispatch, searchform:{ msg } } = this.props
    const { shopform } = this.state
    let _shopform = {}
    if(type === 'init'){
      _shopform = { ...msg }
      this.setState({ shopform:{ ...msg } })
    }
    else if(type === 'reset'){
      this.setState({ shopform:{} })
    }
    else if(type === 'search'){
      _shopform = { ...shopform, page: 1 }
      this.setState({ shopform:{ ..._shopform } })
    }
    else{
      _shopform = { ...shopform }
    }
    dispatch({
      type:'trade/fetchShop',
      payload:{
        page_size: itemsPerPage,
        ..._shopform
      }
    })
  }

  componentWillUnmount(){
    const { shopform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ msg: {...shopform} }
    })
  }

  delModal = (id,name) => {
    const { dispatch } = this.props
    const that = this
    Modal.confirm({
      title: '确认删除 ',
      content: `确认删除 ${name} 店铺消息`,
      okText: '确认删除 ',
      centered: true,
      okType: 'danger',
      cancelText: '取消 ',
      onOk() {
        dispatch({
          type: 'trade/deleteShop',
          payload: { id: id },
        }).then(() => {
          that.initData()
          message.success('删除成功')
        }).catch(() => {
          message.error('删除失败')
        })
      },
    });
  }

  //日期处理
  onChange = (date, dateString) => {
    const { shopform } = this.state
    shopform['create_time_after'] = dateString[0]
    shopform['create_time_before'] = dateString[1]
    this.setState({ shopform })
  }

  //启用开关
  handleModaluse = (id,is_active,name) => {
    const { dispatch } = this.props
    const that = this
    Modal.confirm({
      title:`确认操作`,
      content:`确认 ${is_active ? `启动` : `关闭`} ${name}`,
      okText:`确认`,
      centered: true,
      okType: 'primary',
      cancelText: '取消 ',
      onOk() {
        dispatch({
          type:'trade/updateShop',
          payload:{
            id,
            data:{ is_active }
          }
        }).then(() => {
          that.initData()
        })
      }
    })
  }

  //搜索框
  handleshop = (key,e) => {
    const { shopform } = this.state
    shopform[key] = e
    this.setState({ shopform })
  }
  handlesubmit = () => {
    this.initData('search')
  }

  render(){
    const { shopform } = this.state
    const { shoplist, shoplistCount, shoploading } = this.props

    const pagination = {
      pageSize: itemsPerPage,
      current: shopform.page,
      total: shoplistCount,
      onChange: (page) => {
        this.setState({ shopform:{ ...shopform, page } });
        const { dispatch } = this.props;
        dispatch({
          type:'trade/fetchShop',
          payload:{
            ...shopform,
            page,
            page_size:itemsPerPage,
          }
        })
      }
    }

    return(
      <PageHeaderWrapper>
      <Card className={styles.trademain}>
        <Spin spinning={false}>
          <CollapseItem
            renderSimpleForm={() =>
              <Fragment>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>消息标题: </span>
                  <Input
                    placeholder="请输入消息标题"
                    style={{ width: 200 }}
                    value={shopform.title}
                    onChange={(e) => this.handleshop('title',e.target.value)}
                  />
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>创建时间: </span>
                  <RangePicker
                    value={shopform.create_time_after ? [moment(shopform.create_time_after, 'YYYY-MM-DD'), moment(shopform.create_time_before, 'YYYY-MM-DD')] : null}
                    onChange={this.onChange} />
                </div>
              </Fragment>}
            renderAdvancedForm={() =>
              <Fragment>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>是否启用: </span>
                  <Select
                    style={{ width: 200 }}
                    value={shopform.is_active}
                    onChange={(e) => this.handleshop('is_active',e)}
                  >
                    <Option value="true">是</Option>
                    <Option value="false">否</Option>
                  </Select>
                </div>
              </Fragment>
            }/>
        </Spin>
        <Row style={{marginBottom:20}}>
          <Col>
            <div style={{float: "left"}}>
              <Link to={{pathname: `/trade/shopmessage/editmessage`, query: {id:null} }}>
                <Button type='primary'> + 新增店铺消息</Button>
              </Link>
            </div>
            <div style={{float: "right"}}>
              <Button type='primary' onClick={this.handlesubmit}>搜索</Button>
              <Button type='danger' style={{marginLeft:20}} onClick={() => this.initData('reset')}>重置</Button>
            </div>
          </Col>
        </Row>
        <Table
          loading={shoploading}
          dataSource={shoplist}
          columns={this.columns}
          pagination={pagination}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Msglist
