import React, {Component, Fragment} from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {connect} from 'dva';
import {setLocalStorage, getLocalStorage} from '@/utils/authority';
import {InputNumber, Form, Button, Card, Spin, message, Modal, Input, Upload, Icon, Row, Col} from 'antd';
import styles from '../shopsetting.less';

const FormItem = Form.Item;

@connect(({wechat, loading}) => ({
  loading: loading.models.wechat,
  wechatConfig: wechat.value,
  valueConcat: wechat.valueConcat,
}))
class Wechat extends Component {
  state = {
    isEdit: false,
  };

  componentDidMount() {
    this.init();
  }

  init = () => {
    this.props.dispatch({type: 'wechat/fetchConfig'});
  };

  handleSubmit = () => {
    const {dispatch, wechatConfig} = this.props;
    const payload = {
      wx_lite_secret: wechatConfig.wx_lite_secret,
    };
    const _ = {
      wx_lite_secret: '小程序密钥',
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
        this.setState({isEdit: false});
      });
  };

  toggleIsEdit = () => {
    this.setState(({isEdit}) => ({
      isEdit: !isEdit,
    }));
  };

  handleValues = payload => {
    this.props.dispatch({
      type: 'wechat/save',
      payload,
    });
  };

  render() {
    const {isEdit} = this.state;
    const {loading, wechatConfig, valueConcat} = this.props;
    const formItemLayout = {
      labelCol: {sm: {span: 8}, lg: {span: 5}},
      wrapperCol: {sm: {span: 16}, lg: {span: 19}},
    };

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading || false}>
          <Card
            title="小程序基础设置"
            style={{marginBottom: 20}}
            extra={
              <Fragment>
                {isEdit ? (
                  <Fragment>
                    <Button type="primary" style={{marginLeft: 8}} onClick={this.handleSubmit}>
                      保存
                    </Button>
                    <Button
                      style={{marginLeft: 8}}
                      onClick={() => {
                        this.toggleIsEdit();
                        this.props.dispatch({
                          type: 'wechat/save',
                          payload: {value: valueConcat},
                        });
                      }}
                    >
                      取消
                    </Button>
                  </Fragment>
                ) : (
                  <Button type="primary" style={{marginLeft: 8}} onClick={this.toggleIsEdit}>
                    编辑
                  </Button>
                )}
              </Fragment>
            }
          >
            <Form>
              <FormItem label="小程序 APPID" required {...formItemLayout}>
                <Input
                  value={wechatConfig.wx_lite_app || ''}
                  style={{width: 200}}
                  disabled
                />
              </FormItem>
              <FormItem label="小程序密钥" required {...formItemLayout}>
                <Input
                  value={wechatConfig.wx_lite_secret || ''}
                  style={{width: 200}}
                  disabled={!isEdit}
                  onChange={({currentTarget: {value}}) =>
                    this.handleValues({
                      value: {
                        ...wechatConfig,
                        wx_lite_secret: value,
                      },
                    })
                  }
                />
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
              <p><b>小程序 APPID：</b>每个小程序的唯一标识，不可变更；</p>
              <p><b>小程序密钥：</b>查看流程：打开微信小程序后台，点击右侧 “开发选项 - 开发设置” 进行查看；</p>
            </Card>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Wechat;
