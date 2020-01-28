import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Button,
  Card,
  Table,
  Modal,
  Select,
  Row,
  Col,
  Input, Divider, Spin
} from 'antd';
import styles from '../shopsetting.less';
import CollapseItem from '@/components/CostomCom/collapseItem';

const itemsPerPage = 10;
const Option = Select.Option;

@connect(({ shopsetting, global, loading }) => ({
  storelist:shopsetting.storelist,
  storeCount:shopsetting.storeCount,
  config: global.config,
  searchform: global.searchform,
  storeloading: loading.effects['shopsetting/fetchStores'],
}))
class Storelist extends Component {
  state = {
    loading:false,
    storesform:{},
  }

  columns = [
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '门店地址',
      dataIndex: 'province',
      key: 'province',
      render: (t,r) => <span>{t+r.city + r.district + r.detail}</span>
    },
    {
      title: '门店状态',
      dataIndex: 'status',
      key: 'status',
      render: (t,r) => (
        <Select
          style={{width:100}}
          value={t}
          onChange={(e) => this.statusHandle(e,r.id,r.name)}
        >
          <Option value="open">营业中</Option>
          <Option value="close">休息中</Option>
        </Select>
      )
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width:160,
      render: (t, r) => (
        <Fragment>
          {
            this.props.storelist
            && this.props.storelist.length > 1
            && (
              <Fragment>
                <span onClick={() => this.delModal(r.id, r.name)}>
                  <a>删除</a>
                </span>
                <Divider type="vertical" />
              </Fragment>
            )
          }
          <Link to={{ pathname: `/setting/storelist/editstore`, query:{ id: r.id} }}>
            <span>编辑</span>
          </Link>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'store' }
    }).then(() => { this.initData('init') })
  }
  initData = (type) => {
    const { dispatch, searchform:{ store } } = this.props;
    const { storesform } = this.state
    let _storesform = {}
    if(type === 'init'){
      _storesform = { ...store }
      this.setState({ storesform:{ ...store } })
    }
    else if(type === 'reset'){
      this.setState({ storesform:{} })
    }
    else if(type === 'search'){
      _storesform = { ...storesform, page: 1 }
      this.setState({ storesform:{ ..._storesform } })
    }
    else{
      _storesform = { ...storesform }
    }
    dispatch({
      type: 'shopsetting/fetchStores',
      payload: {
        page_size:itemsPerPage,
        ..._storesform
      }
    }).then((res) => {
      if(res && res.length === 0 && getLocalStorage('shopid') !== 'all'){
        dispatch({ type: 'global/switchStore', payload: { shopurl: 'all', shopid:'all' }})
      }
    })
  }

  componentWillUnmount(){
    const { storesform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ store: {...storesform} }
    })
  }

  //门店状态切换
  statusHandle = (status,id,name) => {
    const that = this
    const { dispatch } = this.props
    Modal.confirm({
      title:"确认操作",
      content:`确认把 ${name} 门店的状态切换为 ${status === 'close' ? '休息中' : '营业中'}`,
      centered: true,
      okText: "确定",
      okType: 'danger',
      cancelText: "取消",
      onOk() {
        dispatch({
          type:'shopsetting/updateStore',
          payload:{
            id,
            data: { status }
          }
        }).then(() => {
          that.initData()
        })
      }
    })
  }

  //门店删除
  delModal = (id,name) => {
    const { dispatch } = this.props
    const that = this
    Modal.confirm({
      title: '确认操作',
      content: `确认删除 ${name} 门店和该门店下的信息`,
      centered: true,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        dispatch({
          type:'shopsetting/deleteStore',
          payload: { id }
        }).then(() => {
          that.initData()
        })
      }
    })
  }

  handletradeform = (e,key) =>{
    const { storesform } = this.state
    storesform[key] = e
    this.setState({  storesform });
  }
  searchSubmit = () => {
    this.initData('search')
  }

  render(){
    const { storelist, storeCount, storeloading,config } = this.props
    const { storesform } = this.state

    const pagination = {
      pageSize: itemsPerPage,
      current: storesform.page,
      total: storeCount,
      onChange: (page) => {
        this.setState({ storesform: {...storesform, page } });
        const { dispatch } = this.props
        dispatch({
          type: 'shopsetting/fetchStores',
          payload: {
            ...storesform,
            page,
            page_size:itemsPerPage,
          }
        })
      },
    };

    return(
      <PageHeaderWrapper>
      <Card className={styles.main}>
        <Spin spinning={false}>
        <CollapseItem
          show={config && config.store_type === 'camel'}
          renderSimpleForm={() =>
            <Fragment>
              <div className={styles.searchitem}>
                <span className={styles.searchitem_span}>门店名称: </span>
                <Input
                  value={storesform.name__contains}
                  onChange={(e) => {this.handletradeform(e.target.value,'name__contains')} }
                  placeholder="请输入门店名称"
                  style={{ width: 200 }}/>
              </div>
              <div className={styles.searchitem}>
                <span className={styles.searchitem_span}>门店地址: </span>
                <Input
                  value={storesform.address}
                  onChange={(e) => {this.handletradeform(e.target.value,'address')} }
                  placeholder="请输入门店地址"
                  style={{ width: 200 }}/>
              </div>
            </Fragment>}
          renderAdvancedForm={() =>
            <Fragment>
              <div className={styles.searchitem}>
                <span className={styles.searchitem_span}>门店状态: </span>
                <Select
                  style={{width:200}}
                  value={storesform.status}
                  onChange={(e) => this.handletradeform(e,'status')}
                >
                  <Option value="open">营业中</Option>
                  <Option value="close">休息中</Option>
                </Select>
              </div>
            </Fragment>
          }/>
          {config && config.store_type === 'camel' &&
          <Row style={{ marginBottom: 20 }}>
            <Col>
              <div style={{ float: 'left' }}>
                {
                  config && config.store_type === 'camel' && (
                    <Link to={{ pathname: `/setting/storelist/editstore`, query: { id: null } }}>
                      <Button type="primary">
                        + 新增门店
                      </Button>
                    </Link>
                  )
                }
              </div>
              <div style={{ float: 'right' }}>
                <Button type="primary" style={{ marginLeft: 30 }} onClick={() => this.searchSubmit()}>查询</Button>
                <Button type="danger" style={{ marginLeft: 20 }} onClick={() => this.initData('reset')}>重置</Button>
              </div>
            </Col>
          </Row>
          }
        <Table
          loading={storeloading}
          dataSource={storelist}
          columns={this.columns}
          pagination={pagination}
        />
        </Spin>
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Storelist
