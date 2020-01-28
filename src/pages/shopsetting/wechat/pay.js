import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import {
  Form,
  Button,
  Card,
  Spin,
  message,
  Tabs,
  Select,
  Input, Upload, Icon,
} from 'antd';
const formItemLayout = {
  labelCol: {sm: {span: 8}, lg: {span: 5}},
  wrapperCol: {sm: {span: 16}, lg: {span: 19}},
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props}/>;
const Option = Select.Option;
const {TabPane} = Tabs;

@connect(({ global, order, wechat, loading }) => ({
  loading: loading.models.wechat,
  wechatConfig: wechat.value,
  valueConcat: wechat.valueConcat,
  storeType: global.config.store_type,
}))

class Pay extends Component {
  state = {
    payInfo: {},
    _payInfo: {},
    isEdit: false,
  }

  componentDidMount(){
    const {dispatch, storeType} = this.props;
    dispatch({
      type: 'wechat/fetchPayJs',
    }).then(res => {
      if (res) {
        this.setState({
          payInfo: {
            ...res,
            switch: res.switch ? 'true' : 'false'
          },
          _payInfo: {
            ...res,
            switch: res.switch ? 'true' : 'false'
          }
        });
      }
    })
    setTimeout(() => storeType === 'cloud' && this.init(), 1000);
  }

  init = () => {
    this.props.dispatch({type: 'wechat/fetchConfig'});
  };

  handleSubmit = () => {
    const {dispatch} = this.props;
    const {payInfo} = this.state;
    // 个人支付
    if (payInfo.switch === 'true') {
      if (!payInfo.mchid || !payInfo.key) {
        message.error('商户号和通信密钥不能为空');
        return;
      }
      dispatch({
        type: 'wechat/updatePayJs',
        payload: {
          ...payInfo,
          notify_url: undefined,
        }
      }).then(res => {
        if (res) {
          this.setState({
            _payInfo: {...payInfo}
          })
          message.success(res);
        }
      })
    } else {
      this.handlePaySubmit();
    }
  }

  handlePaySubmit = () => {
    const {dispatch, wechatConfig} = this.props;
    const payload = {
      wx_pay_api_key: wechatConfig.wx_pay_api_key,
      wx_pay_mch_id: wechatConfig.wx_pay_mch_id,
      wx_pay_mch_cert: wechatConfig.wx_pay_mch_cert,
      wx_pay_mch_key: wechatConfig.wx_pay_mch_key,
    };
    const _ = {
      wx_pay_api_key: '商户 KEY',
      wx_pay_mch_id: '商户号',
      wx_pay_mch_cert: '商户证书',
      wx_pay_mch_key: '商户证书私钥',
    };
    for (let [k, v] of Object.entries(payload))
      if (!v || v === true) return message.error(`${_[k]} 不能为空`);
    dispatch({
      type: 'wechat/updateConfig',
      payload,
    })
      .then(() => {
        message.success('修改成功');
      })
      .catch(() => {
        message.error('修改失败');
      })
      .finally(() => {
        this.setState({
          pem: [],
          cert: [],
          isEdit: false,
        });
      });
  };

  toggleIsEdit = () => {
    const {_payInfo, payInfo} = this.state;
    this.setState(({isEdit}) => ({
      isEdit: !isEdit,
      payInfo: isEdit ? {..._payInfo} : {...payInfo},
    }));
  };

  handleValues = payload => {
    this.props.dispatch({
      type: 'wechat/save',
      payload,
    });
  };

