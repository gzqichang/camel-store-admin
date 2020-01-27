import {
  getWxappInfo,
  getWxappStatus,
  releaseWxapp,
  updateWxapp,
  submitWxapp,
  getWechatConfig,
  updateWechatConfig,
  getPayjsConfig,
  updatePayjsConfig
} from "@/services/wechat";

export default {
  namespace: "wechat",

  state: {
    info: {},
    status: {},
    value: {},
    valueConcat: {}
  },

  effects: {
    *fetchInfo(_, { call, put }) {
      const info = yield call(getWxappInfo);
      yield put({
        type: "save",
        payload: { info }
      });
      return info;
    },

    *releaseWxapp(_, { call }) {
      return yield call(releaseWxapp);
    },

    *updateWxappCode(_, { call, put }) {
      yield call(updateWxapp);
      return yield put({ type: "fetchInfo" });
    },

    *submitWxapp(_, { call, put }) {
      yield call(submitWxapp);
      return yield put({ type: "fetchInfo" });
    },

    *queryWxappStatus(_, { call, put }) {
      const status = yield call(getWxappStatus);
      yield put({
        type: "save",
        payload: { status }
      });
      return status;
    },

    *fetchConfig({ payload }, { call, put }) {
      const response = yield call(getWechatConfig, payload);
      yield put({
        type: "save",
        payload: {
          valueConcat: response,
          value: response
        }
      });
    },

    *updateConfig({ payload }, { call, put }) {
      yield call(updateWechatConfig, payload);
      yield put({ type: "fetchConfig" });
    },

    // payjs查询
    *fetchPayJs(_, { call }) {
      const res = yield call(getPayjsConfig);
      if (res) {
        return res;
      }
    },

    *updatePayJs({ payload }, { call }) {
      const res = yield call(updatePayjsConfig, payload);
      if (res) {
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
