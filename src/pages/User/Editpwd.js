import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Button, Card, Input, Row, message, Spin, Col } from 'antd';
import { getLocalStorage } from '../../utils/authority';
import styles from './userlist.less';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
const FormItem = props => (
  <Form.Item className={styles.items} required {...formItemLayout} {...props} />
);

@connect(({ global, loading }) => ({
  userLoading: loading.effects['user/fetchUser'],
  user: global.whomi,
}))
class Editpwd extends Component {
  state = {
    userform: {},
    errorTips: {},
    loading: false,
  };

  //数据更改
  handleuser = (key, e) => {
    const { userform } = this.state;
    userform[key] = e;
    this.setState({ userform });
  };
  handlecancal = () => {
    router.goBack();
  };
  handlesubmit = () => {
    const { userform } = this.state;
    const {
      user: { url },
    } = this.props;
    let flag = true;
    let errorTips = {};
    Object.entries({
      pwd: '原密码',
      newpwd: '新密码',
      renewpwd: '确认密码',
    }).map(item => {
      if (!userform[item[0]] || userform[item[0]].trim().length < 1) {
        flag = false;
        errorTips[item[0]] = `${item[1]}不能为空`;
      }
      if (
        userform.renewpwd &&
        userform.newpwd &&
        userform.renewpwd.trim().length > 1 &&
        userform.newpwd.trim().length > 1 &&
        userform.renewpwd !== userform.newpwd
      ) {
        flag = false;
        errorTips.renewpwd = '两次密码输入不一致';
      }
    });

    this.setState({ errorTips });

    if (!flag || !url) return false;

    this.setState({ loading: true });

    this.props
      .dispatch({
        type: 'global/changePassword',
        payload: {
          url,
          params: {
            old_password: userform.pwd,
            new_password: userform.newpwd,
            re_password: userform.renewpwd,
          },
        },
      })
      .then(res => {
        this.setState({ loading: false });
        if (res && res.detail) {
          message.success(res.detail+'，请重新登录');
          this.props.dispatch({
            type: 'global/logout',
          })
        }
      });
  };

  render() {
    const { userform, errorTips, loading } = this.state;
    const { userLoading } = this.props;

    return (
      <PageHeaderWrapper loading={userLoading}>
        <Card className={styles.main} title="密码信息编辑">
          <Spin spinning={loading}>
            <Form className={styles.editform}>
              <FormItem
                label="原密码"
                validateStatus={errorTips.pwd && errorTips.pwd && 'error'}
                help={errorTips.pwd && errorTips.pwd}
              >
                <Input
                  type="password"
                  value={userform.pwd}
                  placeholder="请输入原密码"
                  onChange={e => this.handleuser('pwd', e.target.value)}
                />
              </FormItem>
              <FormItem
                label="新密码"
                validateStatus={errorTips.newpwd && errorTips.newpwd && 'error'}
                help={errorTips.newpwd && errorTips.newpwd}
              >
                <Input
                  type="password"
                  value={userform.newpwd}
                  placeholder="请输入新密码"
                  onChange={e => this.handleuser('newpwd', e.target.value)}
                />
              </FormItem>
              <FormItem
                label="请再次输入新密码"
                validateStatus={errorTips.renewpwd && errorTips.renewpwd && 'error'}
                help={errorTips.renewpwd && errorTips.renewpwd}
              >
                <Input
                  type="password"
                  value={userform.renewpwd}
                  placeholder="请再次输入新密码"
                  onChange={e => this.handleuser('renewpwd', e.target.value)}
                />
              </FormItem>
              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Button onClick={this.handlecancal}>取消</Button>
                  <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handlesubmit}>
                    保存
                  </Button>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Editpwd;