  render() {
    const {payInfo, isEdit, cert, pem} = this.state;
    const {loading, wechatConfig, valueConcat, storeType} = this.props;

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading}>
          <Card
            title={'支付参数配置'}
            extra={<Fragment>
              {isEdit
                ? <Fragment>
                    <Button style={{marginRight: 8}}
                      onClick={() => {
                        this.toggleIsEdit();
                        if (storeType === 'cloud')
                          this.props.dispatch({
                            type: 'wechat/save',
                            payload: {value: valueConcat},
                          });
                      }}>取消</Button>
                  <Button type={'primary'} onClick={this.handleSubmit}>保存</Button>
                </Fragment>
                : <Button type={'primary'} onClick={this.toggleIsEdit}>编辑</Button>}
            </Fragment>}>
            <Form>
              <FormItem label={'支付渠道'}>
                <Select value={payInfo.switch} style={{width: 300}} onChange={(e) => this.setState({payInfo: { ...payInfo, switch: e}})}>
                  {storeType === 'cloud' && <Option key={'false'}>微信支付（需要公账）</Option> }
                  <Option key={'true'}>payJs（个人收款）</Option>
                </Select>
              </FormItem>
            </Form>
            <Tabs defaultActiveKey="2">
              {storeType === 'cloud' &&
              <TabPane tab={'微信支付（需要公账）'} key={'1'}>
                <Form>
                  <FormItem label="商户号" required {...formItemLayout}>
                    <Input
                      value={wechatConfig.wx_pay_mch_id || ''}
                      style={{width: 200}}
                      disabled={!isEdit}
                      onChange={({currentTarget: {value}}) =>
                        this.handleValues({
                          value: {
                            ...wechatConfig,
                            wx_pay_mch_id: value,
                          },
                        })
                      }
                    />
                  </FormItem>
                  <FormItem label="商户KEY" required {...formItemLayout}>
                    <Input
                      value={wechatConfig.wx_pay_api_key || ''}
                      style={{width: 300}}
                      disabled={!isEdit}
                      onChange={({currentTarget: {value}}) => {
                        if (value.length > 32) {
                          message.error('商户密钥应为32位')
                          return;
                        }
                        this.handleValues({
                          value: {
                            ...wechatConfig,
                            wx_pay_api_key: value,
                          },
                        })
                      }}
                    />
                  </FormItem>
                  <FormItem label="商户证书" required {...formItemLayout}>
                    <Upload
                      fileList={cert}
                      onRemove={() => {
                        this.handleValues({
                          value: {
                            ...wechatConfig,
                            wx_pay_mch_cert: undefined,
                          },
                        });
                        this.setState({cert: []});
                      }}
                      beforeUpload={file => {
                        if (file) {
                          this.handleValues({
                            value: {
                              ...wechatConfig,
                              wx_pay_mch_cert: file,
                            },
                          });
                          this.setState({cert: [file]});
                        }
                        return false;
                      }}
                    >
                      <Button disabled={!isEdit}>
                        <Icon type="upload"/> 上传
                      </Button>
                      {wechatConfig.wx_pay_mch_cert === true && !isEdit ? (
                        <span style={{paddingLeft: 15}}>
                      <Icon
                        type="check-circle"
                        style={{
                          paddingRight: 5,
                          color: 'green',
                        }}
                      />
                      已上传
                    </span>
                      ) : null}
                    </Upload>
                  </FormItem>
                  <FormItem label="商户私钥" required {...formItemLayout}>
                    <Upload
                      fileList={pem}
                      onRemove={() => {
                        this.handleValues({
                          value: {
                            ...wechatConfig,
                            wx_pay_mch_key: undefined,
                          },
                        });
                        this.setState({pem: []});
                      }}
                      beforeUpload={file => {
                        if (file) {
                          this.handleValues({
                            value: {
                              ...wechatConfig,
                              wx_pay_mch_key: file,
                            },
                          });
                          this.setState({pem: [file]});
                        }
                        return false;
                      }}
                    >
                      <Button disabled={!isEdit}>
                        <Icon type="upload"/> 上传
                      </Button>
                      {wechatConfig.wx_pay_mch_key === true && !isEdit ? (
                        <span style={{paddingLeft: 15}}>
                      <Icon
                        type="check-circle"
                        style={{
                          paddingRight: 5,
                          color: 'green',
                        }}
                      />
                      已上传
                    </span>
                      ) : null}
                    </Upload>
                  </FormItem>
                </Form>

                <Card
                  bordered={false}
                  bodyStyle={{
                    borderTop: '1px solid #eee',
                    marginTop: 24,
                  }}
                >
                  <div style={{fontSize: 16, fontWeight: 500}}>
                    <p>说明</p>
                  </div>
                  <p><b>商户号：</b>即微信商户平台登录账号，查看流程：打开微信商户平台，点击 “账号中心 - 个人信息” 进行查看；</p>
                  <p><b>商户KEY：</b>查看流程：打开微信商户平台，点击 “账户中心 - API安全 - 设置密钥” 进行查看</p>
                  <p><b>商户证书：</b>即API证书：apiclient_cert.pem文件</p>
                  <p><b>商户私钥：</b>即API证书：apiclient_key.pem文件</p>
                </Card>
              </TabPane>
              }
              <TabPane tab={'payJs（个人收款）'} key={'2'}>
                <Form>
                  <FormItem label={'payJs商户号'}>
                    <Input
                      value={payInfo.mchid}
                      style={{width: 300}}
                      disabled={!isEdit}
                      onChange={(e) => this.setState({payInfo: { ...payInfo, mchid: e.target.value}})}/>
                  </FormItem>
                  <FormItem label={'payJs通信密钥'}>
                    <Input
                      value={payInfo.key}
                      style={{width: 300}}
                      disabled={!isEdit}
                      onChange={(e) => this.setState({payInfo: { ...payInfo, key: e.target.value}})}/>
                  </FormItem>
                </Form>
                <Card
                  bordered={false}
                  bodyStyle={{
                    borderTop: '1px solid #eee',
                    marginTop: 24,
                  }}
                >
                  <div style={{fontSize: 16, fontWeight: 500}}>
                    <p>说明</p>
                  </div>
                  <p><b>payJs支付：</b>支持个人支付，需要前往payJs（<a href={'https://payjs.cn'} target={'_blank'}>https://payjs.cn</a>）注册和认证，获取商户号和密钥，填入上表，并切换支付渠道为“payJs（个人收款）”即可。设置后请上架低价商品进行测试，确保成功支付。</p>
                  <p><b>商户号和密钥：</b>扫码登录payJs管理后台，在“会员中心”找到“商户号”和“通信密钥”</p>
                  <p><b>费用：</b>payJs需要收取的费用，具体见：<a href={'https://payjs.cn/price'} target={'_blank'}>https://payjs.cn/price。</a></p>
                  <p style={{color: 'red'}}>*暂不支持IOS端</p>
                  {/*<p><b>易商户：</b>支持个人收款，需要前往易商户（<a href={'https://1shanghu.com/'} target={'_blank'}>https://1shanghu.com/</a>）注册和认证。通过审核后，获取AppKey、AppSecret填入上表，并切换支付渠道为“易商户（个人收款）”即可。设置后请上架低价商品进行测试，确保成功支付。</p>*/}
                  {/*<p><b>获取AppKey、AppSecret：</b>登录“易商户”管理后台 -> 开发与对接 -> 配置信息 -> 点击"创建一个" 或者复制已有 AppKey 和 AppSecret</p>*/}
                  {/*<p><b>费用：</b>易商户需要收取较高的费用，具体见：<a href={'https://1shanghu.com/roles'} target={'_blank'}>https://1shanghu.com/roles</a></p>*/}
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Pay;
