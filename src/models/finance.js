import {
  getwithdrawalList,
  getwithdrawalData,
  withdrawalDataStatus,
  getaccountlogList,
  getRecgargelist
} from "@/services/finance";

export default {
  namespace: "finance",

  state: {
    withdrawallist: [], //提现记录
    withdrawallistCount: 0,
    accountlogList: [],
    accountlogListCount: 0,
    rechargelist: [], //充值记录
    rechargeCount: 0
  },

  effects: {
    //提现
    *getwithdrawalList({ payload }, { call, put }) {
      const response = yield call(getwithdrawalList, payload);
      const { page } = payload;
      response.results.map(
        (item, index) => (item.key = (page - 1) * 10 + index + 1)
      );
      yield put({
        type: "save",
        payload: {
          withdrawallist: Array.isArray(response.results)
            ? response.results
            : [],
          withdrawallistCount: response.count
        }
      });
    },

    *withdrawalDataStatus({ payload }, { call, put }) {
      const response = yield call(withdrawalDataStatus, payload);
      if (response) {
        return response;
      }
    },

    //返利
    *fetchaccountlogList({ payload }, { call, put }) {
      const response = yield call(getaccountlogList, payload);
      const { page } = payload;
      if (response) {
        response.results.map((item, index) => (item.key = index));
        yield put({
          type: "save",
          payload: {
            accountlogList: Array.isArray(response.results)
              ? response.results
              : [],
            accountlogListCount: response.count
          }
        });
        return response;
      }
    },

    //推广
    *getExpandData(_, { call, put }) {
      const res = yield call(getExpandData);
      if (res) {
        yield put({
          type: "save",
          payload: {
            bonus: res.bonus,
            rebate: res.rebate
          }
        });
      }
      return res;
    },

    *setExpandData({ payload }, { call, put }) {
      const res = yield call(setExpandData, payload);
      return new Promise((resolve, reject) => {
        if (res) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    },

    //充值记录
    *getRecgargelist({ payload }, { call, put }) {
      const response = yield call(getRecgargelist, payload);
      response.results.map((item, index) => (item.key = index + 1));
      yield put({
        type: "save",
        payload: {
          rechargelist: Array.isArray(response.results) ? response.results : [],
          rechargeCount: response.count
        }
      });
      return response.results;
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
