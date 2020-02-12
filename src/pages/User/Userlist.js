import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import moment from 'moment';
import {
  Input,
  Button,
  Select,
  Table,
  message,
  Card,
  Icon,
  Row,
  Col,
  DatePicker, Spin,
  Modal } from 'antd';
import { setLocalStorage } from '@/utils/authority';
import { permissionAuth } from '@/utils/permission';
import styles from './userlist.less';
import CollapseItem from '@/components/CostomCom/collapseItem';

const { RangePicker } = DatePicker;
const Option = Select.Option;
const itemsPerPage = 10;

@connect(({ user, trade, global, loading }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  permissions: global.permissions,
  searchform: global.searchform,
  userlist: user.userlist,
  userlistCount: user.userlistCount,
  UserlistLoading: loading.effects['user/fetch'],
  levelList: trade.levelList,
}))
class Userlist extends Component {
  state = {
    searchform: {},
    page: 1,
    _columns: [],
    _switch: {},
    fixed: 0,
  };

  columns = [
    {
      title: '微信用户',
      dataIndex: 'avatar_url',
      key: 'avatar_url',
      align: 'left',
      render: (t,r) => (
        <Fragment>
          <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: r.id }} }>
            <img src={t} width="30" height="30" alt="" />
            <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
              overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
              {r.nickname}
            </span>
          </Link>
        </Fragment>
      ),
    },
    {
      title: '介绍人',
      dataIndex: 'referrer',
      key: 'referrer',
      align: 'left',
      render: (t) => ( t.id &&
        <Fragment>
          <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: t.id }} }>
            { t.avatar_url && <img src={t.avatar_url} width="30" height="30" alt="" /> }
            <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
              overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
              {t.nickname}
            </span>
          </Link>
        </Fragment>
      ),
    },
    {
      title: '会员等级',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: t => t && t.title,
    },
    {
      title: '会员钱包余额(元)',
      dataIndex: 'asset',
      key: 'asset',
      render: (t, r) => (t + r.recharge).toFixed(2),
    },
    {
      title: '用户性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 90,
      render: t => <span>{t === 1 ? '男' : '女'}</span>,
    },
    {
      title: '加入时间',
      dataIndex: 'date_joined',
      key: 'date_joined',
      width: 170,
      render: t => (t ? moment(t).format('YYYY-MM-DD HH:mm:ss') : null),
    },
    {
      title: '测试人员',
      dataIndex: 'testers',
      key: 'testers',
      render: (t, r) => (
        <span
          onClick={() => this.handleModalUser(r.url, t, r.nickname, 'testers')}
          style={{ cursor: 'pointer' }}
        >
          {t ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </span>
      ),
    },
    {
      title: '短视频上传',
      dataIndex: 'upload_perm',
      key: 'upload_perm',
      render: (t, r) => (
        <span
          onClick={() => this.handleModalUser(r.url, t, r.nickname, 'upload_perm')}
          style={{ cursor: 'pointer' }}
        >
          {t ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (t, r) => (
        <Fragment>
          <Link to={{ pathname: `/user/userlist/edituser`, query:{id: r.url.split('/').reverse()[1] }} }>
            <span>查看</span>
          </Link>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/resetSearchFormKey',
      payload: { key: 'user' },
    }).then(() => {
      this.initdata('init');
    });
    dispatch({ type: 'trade/fetchlevelList', payload: { page: 1, page_size: 100 } });
  }

  initdata = type => {
    const {
      dispatch,
      searchform: { user },
    } = this.props;
    const { searchform } = this.state;
    let _searchform = {};
    if (type === 'init') {
      _searchform = { ...user };
      this.setState({ searchform: { ...user } });
    } else if (type === 'reset') {
      this.setState({ searchform: {} });
    } else if (type === 'search') {
      _searchform = { ...searchform, page: 1 };
      this.setState({ searchform: { ..._searchform } });
    } else {
      _searchform = { ...searchform };
    }
    dispatch({
      type: 'user/fetch',
      payload: {
        page_size: itemsPerPage,
        ..._searchform,
      },
    });
  };

  switch = () => {
    const { bonus_switch, rebate_switch } = this.props;
    const _switch = { bonus_switch, rebate_switch }
    this.setState({ _switch });
    const bonus = {
      title: '分销返佣',
      dataIndex: 'bonus_right',
      key: 'bonus_right',
      width: 90,
      render: (t, r) => (
        <span
          onClick={() => this.handleModalUser(r.url, t, r.nickname, 'bonus_right')}
          style={{ cursor: 'pointer' }}
        >
          {t === 'true' ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </span>
      ),
    };
    const rebate = {
      title: '商品推广返利',
      dataIndex: 'rebate_right',
      key: 'rebate_right',
      render: (t, r) => (
        <span
          onClick={() => this.handleModalUser(r.url, t, r.nickname, 'rebate_right')}
          style={{ cursor: 'pointer' }}
        >
          {t === 'true' ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </span>
      ),
    };
    const _columns = [...this.columns];
    if (rebate_switch) {
      _columns.splice(7, 0, rebate);
    }
    if (bonus_switch) {
      _columns.splice(7, 0, bonus);
    }
    this.setState({ _columns });
  };

  componentDidUpdate(preprops, prestats) {
    const { bonus_switch, rebate_switch } = preprops;
    const { _switch } = prestats;
    if (bonus_switch !== _switch.bonus_switch || rebate_switch !== _switch.rebate_switch) {
      this.switch();
    }
    const { userlist } = this.props;
    const { fixed } = this.state;
    if (userlist.length > 0 && !fixed) {
      this.timer = setTimeout(() => {
        this.setState({ fixed: 1 });
      }, 200);
    }
  }

  componentWillUnmount() {
    const { searchform } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'global/searchFormKey',
      payload: { user: { ...searchform } },
    });
  }

  handleSearchChange = (e, key) => {
    const { searchform } = this.state;
    searchform[key] = e;
    this.setState({ searchform });
  };

  ondateChange = (date, stringData) => {
    const { searchform } = this.state;
    searchform.date_joined_after = stringData[0];
    searchform.date_joined_before = stringData[1];
    this.setState({ searchform });
  };

  handleSearch = () => {
    this.initdata('search');
  };

  // 弹窗显示是否切换分销、返利、测试模式
  handleModalUser = (url, type_bool, name, type_name) => {
    let cn_type_name = '', dispatch_type = '', _type_bool = '';
    if (type_name === 'testers') {
      cn_type_name = '测试人员';
      dispatch_type = 'user/testerUser';
      _type_bool = !type_bool;
    } else if (type_name === 'bonus_right') {
      cn_type_name = '分销返佣';
      dispatch_type = 'user/bonusUser';
      _type_bool = type_bool === 'true' ? 'false' : 'true';
    } else if (type_name === 'rebate_right') {
      cn_type_name = '推广返利';
      dispatch_type = 'user/rebateUser';
      _type_bool = type_bool === 'true' ? 'false' : 'true';
    } else if (type_name === 'upload_perm') {
      cn_type_name = '短视频上传';
      dispatch_type = 'user/videoUser';
      _type_bool = !type_bool;
    }
    this.handleTester(url, _type_bool, name, type_name, cn_type_name, dispatch_type);
  };

  handleTester = (url, type_bool, name, en_type_name, cn_type_name, dispatch_type) => {
    const { dispatch, permissions } = this.props;
    const edit = permissions.includes(permissionAuth.changeWxuser);
    const that = this;
    Modal.confirm({
      title: '确认操作 ',
      content: (
        <span>确认用户{name}
          <span style={{ color: 'red' }}>
            {isNaN(type_bool)
              ? type_bool === 'true' ? `启动` : `关闭`
              : !type_bool ? `关闭` : `启动`}
          </span>
          {cn_type_name} 功能
        </span>
      ),
      centered: true,
      okText: '确认',
      okType: 'primary',
      cancelText: '取消 ',
      onOk() {
        if (edit) {
          dispatch({
            type: dispatch_type,
            payload: {
              url,
              [en_type_name]: type_bool,
            },
          })
            .then(res => {
              that.initdata();
              message.success(res);
            })
            .catch(err => {
              message.error(err);
            });
        } else {
          message.error('您没有进行该操作的权限！');
        }
      },
    });
  };

  render() {
    const { searchform, _columns } = this.state;
    const { userlist, userlistCount, UserlistLoading, levelList, rebate_switch, bonus_switch } = this.props

    const pagination = {
      pageSize: itemsPerPage,
      current: searchform.page,
      total: userlistCount,
      onChange: page => {
        this.setState({ searchform: { ...searchform, page } });
        const { dispatch } = this.props;
        dispatch({
          type: 'user/fetch',
          payload: {
            ...searchform,
            page,
            page_size: itemsPerPage,
          },
        });
      },
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.main}>
            <Spin spinning={false}>
              <CollapseItem
                renderSimpleForm={() => (
                  <Fragment>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>微信用户: </span>
                      <Input
                        onChange={e => {
                          this.handleSearchChange(e.target.value, 'nickname');
                        }}
                        value={searchform.nickname}
                        placeholder="请输入微信用户"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>会员等级: </span>
                      <Select
                        style={{ width: 200 }}
                        onChange={e => {
                          this.handleSearchChange(e, 'level');
                        }}
                        value={searchform.level}
                      >
                        {levelList.map(item => (
                          <Option value={item.title} key={item.id}>{item.title}</Option>
                        ))}
                      </Select>
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>加入时间: </span>
                      <RangePicker
                        value={
                          searchform.date_joined_after
                            ? [
                              moment(searchform.date_joined_after, 'YYYY-MM-DD'),
                              moment(searchform.date_joined_before, 'YYYY-MM-DD'),
                            ]
                            : null
                        }
                        onChange={this.ondateChange}
                      />
                    </div>
                    {bonus_switch ? (
                      <div className={styles.searchitem}>
                        <span className={styles.searchitem_span}>分销返佣: </span>
                        <Select
                          style={{ width: 200 }}
                          onChange={e => {
                            this.handleSearchChange(e, 'bonus_right');
                          }}
                          value={searchform.bonus_right}
                        >
                          <Option key="true" value="true">是</Option>
                          <Option key="false" value="false">否</Option>
                        </Select>
                      </div>
                    ) : null}
                    {rebate_switch ? (
                      <div className={styles.searchitem}>
                        <span className={styles.searchitem_span}>商品推广返利: </span>
                        <Select
                          style={{ width: 200 }}
                          onChange={e => {
                            this.handleSearchChange(e, 'rebate_right');
                          }}
                          value={searchform.rebate_right}
                        >
                          <Option key="true" value="true">是</Option>
                          <Option key="false" value="false">否</Option>
                        </Select>
                      </div>
                    ) : null}
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>测试人员: </span>
                      <Select
                        style={{ width: 200 }}
                        onChange={e => {
                          this.handleSearchChange(e, 'testers');
                        }}
                        value={searchform.testers}
                      >
                        <Option key="true" value="true">是</Option>
                        <Option key="false" value="false">否</Option>
                      </Select>
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>短视频上传: </span>
                      <Select
                        style={{ width: 200 }}
                        onChange={e => {
                          this.handleSearchChange(e, 'upload_perm');
                        }}
                        value={searchform.upload_perm}
                      >
                        <Option key="true" value="true">是</Option>
                        <Option key="false" value="false">否</Option>
                      </Select>
                    </div>
                  </Fragment>
                )}
              />
            </Spin>
            <div style={{ marginBottom: 20 }}>
              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Button type="primary" style={{ marginRight: 30 }} onClick={this.handleSearch}>
                    查询
                  </Button>
                  <Button type="danger" onClick={() => this.initdata('reset')}>
                    重置
                  </Button>
                </Col>
              </Row>
            </div>
            <Table
              loading={UserlistLoading}
              dataSource={userlist}
              columns={_columns}
              pagination={pagination}
              rowKey="url"
              scroll={{ x: 1200 }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Userlist;
