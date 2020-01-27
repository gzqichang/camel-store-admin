import {
  getExtensionList,
  createOrder,
  createPayment,
  cancelOrder,
  queryOrder
} from "@/services/cloud";

export default {
  namespace: "cloud",

  state: {
    isCancel: false,
    extensions: [],
    orderInfo: {}
  },

  effects: {
    *fetchExtensionList(_, { call, put }) {
      const ext = yield call(getExtensionList);
      if (ext && ext.results) {
        const rs = ext.results.map(item => {
          return {
            isBrought:
              item.receipt_info !== null &&
              item.receipt_info.is_brought === true,
            expired:
              item.receipt_info === null ? null : item.receipt_info.expire_date,
            ...item
          };
        });
        yield put({
          type: "save",
          payload: { extensions: rs }
        });
        return rs;
      }
      return null;
    },

    *createOrder(
      {
        payload: { id }
      },
      { call, put }
    ) {
      const orderInfo = yield call(createOrder, id);
      yield put({
        type: "save",
        payload: { orderInfo }
      });
      return orderInfo;
    },

    *createPayment(
      {
        payload: { order_sn }
      },
      { call }
    ) {
      return yield call(createPayment, order_sn);
    },

    *awaitProcessing(_, { call, put, select }) {
      const delay = t => new Promise(resolve => setTimeout(resolve, t * 1000));
      let isCancel = null;
      let order_sn = "";
      let status = 0;
      // Order.NEW: 0,
      // Order.FINISHED: 1,
      // Order.CLOSED: 2,
      yield put({
        type: "save",
        payload: { isCancel: true }
      });
      while (true) {
        yield delay(1);
        order_sn = yield select(state => state.cloud.orderInfo.order_sn);
        isCancel = yield select(state => state.cloud.isCancel);
        if (isCancel === false) break;
        if (order_sn) {
          const _ = yield call(queryOrder, order_sn);
          status = _.status;
          if (status === 2) break;
          if (status === 1) {
            yield delay(2);
            yield put({ type: "fetchExtensionList" });
            yield put({ type: "global/queryConfig" });
            break;
          }
        }
      }
      return status;
    },

    *cancelOrder(
      {
        payload: { order_sn }
      },
      { call, put }
    ) {
      yield put({
        type: "save",
        payload: {
          isCancel: false,
          orderInfo: {}
        }
      });
      return yield call(cancelOrder, order_sn);
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
