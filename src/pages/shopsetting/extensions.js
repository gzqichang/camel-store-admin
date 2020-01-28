import React, {Component, Fragment} from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {connect} from 'dva';
import moment from 'moment';
import {setLocalStorage, getLocalStorage} from '@/utils/authority';
import {
  Form,
  Button,
  Card,
  Spin,
  Icon,
  Avatar,
  message,
  Modal,
} from 'antd';
import style from './shopsetting.less';


@connect(({cloud, loading}) => ({
  loading: loading.models.cloud,
  extensionsList: cloud.extensions,
}))
class Extensions extends Component {
  state = {
    loading: false,
  };

  componentDidMount() {
    this.init();
  }

  init = () => {
    const {dispatch} = this.props;
    dispatch({type: 'global/queryStorelogo'}).then((res) => {
      this.setState({
        square_logo: res.square_logo.url ? res.square_logo : '',
        rectangle_logo: res.rectangle_logo.url ? res.rectangle_logo : '',
      })
    })
    dispatch({
      type: 'cloud/fetchExtensionList',
    })
  }

  createOrder = ({id, title}) => {
    const {dispatch} = this.props;
    let _p = null;
    const process = () => {
      if (_p === null)
        _p = dispatch({
          type: 'cloud/awaitProcessing',
        });
      return _p;
    };
    const modal = Modal.confirm({
      title: `购买 ${title} 插件`,
      content: '',
      okText: '确认下单',
      cancelText: '取消',
      centered: true,
      keyboard: false,
      onOk: () => {
        modal.update({
          okText: '生成订单中',
        });
        dispatch({
          type: 'cloud/createOrder',
          payload: {id},
        }).then(({order_sn}) => {
          dispatch({
            type: 'cloud/createPayment',
            payload: {order_sn},
          }).then((code) => {
            modal.update({
              title: '支付',
              okText: '完成支付',
              cancelText: '取消订单',
              onCancel: () => {
                return dispatch({
                  type: 'cloud/cancelOrder',
                  payload: {order_sn},
                }).then((res) => {
                  if (res.message)
                    message.info(res.message);
                  modal.destroy();
                })
              },
              onOk: () => {
                return process().then(() => {
                  modal.destroy();
                });
              },
              content: (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    alt="logo"
                    src={`data:image/png;base64,${code}`}
                  />
                  <p style={{fontSize: '1.2em'}}>
                    请打开手机微信并扫码完成订单支付
                  </p>
                </div>
              ),
            });
          });
        });
        return process();
      },
    });
  }

  render() {
    const {extensionsList, loading} = this.props;

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading}>
          <Card title="插件市场">
            {
              extensionsList.map((item) => (
                <Card style={{maxWidth: 800, margin: 24}} hoverable>
                  <Card.Grid style={{width: '25%', boxShadow: 'none'}}>
                    <img alt="" src={item.cover} style={{width: '100%'}}/>
                  </Card.Grid>
                  <Card.Grid style={{width: '75%', boxShadow: 'none'}}>
                    <Card.Meta
                      title={
                        <div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <span>{item.title}</span>
                            <Button.Group>
                              <Button className={style.text} disabled>￥{item.price}/{item.duration}天</Button>
                              <Button
                                type='primary'
                                disabled={item.isBrought}
                                onClick={() => this.createOrder(item)}
                              >
                                {item.isBrought ? '已购买' : '购买'}
                              </Button>
                            </Button.Group>
                          </div>
                          {
                            item.isBrought && (
                              <div style={{
                                textAlign: 'right',
                                fontWeight: 'normal',
                                color: '#888',
                                fontSize: 13,
                              }}>
                                有效期至：{moment(item.expired).format('YYYY-MM-DD')}
                              </div>
                            )
                          }
                        </div>
                      }
                      description={item.description}
                    />
                  </Card.Grid>
                </Card>
              ))
            }
          </Card>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default Extensions
