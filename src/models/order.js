import {
  getOrderList,
  getOrderitemList,
  getOrderData,
  getExpresslist,
  createExpress,
  delExpress,
  checkOrder,
  expressList
} from "@/services/order";
import { message } from "antd";
import moment from "moment";

export default {
  namespace: "order",

  state: {
    orderlist: [],
    orderlistCount: 0,
    suborderlist: [],
    suborderlistCount: 0,
    replorderlist: [],
    replorderlistCount: 0,
    qrpayorderlist: [],
    qrpayorderCount: 0,
    orderdata: null,
    exportList: [],
    expresslist: [],
    expresslistCount: 0,
    expressAllList: []
  },

  effects: {
    *fetchOrder({ payload }, { call, put }) {
      const { model_type } = payload;
      const response = yield call(getOrderList, payload);
      response.results.map((item, index) => (item.key = index));
      if (model_type === "ord") {
        yield put({
          type: "save",
          payload: {
            orderlist: Array.isArray(response.results) ? response.results : [],
            orderlistCount: response.count
          }
        });
      } else if (model_type === "sub") {
        yield put({
          type: "save",
          payload: {
            suborderlist: Array.isArray(response.results)
              ? response.results
              : [],
            suborderlistCount: response.count
          }
        });
      } else if (model_type === "repl") {
        yield put({
          type: "save",
          payload: {
            replorderlist: Array.isArray(response.results)
              ? response.results
              : [],
            replorderlistCount: response.count
          }
        });
      } else if (model_type === "qrpay") {
        yield put({
          type: "save",
          payload: {
            qrpayorderlist: Array.isArray(response.results)
              ? response.results
              : [],
            qrpayorderCount: response.count
          }
        });
      }
      return response.results;
    },

    *fetchOrderdata({ payload }, { call, put }) {
      const response = yield call(getOrderData, payload);
      return response;
    },

    *fetchExportList({ payload }, { call, put }) {
      const { status } = payload;
      delete payload.status;
      delete payload.shop;
      const _pay = {
        ...payload,
        send_type:
          status === "has paid"
            ? "sending"
            : status === "done"
              ? "over"
              : status
      };
      const deliverymethod = {
        express: "快递物流",
        buyer: "用户自提",
        own: "商家自配送"
      };
      const response = yield call(getOrderitemList, _pay);
      let orders = [
        [
          "序号",
          "订单号",
          "商品",
          "规格",
          "数量",
          "价格（元）",
          "总价（元）",
          "下单时间",
          "配送方式",
          "订单状态"
        ]
      ]; // 总的列表
      let count = 1; // 标记 “序号”
      let page = 1; // 总页数
      if (response) {
        const total = response.count;
        if (total > 500) {
          page = total / 500;
          if (total % 500 > 0) page++;
        }
      }
      const parse = rep => {
        rep.map(item => {
          orders.push([
            count,
            item.order_sn,
            item.goods_backup.goods_name || "",
            item.goods_backup.gtype_name || "",
            item.goods_backup.num || "",
            item.goods_backup.price || "",
            (
              Number(item.goods_backup.price) * Number(item.goods_backup.num)
            ).toFixed(2) || "",
            item.add_time &&
              moment(item.add_time).format("YYYY-MM-DD kk:mm:ss"),
            (item.goods_backup.delivery_method &&
              deliverymethod[item.goods_backup.delivery_method]) ||
              "",
            item.zh_send_type || ""
          ]);
          count++;
        });
      };
      if (response && response.results) {
        parse(response.results);
        if (page > 1) {
          for (let i = 2; i < page; i++) {
            const _payload = {
              ..._pay,
              page: i,
              page_size: 500
            };
            const res = yield call(getOrderitemList, _payload);
            if (res && res.results) parse(res.results);
          }
        }
      }
      yield put({
        type: "save",
        payload: { exportList: orders }
      });
    },

    *fetchqrExportList({ payload }, { call, put }) {
      const response = yield call(getOrderList, payload);
      let orders = [
        [
          "序号",
          "订单号",
          "订单金额（元）",
          "会员钱包金额（元）",
          "微信支付金额（元）",
          "支付时间",
          "微信用户",
          "订单状态"
        ]
      ]; // 总的列表
      let count = 1; // 标记 “序号”
      let page = 1; // 总页数
      const status_group = {
        paying: "待付款",
        done: "交易成功",
        close: "交易关闭"
      };
      if (response) {
        const total = response.count;
        if (total > 500) {
          page = total / 500;
          if (total % 500 > 0) page++;
        }
      }
      const parse = rep => {
        rep.map(item => {
          orders.push([
            count,
            item.order_sn,
            item.order_amount || "",
            item.wallet_pay || "",
            item.real_amount || "",
            item.pay_time &&
              moment(item.pay_time).format("YYYY-MM-DD kk:mm:ss"),
            item.user_name,
            (item.status && status_group[item.status]) || ""
          ]);
          count++;
        });
      };
      if (response && response.results) {
        parse(response.results);
        if (page > 1) {
          for (let i = 2; i < page; i++) {
            const _payload = {
              ...payload,
              page: i,
              page_size: 500
            };
            const res = yield call(getOrderList, _payload);
            if (res && res.results) parse(res.results);
          }
        }
      }
      yield put({
        type: "save",
        payload: { exportList: orders }
      });
    },

    //快递公司
    *getExpresslist({ payload }, { call, put }) {
      const response = yield call(getExpresslist, payload);
      response.results.map((item, index) => (item.key = index));
      if (response) {
        yield put({
          type: "save",
          payload: {
            expresslist: Array.isArray(response.results)
              ? response.results
              : [],
            expresslistCount: response.count
          }
        });
      }
    },
    *createExpress({ payload }, { call, put }) {
      const response = yield call(createExpress, payload);
      if (response) {
        message.success("创建成功！");
        return response;
      } else {
        message.error("创建失败！");
      }
    },

    *delExpress({ payload }, { call, put }) {
      const response = yield call(delExpress, payload);
      message.success("删除成功！");
      return response;
    },

    *checkorder({ payload }, { call, put }) {
      const res = yield call(checkOrder, payload);
      if (res) {
        if (res.status === "200") {
          return res.data;
        } else {
          message.error(res.message + "，请确认信息正确后重试");
        }
      }
    },

    //快递列表查询
    *expressAllList(_, { call, put }) {
      const res = yield call(expressList);
      if (res) {
        res.map((item, index) => (item.key = index));
        yield put({
          type: "save",
          payload: {
            expressAllList: Array.isArray(res) ? res : []
          }
        });
        return res;
      }
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload
      };
    }
  }
};
