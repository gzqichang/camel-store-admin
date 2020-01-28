import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { getLocalStorage } from '@/utils/authority';
import {
  Button,
  Card,
  Spin,
  InputNumber,
  Form
} from 'antd';
import styles from '../orderlist.less';
import GoodInfoTable from '../component/goodInfoTable';
import OrderInfo from '../component/orderInfo';

const formItemLayout = {
  labelCol: { md: { span: 6 }, lg:{ span: 4 }, xxl:{ span: 2 } },
  wrapperCol: { md: { span: 18 }, lg:{ span: 18 }, xxl:{ span: 20 } },
};
const FormItem = props => <Form.Item {...formItemLayout} {...props} />;

@connect(({ order, costom, global, loading }) => ({
  shopid: global.shopid,
  expressLoading: loading.effects['order/getExpresslist'],
  orderLoading: loading.effects['order/fetchOrderdata'],
}))
class Editreplorder extends Component {
  state = {
    orderdata: {},
    orderdata_item: [],
    orderdata_item_form: {},
    edit_item: false,
    edit_order: false,
    singerform: {},
    onLoading: false,
    edit_real_mount: false,
    real_mount: 0,
    order_sn: null,
    express: [],own: [], buyer: []
  };

  componentDidMount() {
    this.initData();
  }

  componentWillUpdate(prepros, nextState) {
    const { location } = this.props;
    let id = location.query.id;
    const { shopid } = this.props
    if(nextState.orderid !== id){
      this.initData()
    }
    if(prepros.shopid !== shopid && shopid !== '' && id){
      this.props.history.push('/order/replOrderlist')
    }
  }

  initData = () => {
    const { dispatch, location } = this.props;
    let id = location.query.id;
    let data = location.query.is_pt ? { is_pt: true} : {}
    if (id) {
      this.setState({ onLoading: true });
      dispatch({
        type: 'order/fetchOrderdata',
        payload: { id, data },
      }).then(res => {
        let express = [], own = [], buyer = []
        res && res.items.map(item => {
          item.edit = false;
          item.key = item.id;
          if(item.goods_backup.delivery_method === 'express'){
            express.push(item)
          }
          else if(item.goods_backup.delivery_method === 'own'){
            own.push(item)
          }
          else if(item.goods_backup.delivery_method === 'buyer'){
            buyer.push(item)
          }
        });
        this.setState({
          orderdata: {...res},
          orderdata_item: res.items,
          onLoading: false,
          real_amount: Number(res.real_amount) + Number(res.wallet_pay),
          singerform: {...res.delivery_address },
          express,
          own,
          buyer
        });
      });
    }
    this.setState({
      orderid: id,
    });
  };

  render() {
    const {
      orderdata,
      orderdata_item,
      real_amount,
      singerform,
      onLoading,
      express,
      own,
      buyer
    } = this.state;
    const { location } = this.props
    let id = location.query.id;

    let goodprice = 0;
    orderdata_item.map(item => (goodprice = goodprice + item.price * item.num));

    return (
      <PageHeaderWrapper>
        <Spin spinning={onLoading} tip="正在加载数据中">
          <Card className={styles.main} title="商品信息">
            {express.length > 0 ?
              <Fragment>
                <GoodInfoTable
                  goodtype="repl"
                  fictitious={orderdata.fictitious}
                  location={location} value={{ rowdataid: id, orderdata_item:express, isdetail: true, delivery_method:'express' }}/>
              </Fragment>
              : null
            }
            {own.length > 0 ?
              <Fragment>
                <GoodInfoTable
                  goodtype="repl"
                  fictitious={orderdata.fictitious}
                  location={location} value={{ rowdataid: id, orderdata_item:own, isdetail: true, delivery_method:'own',pay_time:orderdata.pay_time }}/>
              </Fragment>
              : null
            }
            {buyer.length > 0 ?
              <Fragment>
                <GoodInfoTable
                  goodtype="repl"
                  fictitious={orderdata.fictitious}
                  location={location} value={{ rowdataid: id, orderdata_item:buyer, isdetail: true, delivery_method:'buyer' }}/>
              </Fragment>
              : null
            }
            <Form className={styles.bottomplane}>
              <FormItem label="订单积分">
                {real_amount} 积分
              </FormItem>
            </Form>
          </Card>
          <OrderInfo formdata={orderdata} singerform={singerform} ordertype="repl"/>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Editreplorder;
