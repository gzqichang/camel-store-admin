import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import { Input, Form, Button, Card, message, Row, Col, Select, Spin, InputNumber } from 'antd';
import styles from '../shopsetting.less';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props} />;
const Option = Select.Option;

@connect(({ user, shopsetting, loading }) => ({
  loading: loading.effects['user/readAdmin'],
}))
class Editadmin extends Component {
  state = {
    admindata: {},
    adminType: [],
    shoplist: [],
    loading: false,
    username: '',
  };

  componentDidMount() {
    const { dispatch, location } = this.props;
    this.setState({ loading: true });
    let id = location.query.id;
    if (id) {
      dispatch({
        type: 'user/readAdmin',
        payload: { id },
      }).then(res => {
        if (res) {
          res.groups.length > 0
            ? res.groups.map(item => {
              res.admingroup = { label: res.groups_name, key: item };
            })
            : (res.admingroup = { label: '', key: '' });
          res.shopgroup = [];
          res.shop.length > 0
            ? res.shop.map(item => {
              res.shopgroup.push({ label: '', key: item });
            })
            : (res.shopgroup = []);
          this.setState({
            admindata: res,
            username: res.username,
          });
        }
      });
    }
    dispatch({
      type: 'user/queryAdmingroup',
      payload: {
        page: 1,
        page_size: 100,
      },
    }).then(res => {
      this.setState({ adminType: res.results, loading: false });
    });
    this.getstoreOption();
  }

  getstoreOption = () => {
    const { shoplist } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'shopsetting/fetchStores',
      payload: {
        page: 1,
        page_size: 100,
      },
    }).then(res => {
      res.map(item => {
        let obj = { name: item.name, key: item.url };
        shoplist.push(obj);
      });
      this.setState({ shoplist });
    });
  };

  adminHandle = (key, e) => {
    const { admindata } = this.state;
    admindata[key] = e ? e : null;
    this.setState({ admindata });
  };
  validatingForm = args => {
    let tips = {
      username: '管理员用户名不能为空',
      admingroup: '管理员类型不能为空',
    };
    let tip1 = {
      email: '请输入合法的邮箱',
      phone: '请输入合法的手机号码',
      shopgroup: '请选择所属门店',
    };
    let flag = true;
    let reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/g;
    Object.keys(tips).map(item => {
      if (!args[item]) {
        message.error(tips[item]);
        flag = false;
      }
    });
    if (args.email && args.email.search(reg) === -1) {
      message.error(tip1.email);
      flag = false;
    }
    if (args.phone && !(/^1\d{10}$/.test(args.phone))) {
      message.error(tip1.phone);
      flag = false;
    }
    if (args.admingroup && args.admingroup.label === '管理员') {
      if (!args.shopgroup || !args.shopgroup.length) {
        message.error(tip1.shopgroup);
        flag = false;
      }
    }
    return flag;
  };

  handleSubmit = () => {
    const { dispatch, location } = this.props;
    const { admindata, username } = this.state;
    let id = location.query.id;
    let _type = id ? 'user/updateAdmin' : 'user/createAdmin';
    let _data = {},
      submitform = {};
    let flag = this.validatingForm({ ...admindata });
    if (flag) {
      submitform.username = admindata.username;
      submitform.groups = [admindata.admingroup.key];
      submitform.shop =
        admindata.shopgroup && admindata.shopgroup.length > 0
          ? admindata.shopgroup.map(item => {
              return item.key;
            })
          : [];
      admindata.email ? (submitform.email = admindata.email) : null;
      submitform.phone = admindata.phone;
      if (id) {
        _data = { id, data: { ...submitform } };
      } else {
        submitform.password = 'admin123123';
        submitform.is_active = true;
        _data = { data: { ...submitform } };
      }
      dispatch({
        type: _type,
        payload: { ..._data },
      }).then(res => {
        if (id === res.id) {
          setLocalStorage('username', res.username)
        }
      });
    }
  };

  render() {
    const { location } = this.props;
    const { admindata, adminType, loading, shoplist } = this.state;
    let id = location.query.id;

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading}>
          <Card className={styles.main} title={id ? '编辑管理员' : '新增管理员'}>
            <Form className={styles.editform}>
              <FormItem label="管理员用户名">
                <Input
                  style={{ width: 200 }}
                  placeholder="请输入用户名"
                  value={admindata.username}
                  onChange={e => this.adminHandle('username', e.target.value)}
                />
              </FormItem>
              <FormItem label="手机号码" required={false}>
                <InputNumber
                  precision={0}
                  style={{ width: 200 }}
                  placeholder="请输入联系方式"
                  value={admindata.phone}
                  onChange={e => this.adminHandle('phone', e)}
                />
              </FormItem>
              <FormItem label="接受消息邮箱" required={false}>
                <Input
                  type="email"
                  style={{ width: 200 }}
                  placeholder="请输入邮箱地址"
                  value={admindata.email}
                  onChange={e => this.adminHandle('email', e.target.value)}
                />
              </FormItem>
              <FormItem label="管理员类型">
                <Select
                  style={{ width: 200 }}
                  labelInValue
                  value={admindata.admingroup}
                  onChange={e => this.adminHandle('admingroup', e)}
                >
                  {adminType.map(item => (
                    <Option key={item.url} value={item.url} label={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem
                label="所属门店"
                style={
                  admindata.admingroup && admindata.admingroup.label
                    ? admindata.admingroup.label === '超级管理员'
                      ? { display: 'none' }
                      : {}
                    : { display: 'none' }
                }
              >
                <Select
                  mode="multiple"
                  labelInValue
                  showArrow
                  style={{ width: '100%' }}
                  value={admindata.shopgroup}
                  onChange={e => this.adminHandle('shopgroup', e)}
                >
                  {shoplist.map(item => (
                    <Option key={item.key} label={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem wrapperCol={{ offset: 4 }} style={id ? { display: 'none' } : {}}>
                新建管理员的初始密码默认为"admin123123"
              </FormItem>
              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Link to="/setting/adminlist">
                    <Button>取消</Button>
                  </Link>
                  <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleSubmit}>
                    保存
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Editadmin;
