import React, { Component } from "react";
import { connect } from "dva";
import { formatMessage, FormattedMessage } from "umi/locale";
import { Alert } from "antd";
import Login from "@/components/Login";
import styles from "./Login.less";
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects["login/login"],
  codeLoading: loading.effects["login/getcode"]
}))
class LoginPage extends Component {
  state = {
    type: "account",
    autoLogin: true,
    codeimg: null,
    challengekey: "key"
  };
  componentDidMount() {
    this.onGetchallenge();
  }

  onTabChange = type => {
    this.setState({ type });
  };

  onGetchallenge = () => {
    this.onGetCaptcha()
      .then(res => {
        this.setState({
          codeimg: res && res.image_url,
          challengekey: res && res.key
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      const { dispatch } = this.props;
      dispatch({ type: "login/getcode" })
        .then(resolve)
        .catch(reject);
    });

  handleSubmit = (err, values) => {
    const { type, challengekey } = this.state;
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: "login/login",
        payload: {
          ...values,
          key: challengekey
        }
      }).then(res => {
        if (!res) {
          this.onGetchallenge();
        }
      });
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked
    });
  };

  renderMessage = content => (
    <Alert
      style={{ marginBottom: 24 }}
      message={content}
      type="error"
      showIcon
    />
  );

  render() {
    const { login, submitting, codeLoading } = this.props;
    const { type, codeimg } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Tab
            key="account"
            tab={formatMessage({ id: "app.login.tab-login-credentials" })}
          >
            {login.status === "error" &&
              login.type === "account" &&
              !submitting &&
              this.renderMessage("账户或密码错误")}
            <UserName
              name="username"
              placeholder="用户名"
              style={{ width: 360 }}
            />
            <Password
              name="password"
              placeholder="密码"
              style={{ width: 360 }}
            />
            <Captcha
              name="challenge"
              placeholder="验证码"
              onGetchallenge={this.onGetchallenge}
              codeimg={codeimg}
              codeLoading={codeLoading}
              onPressEnter={() =>
                this.loginForm.validateFields(this.handleSubmit)
              }
            />
          </Tab>

          <div />
          <Submit loading={submitting} style={{ width: 360 }}>
            <FormattedMessage id="app.login.login" />
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
