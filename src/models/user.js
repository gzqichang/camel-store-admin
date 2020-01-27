import {
  query,
  queryUser,
  testerUser,
  bonusUser,
  rebateUser,
  videoUser,
  AccountCreditlist,
  queryAdmin,
  setpwdAdmin,
  createAdmin,
  readAdmin,
  updateAdmin,
  delAdmin,
  queryAdmingroup,
  getFeedbackList
} from "@/services/user";
import { message } from "antd";
import { routerRedux } from "dva/router";

export default {
  namespace: "user",

  state: {
    userlist: [],
    userlistCount: 0,
    currentUser: {},
    adminlist: [],
    adminCount: 0,
    feedback: [], //用户反馈
    feedbackCount: 0
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      response.results.map((item, index) => (item.key = index));
      yield put({
        type: "save",
        payload: {
          userlist: Array.isArray(response.results) ? response.results : [],
          userlistCount: response.count
        }
      });
    },

    *fetchUser({ payload }, { call, put }) {
      const res = yield call(queryUser, payload);
      if (res) {
        return res;
      }
    },

    *testerUser({ payload }, { call, put }) {
      const res = yield call(testerUser, payload);
      return new Promise((resolve, reject) => {
        if (res) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    },

    *videoUser({ payload }, { call, put }) {
      const res = yield call(videoUser, payload);
      return new Promise((resolve, reject) => {
        if (res) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    },

    *bonusUser({ payload }, { call, put }) {
      const res = yield call(bonusUser, payload);
      return new Promise((resolve, reject) => {
        if (res) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    },

    *rebateUser({ payload }, { call, put }) {
      const res = yield call(rebateUser, payload);
      return new Promise((resolve, reject) => {
        if (res) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    },

    *AccountCreditlist({ payload }, { call, put }) {
      const res = yield call(AccountCreditlist, payload);
      if (res) {
        res.results && res.results.map((item, index) => (item.key = index));
        return res;
      }
    },

    *fetchAdmin({ payload }, { call, put }) {
      const res = yield call(queryAdmin, payload);
      if (res) {
        res.results.map(item => (item.key = item.id));
        yield put({
          type: "save",
          payload: {
            adminlist: Array.isArray(res.results) ? res.results : [],
            adminCount: res.count
          }
        });
      }
    },

    *setpwdAdmin({ payload }, { call, put }) {
      const res = yield call(setpwdAdmin, payload);
      if (res) {
        message.success("密码重置成功");
        return res;
      }
    },

    *createAdmin({ payload }, { call, put }) {
      const res = yield call(createAdmin, payload);
      if (res) {
        message.success("创建成功");
        yield put(routerRedux.replace("/setting/adminlist"));
        return res;
      }
    },

    *readAdmin({ payload }, { call, put }) {
      const res = yield call(readAdmin, payload);
      if (res) {
        return res;
      }
    },

    *updateAdmin({ payload }, { call, put }) {
      const res = yield call(updateAdmin, payload);
      if (res) {
        message.success("修改成功");
        yield put(routerRedux.replace("/setting/adminlist"));
        return res;
      }
    },

    *delAdmin({ payload }, { call, put }) {
      const res = yield call(delAdmin, payload);
      if (res) {
        message.success("删除成功");
        return res;
      }
    },

    *queryAdmingroup({ payload }, { call, put }) {
      const res = yield call(queryAdmingroup, payload);
      if (res) {
        return res;
      }
    },
    //用户反馈
    *fetchFeedback({ payload }, { call, put }) {
      const response = yield call(getFeedbackList, payload);
      response.results.map((item, index) => (item.key = index));
      yield put({
        type: "save",
        payload: {
          feedback: Array.isArray(response.results) ? response.results : [],
          feedbackCount: response.count
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
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {}
      };
    }
  }
};
