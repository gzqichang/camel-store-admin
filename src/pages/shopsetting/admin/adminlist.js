import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage } from '@/utils/authority';
import { Button, Card, Table, Modal, Select, Divider, Row, Col, Input, Spin } from 'antd';
import styles from '../shopsetting.less';
import CollapseItem from '@/components/CostomCom/collapseItem';

const Option = Select.Option;
const itemsPerPage = 10;

@connect(({ user, shopsetting, global, loading }) => ({
  adminlist: user.adminlist,
  adminCount: user.adminCount,
  searchform: global.searchform,
  adminloading: loading.effects['user/fetchAdmin'],
}))
class Adminlist extends Component {
  state = {
    adminform: {},
    shoplist: [],
    adminType: [],
    pwdloading: false
  };

  columns = [
    {
      title: '管理员名称',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '管理员类型',
      dataIndex: 'groups_name',
      key: 'groups_name',
      width: 110,
    },
    {
      title: '所属门店',
      dataIndex: 'shop_name',
      key: 'shop_name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (t) => <a href={`mailto:${t}`}>{t}</a>
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (t) => <a href={`tel:${t}`}>{t}</a>
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (t, r) => (
        <Fragment>
          <span onClick={() => this.delModal(r.id, r.username)}>
            <a>删除</a>
          </span>
          <Divider type="vertical" />
          <span onClick={() => this.pwdModal(r.reset_password_url, r.username)}>
            <a>重置密码</a>
          </span>
          <Divider type="vertical" />
          <Link to={{ pathname: `/setting/adminlist/editadmin`, query:{ id: r.id } }}>
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
      payload:{ key:'admin' }
    }).then(() => { this.initData('init') })
    this.getstoreOption()
  }
  initData = (type) => {
    const { dispatch, searchform:{ admin } } = this.props;
    const { adminform } = this.state;
    let _adminform = {}
    if(type === 'init'){
      _adminform = { ...admin }
      this.setState({ adminform:{ ...admin } })
    }
    else if(type === 'reset'){
      this.setState({ adminform:{} })
    }
    else if(type === 'search'){
      _adminform = { ...adminform, page: 1 }
      this.setState({ adminform:{ ..._adminform } })
    }
    else{
      _adminform = { ...adminform }
    }
    dispatch({
      type: 'user/fetchAdmin',
      payload: {
        page_size: itemsPerPage,
        ..._adminform
      },
    })
  };
  getstoreOption = () => {
    const { shoplist } = this.state
    const { dispatch } = this.props
    dispatch({
      type: 'shopsetting/fetchStores',
      payload:{
        page:1,
        page_size:100
      }
    }).then((res) => {
      this.setState({ shoplist: res })
    })
    dispatch({
      type: 'user/queryAdmingroup',
      payload:{
        page:1,
        page_size:100
      }
    }).then((res) => {
      this.setState({ adminType: res.results })
    })
  }

  componentWillUnmount(){
    const { adminform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ admin: {...adminform} }
    })
  }

  //重置密码
  pwdModal = (url, name) => {
    const { dispatch } = this.props;
    const that = this
    Modal.confirm({
      title:`确定操作`,
      content: `确定重置用户 ${name} 的密码，重置完成后该用户需使用初始密码登录`,
      centered: true,
      okText: `确定`,
      okType: 'danger',
      cancelText: `取消`,
      onOk() {
        that.setState({ pwdloading: true })
        dispatch({
          type: 'user/setpwdAdmin',
          payload:{
            url,
          }
        }).then(() => that.setState({ pwdloading: false }))
      }
    })
  };

  //删除管理员
  delModal = (id, name) => {
    const { dispatch } = this.props;
    const that = this
    Modal.confirm({
      title: '确认删除 ',
      content: `确认删除 ${name} 管理员`,
      centered: true,
      okText: '确认删除 ',
      okType: 'danger',
      cancelText: '取消 ',
      onOk() {
        dispatch({
          type:'user/delAdmin',
          payload:{ id }
        }).then(() => {
          that.initData()
        })
      },
    });
  };

  //搜索框
  handleChange = (key, value) => {
    const { adminform } = this.state
    adminform[key] = value
    this.setState({ adminform })
  };
  handlesubmit = () => {
    this.initData('search')
  };

  render() {
    const { adminform, pwdloading, shoplist, adminType } = this.state;
    const { adminlist, adminCount, adminloading } = this.props;

    const pagination = {
      pageSize: itemsPerPage,
      current: adminform.page,
      total: adminCount,
      onChange: page => {
        this.setState({ adminform: {...adminform, page } });
        const { dispatch } = this.props;
        dispatch({
          type:'user/fetchAdmin',
          payload:{
            ...adminform,
            page,
            page_size: itemsPerPage,
          }
        })
      },
    };

    return (
      <PageHeaderWrapper>
        <Card className={styles.main}>
          <Spin spinning={pwdloading} tip="操作中">
          <CollapseItem
              renderSimpleForm={() =>
                <Fragment>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>管理员名称: </span>
                    <Input
                      placeholder="请输入管理员名称"
                      style={{ width: 200 }}
                      value={adminform.username__contains}
                      onChange={e => this.handleChange('username__contains', e.target.value)}
                    />
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>管理员类型: </span>
                    <Select
                      style={{ width: 200 }}
                      placeholder="请选择"
                      value={adminform.groups}
                      onChange={(e) => this.handleChange('groups',e)}
                    >
                      {adminType.map(item => <Option value={item.id} key={item.id} label={item.name}>{item.name}</Option>)}
                    </Select>
                  </div>
                </Fragment>}
              renderAdvancedForm={() =>
                <Fragment>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>所属门店: </span>
                    <Select
                      placeholder="请选择"
                      style={{ width: 200 }}
                      value={adminform.shop}
                      onChange={(e) => this.handleChange('shop',e)}
                    >
                      {shoplist.map(item => <Option value={item.id} key={item.id} label={item.name}>{item.name}</Option>)}
                    </Select>
                  </div>
                </Fragment>
              }/>
          <Row style={{ marginBottom: 20 }}>
            <Col>
              <div style={{ float: 'left' }}>
                <Link to={{ pathname: `/setting/adminlist/editadmin`, query: { id: null} }}>
                  <Button type="primary">
                    {' '}
                    + 新增管理员
                  </Button>
                </Link>
              </div>
              <div style={{ float: 'right' }}>
                <Button type="primary" onClick={this.handlesubmit}>
                  搜索
                </Button>
                <Button type="danger" style={{ marginLeft: 20 }} onClick={() => this.initData('reset')}>
                  重置
                </Button>
              </div>
            </Col>
          </Row>
          <Table
            loading={adminloading}
            dataSource={adminlist}
            columns={this.columns}
            pagination={pagination}
            rowKey="id"
            scroll={{ x: 850 }}
          />
          </Spin>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Adminlist;
