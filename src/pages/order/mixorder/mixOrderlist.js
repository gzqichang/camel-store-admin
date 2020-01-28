import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import moment from 'moment';
import { Button, Card, Table, Select, Spin, DatePicker, Input, Modal, InputNumber, Row, Col } from 'antd';
import styles from '../orderlist.less';
import CountDown from '@/components/CountDown';
import CollapseItem from '@/components/CostomCom/collapseItem';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const itemsPerPage = 10;
const status_group = {
  build: '拼团中',
  done: '拼团成功',
  fail: '拼团失败',
};

@connect(({ costom, ptgroup, global, loading }) => ({
  ptList: ptgroup.ptList,
  ptCount: ptgroup.ptCount,
  shopid: global.shopid,
  searchform: global.searchform,
  ptLoading: loading.effects['ptgroup/fetchptgroup'],
}))
class mixOrderlist extends Component {
  state = {
    getptList: [],
    endOpen: false,
    orderform: {},
    loading: false,
    visible:false,
    rowdata: {},
    robot: '',
    robot_goods: ''
  };

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'mixorder' }
    }).then(() => { this.initData('init') })
  }
  initData = type => {
    const { dispatch, searchform:{ mixorder } } = this.props;
    const { orderform } = this.state;
    let _orderform = {}
    if(type === 'init'){
      _orderform = { ...mixorder }
      this.setState({ orderform:{ ...mixorder } })
    }
    else if(type === 'reset'){
      this.setState({ orderform:{} })
    }
    else if(type === 'search'){
      _orderform = { ...orderform, page: 1 }
      this.setState({ orderform:{ ..._orderform } })
    }
    else{
      _orderform = { ...orderform }
    }
    let shopid = getLocalStorage('shopid').split('#')[0]
    shopid !== 'all' ? _orderform.shop = shopid : null
    dispatch({
      type: 'ptgroup/fetchptgroup',
      payload: {
        page_size: itemsPerPage,
        ..._orderform,
      },
    })
  };

  componentDidUpdate(preprops, nextstate) {
    const { shopid } = this.props
    if(preprops.shopid !== shopid && shopid !== ''){
      this.initData('reset')
    }
  }

  componentWillUnmount() {
    const { orderform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ mixorder: {...orderform} }
    })
  }

  openModal = (record,key) => {
    this.setState({ visible: true, robot: record.robot, robot_goods: record.robot_goods,rowdata:{...record} })
  }

  personHandle = (e,key) => {
    this.setState({ [key]: e })
  }
  //提交添加的拼团数据
  addDataModal = () => {
    const { dispatch } = this.props;
    const { rowdata, robot, robot_goods } = this.state
    const that = this
    Modal.confirm({
      title: '确认操作',
      content: '拼团数据一旦添加不可扣减，请确认是否添加',
      centered: true,
      okText: '确认',
      cancelText:'取消',
      onOk() {
        dispatch({
          type:'costom/_putUrlData',
          payload:{
            url: rowdata.url,
            data:{ robot, robot_goods }
          }
        }).then((res) => {
          if(res){
            that.setState({ visible: false })
            that.initData()
          }
        })
      }
    })
  }

  handleOrderform = (e, key) => {
    const { orderform } = this.state;
    orderform[key] = e;
    this.setState({ orderform });
  };
  ondateChange = (date, dateString) => {
    const { orderform } = this.state;
    orderform['add_time_after'] = dateString[0];
    orderform['add_time_before'] = dateString[1];
    this.setState({ orderform });
  };
  searchSubmit = () => {
    this.initData('search')
  };

  render() {
    const { ptCount, ptLoading, ptList } = this.props;
    const { loading, orderform, add_time, visible, robot, robot_goods, rowdata } = this.state;
    let shopid = getLocalStorage('shopid')
    const pagination = {
      pageSize: itemsPerPage,
      current: orderform.page || 1,
      total: ptCount,
      onChange: page => {
        this.setState({ orderform:{ ...orderform, page } });
        const { dispatch } = this.props;
        shopid !== 'all' ? orderform.shop = shopid.split("#")[0] : null
        dispatch({
          type: 'ptgroup/fetchptgroup',
          payload: {
            ...orderform,
            page,
            page_size: itemsPerPage,
          },
        });
      },
    };

    const columns = [
      {
        title: '拼团号',
        dataIndex: 'ptgroup_no',
        key: 'ptgroup_no',
        width:100,
      },
      {
        title: '拼团商品',
        dataIndex: 'goods_name',
        key: 'goods_name',
      },
      {
        title: '拼团发起人',
        dataIndex: 'owner',
        key: 'owner',
        align: 'left',
        render: (t) => (
          <Fragment>
            <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: t.id }} }>
              <div style={{display:'flex',alignItems:'center'}}>
              <img src={t.avatar_url} width="30" height="30" alt="" />
              <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'120px',
                overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
                {t.nickname}
              </span>
              </div>
            </Link>
          </Fragment>
        ),
      },
      {
        title: '拼团发起时间',
        dataIndex: 'add_time',
        key: 'add_time',
        render: t => (t ? moment(t).format('YYYY-MM-DD kk:mm:ss') : null),
      },
      {
        title: '实际拼团情况',
        dataIndex: 'statusinfo',
        key: 'statusinfo',
        render: (t,r) => <Fragment>{r.partake_count}人<br/>{r.goods_count}件</Fragment>
      },
      {
        title: '后台添加拼团数据',
        dataIndex: 'fake',
        key: 'fake',
        width:150,
        render: (t,r) =>
          <span>
            {r.robot}
            <span style={{marginLeft:5,marginRight:10}}>人</span>
            {r.robot_goods}
            <span style={{marginLeft:5}}>件</span>
            {r.status === 'build' ?
              <Fragment><br/><a onClick={() => this.openModal(r,r.key)}>编辑</a></Fragment>
              : null
            }
          </span>
      },
      {
        title: '拼团倒计时',
        dataIndex: 'less_time',
        key: 'less_time',
        width:150,
        render: (t,r) => (<CountDown style={{ fontSize: 16 }} target={(new Date(r.end_time).getTime())} />),
      },
      {
        title: '拼团状态',
        dataIndex: 'status',
        key: 'status',
        width:100,
        render: t => <span>{status_group[t]}</span>,
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width:80,
        render: (text, record) => (
          <Fragment>
          <span>
            <Link to={{ pathname: `/order/mixOrderlist/mixeditorder`, query:{ id:record.id} }}>编辑</Link>
          </span>
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading} tip="数据整理中">
          <Card className={styles.main}>
            <Spin spinning={false}>
              <CollapseItem
                renderSimpleForm={() =>
                  <Fragment>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>拼团号: </span>
                      <Input
                        value={orderform.ptgroup_no}
                        onChange={(e) => this.handleOrderform(e.target.value, 'ptgroup_no')}
                        placeholder="请输入拼团号"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>拼团发起人昵称: </span>
                      <Input
                        value={orderform.user}
                        onChange={(e) => this.handleOrderform(e.target.value, 'user')}
                        placeholder="请输入用户名"
                        style={{ width: 200 }}
                      />
                    </div>
                  </Fragment>}
                renderAdvancedForm={() =>
                  <Fragment>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>拼团商品: </span>
                      <Input
                        value={orderform.goods_name}
                        onChange={(e) => this.handleOrderform(e.target.value, 'goods_name')}
                        placeholder="请输入商品名"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>拼团状态: </span>
                      <Select
                        value={orderform.status}
                        onChange={(e) => this.handleOrderform(e, 'status')}
                        style={{ width: 200 }}
                      >
                        <Option value="build">拼团中</Option>
                        <Option value="done">拼团成功</Option>
                        <Option value="fail">拼团失败</Option>
                      </Select>
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>拼团发起时间: </span>
                      <RangePicker
                        value={orderform.add_time_after ? [moment(orderform.add_time_after, 'YYYY-MM-DD'), moment(orderform.add_time_before, 'YYYY-MM-DD')] : null}
                        onChange={this.ondateChange} />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>拼团用户昵称: </span>
                      <Input
                        value={orderform.partake}
                        onChange={(e) => this.handleOrderform(e.target.value, 'partake')}
                        placeholder="请输入用户名"
                        style={{ width: 200 }}
                      />
                    </div>
                  </Fragment>
                }/>
            </Spin>
            <Row><Col style={{ textAlign: 'right', marginBottom: 10 }}>
              <Button type="primary" style={{ marginLeft: 30 }} onClick={this.searchSubmit}>查询</Button>
              <Button type="danger" style={{ marginLeft: 20 }} onClick={() => this.initData('reset')}>
                重置
              </Button>
            </Col></Row>

            <Table
              loading={ptLoading}
              dataSource={ptList}
              columns={columns}
              pagination={pagination}
              rowKey="url"
              scroll={{ x: 1250 }}
            />
            <Modal visible={visible} centered
                   title="添加拼团数据"
                   onCancel={() => this.setState({ visible:false })}
                   onOk={() => this.addDataModal()}>
              <div>
                <span style={{width: 140, display: 'inline-block', textAlign:'right'}}>
                  添加拼团人数：
                </span>
                <InputNumber value={robot} style={{ width:150 }}
                             precision={0}
                             min={rowdata.robot}
                             onChange={(e) => this.personHandle(e,'robot')}/>
              </div><br/>
              <div>
                <span style={{width: 140, display: 'inline-block', textAlign:'right'}}>
                  添加拼团商品件数：
                </span>
                <InputNumber value={robot_goods} style={{ width:150 }}
                             precision={0}
                             min={Math.max(robot,rowdata.robot_goods)}
                             onChange={(e) => this.personHandle(e,'robot_goods')}/>
              </div>
              <div style={{marginLeft: 30,marginTop:10}}>
                <a>添加的商品件数不得小于人数</a>
              </div>
            </Modal>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default mixOrderlist;
