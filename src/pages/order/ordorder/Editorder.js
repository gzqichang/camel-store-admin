import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import { connect } from "dva";
import { getLocalStorage } from "@/utils/authority";
import { Button, Card, Spin, InputNumber, Form } from "antd";
import styles from "../orderlist.less";
import GoodInfoTable from "../component/goodInfoTable";
import OrderInfo from "../component/orderInfo";

const formItemLayout = {
  labelCol: { md: { span: 6 }, lg: { span: 4 }, xxl: { span: 2 } },
  wrapperCol: { md: { span: 18 }, lg: { span: 18 }, xxl: { span: 20 } }
};
const FormItem = props => <Form.Item {...formItemLayout} {...props} />;

@connect(({ order, costom, global, loading }) => ({
  shopid: global.shopid,
  expressLoading: loading.effects["order/getExpresslist"],
  orderLoading: loading.effects["order/fetchOrderdata"]
}))
class Editorder extends Component {
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
    express: [],
    own: [],
    buyer: []
  };

  componentDidMount() {
    this.initData();
  }

  componentWillUpdate(prepros, nextState) {
    const { location } = this.props;
    let id = location.query.id;
    const { shopid } = this.props;
    if (nextState.orderid !== id) {
      this.initData();
    }
    if (prepros.shopid !== shopid && shopid !== "" && id) {
      this.props.history.push("/order/orderlist");
    }
  }

  initData = () => {
    const { dispatch, location } = this.props;
    let id = location.query.id;
    let data = location.query.is_pt ? { is_pt: true } : {};
    if (id) {
      this.setState({ onLoading: true });
      dispatch({
        type: "order/fetchOrderdata",
        payload: { id, data }
      }).then(res => {
        let express = [],
          own = [],
          buyer = [];
        res.items.map(item => {
          item.edit = false;
          item.key = item.id;
          if (item.goods_backup.delivery_method === "express") {
            express.push(item);
          } else if (item.goods_backup.delivery_method === "own") {
            own.push(item);
          } else if (item.goods_backup.delivery_method === "buyer") {
            buyer.push(item);
          }
        });
        this.setState({
          orderdata: { ...res },
          orderdata_item: res.items,
          onLoading: false,
          real_amount: Number(res.real_amount * 1) + Number(res.wallet_pay * 1),
          singerform: { ...res.delivery_address },
          express,
          own,
          buyer
        });
      });
    }
    this.setState({
      orderid: id
    });
  };

  //修改订单金额
  editChange = () => this.setState({ edit_real_mount: true });
  changeRealmount = type => {
    const { dispatch } = this.props;
    const { real_amount, orderdata } = this.state;
    if (type === "save") {
      this.setState({ onLoading: true });
      dispatch({
        type: "costom/_postUrlData",
        payload: {
          url: orderdata.adjust,
          data: { real_amount }
        }
      }).then(res => {
        res
          ? this.setState({
              real_amount: res.real_amount,
              orderdata: { ...orderdata, order_sn: res.order_sn }
            })
          : this.setState({ real_amount: orderdata.real_amount });
        this.setState({ edit_real_mount: false, onLoading: false });
      });
    } else {
      this.setState({
        real_amount:
          Number(orderdata.real_amount) + Number(orderdata.wallet_pay),
        edit_real_mount: false
      });
    }
  };

  render() {
    const {
      orderdata,
      orderdata_item,
      edit_real_mount,
      real_amount,
      singerform,
      onLoading,
      express,
      own,
      buyer
    } = this.state;
    const { location } = this.props;
    let id = location.query.id;

    let goodprice = 0;
    orderdata_item.map(item => (goodprice = goodprice + item.price * item.num));

    return (
      <PageHeaderWrapper>
        <Spin spinning={onLoading} tip="正在加载数据中">
          <Card className={styles.main} title="商品信息">
            {express.length > 0 ? (
              <Fragment>
                {!orderdata.fictitious && (
                  <h3>
                    <b>快递公司配送</b>
                  </h3>
                )}
                <GoodInfoTable
                  goodtype="ord"
                  location={location}
                  fictitious={orderdata.fictitious}
                  value={{
                    rowdataid: id,
                    orderdata_item: express,
                    isdetail: true,
                    delivery_method: "express"
                  }}
                />
              </Fragment>
            ) : null}
            {own.length > 0 ? (
              <Fragment>
                {!orderdata.fictitious && (
                  <h3>
                    <b>商家自配送</b>
                  </h3>
                )}
                <GoodInfoTable
                  goodtype="ord"
                  location={location}
                  fictitious={orderdata.fictitious}
                  value={{
                    rowdataid: id,
                    orderdata_item: own,
                    isdetail: true,
                    delivery_method: "own",
                    pay_time: orderdata.pay_time
                  }}
                />
              </Fragment>
            ) : null}
            {buyer.length > 0 ? (
              <Fragment>
                {!orderdata.fictitious && (
                  <h3>
                    <b>用户自提</b>
                  </h3>
                )}
                <GoodInfoTable
                  goodtype="ord"
                  location={location}
                  fictitious={orderdata.fictitious}
                  value={{
                    rowdataid: id,
                    orderdata_item: buyer,
                    isdetail: true,
                    delivery_method: "buyer"
                  }}
                />
              </Fragment>
            ) : null}
            <Form className={styles.bottomplane}>
              <FormItem label="商品总金额">
                <span>￥ {orderdata.order_amount}</span>
              </FormItem>
              <FormItem label="邮费">
                <span>￥ {orderdata.postage_total}</span>
              </FormItem>
              <FormItem label="订单金额">
                {orderdata.status === "paying" ? (
                  edit_real_mount ? (
                    <Fragment>
                      <InputNumber
                        value={real_amount}
                        style={{ width: 200 }}
                        min={0}
                        step={0.01}
                        size="small"
                        onChange={e => this.setState({ real_amount: e })}
                      />
                      <Button
                        type="primary"
                        size="small"
                        style={{ marginLeft: 20, marginRight: 20 }}
                        onClick={() => this.changeRealmount("save")}
                      >
                        保存
                      </Button>
                      <Button
                        size="small"
                        onClick={() => this.changeRealmount("cancel")}
                      >
                        取消
                      </Button>
                    </Fragment>
                  ) : (
                    <Fragment>
                      ￥ {Number(real_amount).toFixed(2)}
                      <Button
                        type="danger"
                        size="small"
                        style={{ marginLeft: 20 }}
                        onClick={this.editChange}
                      >
                        修改
                      </Button>
                    </Fragment>
                  )
                ) : (
                  <Fragment>￥ {Number(real_amount).toFixed(2)}</Fragment>
                )}
              </FormItem>
            </Form>
          </Card>
          <OrderInfo
            formdata={orderdata}
            singerform={singerform}
            ordertype="ord"
          />
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Editorder;
