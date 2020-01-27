import {
  queryNotices,
  queryStorename,
  queryStoreicon,
  setStoreicon,
  queryConfig,
  getUserinfo,
  queryWxappQRCode,
  changePassword as _changePassword
} from "@/services/api";
import { getOrderitemList } from "@/services/order";
import { getFeedbackList } from "@/services/user";
import {
  getLocalStorage,
  setLocalStorage,
  getAuthority,
  removeAllLocalStorage
} from "@/utils/authority";
import * as routerRedux from "react-router-redux";
import { reloadAuthorized } from "@/utils/Authorized";
import { notification } from "antd";
const version = "1.0.0";
const pageinit = { page: 1 };
export default {
  namespace: "global",

  state: {
    collapsed: false,
    isMobile: false,
    notices: [],
    storename: " ",
    storeicon: {},
    sendorderlist: [],
    allorderlist: [],
    sendorderCount: 0,
    rebate_switch: false,
    bonus_switch: false,
    config: {},
    appQRCode: {
      official: "",
      preview: ""
    },
    superadmin: false,
    permissions: [],
    shop: [],
    shopurl: "all",
    shopid: "",
    whomi: {},
    searchform: {
      order: { ...pageinit },
      suborder: { ...pageinit },
      mixorder: { ...pageinit },
      replorder: { ...pageinit },
      outorder: { ...pageinit },
      good: { ...pageinit },
      subgood: { ...pageinit },
      replgood: { ...pageinit },
      goodtem: { ...pageinit },
      subgoodtem: { ...pageinit },
      replgoodtem: { ...pageinit },
      recharge: { ...pageinit },
      profile: { ...pageinit },
      credit: { ...pageinit },
      money: { ...pageinit },
      user: { ...pageinit },
      teamuser: { ...pageinit },
      msg: { ...pageinit },
      swiper: { ...pageinit },
      qua: { ...pageinit },
      store: { ...pageinit },
      admin: { ...pageinit },
      feedback: { ...pageinit },
      video: { ...pageinit }
    },
    noticefeedback: [],
    noticefeedbackCount: 0,
    newfeedback: false,
    noticeclose: true
  },

  effects: {
    *fetchAppQRCode(_, { call, put }) {
      const { public_code = null, preview_code = null } = yield call(
        queryWxappQRCode
      ) || {};
      yield put({
        type: "save",
        payload: {
          appQRCode: {
            official: public_code,
            preview: preview_code
          }
        }
      });
    },
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: "saveNotices",
        payload: data
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: "saveClearedNotices",
        payload
      });
      yield put({
        type: "save",
        payload: {
          sendorderlist: [],
          sendorderCount: 0
        }
      });
    },

    *changeMobile({ payload }, { call, put }) {
      const { mobile } = payload;
      yield put({
        type: "changeLayoutmobile",
        payload: {
          isMobile: mobile
        }
      });
    },

    *queryStorename(_, { call, put }) {
      const data = yield call(queryStorename);
      if (data) {
        yield put({
          type: "save",
          payload: {
            storename: data
          }
        });
      }
    },
    *queryStorelogo(_, { call, put }) {
      const icon = yield call(queryStoreicon);
      if (icon) {
        yield put({
          type: "save",
          payload: {
            storeicon: icon
          }
        });
        return icon;
      }
    },
    *setStorelogo({ payload }, { call, put }) {
      return yield call(setStoreicon, payload);
    },

    *fetchFeedback({ payload }, { select, call, put }) {
      const response = yield call(getFeedbackList, payload);
      if (response) {
        response.results.map((item, index) => (item.key = index));
        yield put({
          type: "save",
          payload: {
            noticefeedback: Array.isArray(response.results)
              ? response.results
              : [],
            noticefeedbackCount: response.count
          }
        });
        return response.results;
      }
    },
    *recordFeedback({ payload }, { call, put }) {
      yield put({
        type: "save",
        payload: { ...payload }
      });
    },

    *audioFeedback(_, { call, put }) {
      yield put({
        type: "save",
        payload: { newfeedback: false }
      });
    },

    *sendingOrder({ payload }, { call, put }) {
      const response = yield call(getOrderitemList, payload);
      if (response) {
        response.results.map((item, index) => (item.key = index));
        const list = getLocalStorage("sendorderlist");
        let listid = [],
          count = 0;
        if (list) {
          let listdata = list.split(",");
          response.results.find(item => {
            if (!listdata.includes(item.id.toString())) {
              listid.push(item);
            }
          });

          yield put({
            type: "save",
            payload: {
              allorderlist: listid,
              sendorderlist: listid.length > 10 ? listid.slice(0, 10) : listid,
              sendorderCount: listid.length
            }
          });
        } else {
          yield put({
            type: "save",
            payload: {
              allorderlist: response.results,
              sendorderlist:
                response.results.length > 10
                  ? response.results.slice(0, 10)
                  : response.results,
              sendorderCount: response.count
            }
          });
        }
      }
    },

    *changePassword({ payload }, { call }) {
      return yield call(_changePassword, payload);
    },

    *queryConfig(_, { call, put }) {
      const res = yield call(queryConfig);
      if (res) {
        yield put({
          type: "save",
          payload: {
            bonus_switch: res.bonus_switch,
            rebate_switch: res.rebate_switch,
            config: res
          }
        });
        if (res.store_type === "cloud") {
          yield put({ type: "wechat/fetchInfo" });
          yield put({ type: "wechat/fetchConfig" });
        }
        return res;
      }
    },

    *fetchAuthority(_, { call, put }) {
      const resinfo = yield call(getUserinfo);
      const setshopid = getLocalStorage("shopid");
      const old_version = getLocalStorage("version");
      if (old_version && old_version !== version) {
        removeAllLocalStorage();
        reloadAuthorized();
        yield put({
          type: "save",
          payload: { permissions: [], shopid: "", shopurl: "", shop: [] }
        });
        yield put(routerRedux.replace("/users/login"));
      } else {
        setLocalStorage("version", version);
      }

      if (resinfo) {
        yield put({
          type: "save",
          payload: {
            whomi: resinfo,
            permissions: resinfo.permissions
          }
        });
        if (resinfo && resinfo.groups_name === "超级管理员") {
          if (!setshopid) {
            setLocalStorage("shopid", "all");
          }
          yield put({
            type: "save",
            payload: {
              superadmin: true,
              shopurl: setshopid ? setshopid : "all",
              shopid: "all",
              shop: "all"
            }
          });
        } else {
          const shopid = resinfo.shop[0].split("/").reverse()[1];
          if (!setshopid) {
            setLocalStorage("shopid", `${shopid}#${resinfo.shop[0]}`);
          }
          yield put({
            type: "save",
            payload: {
              superadmin: false,
              shop: resinfo.shop,
              shopid,
              shopurl: `${shopid}#${resinfo.shop[0]}`
            }
          });
        }
      }
    },

    *switchStore({ payload }, { call, put }) {
      const { shopid, shopurl } = payload;
      setLocalStorage("shopid", shopurl);
      yield put({
        type: "save",
        payload: {
          shopid,
          shopurl
        }
      });
    },

    *logout(_, { put }) {
      console.log("save");
      yield put({
        type: "save",
        payload: { permissions: [], shopid: "", shopurl: "", shop: [] }
      });
      console.log("saved");
      yield put(routerRedux.replace("/users/login"));
      console.log("login");
      removeAllLocalStorage();
      reloadAuthorized();
    },

    *searchFormKey({ payload }, { call, put }) {
      let key = Object.keys(payload)[0];
      yield put({
        type: "setSearchKey",
        payload: { keyform: { ...payload[key] }, key }
      });
    },

    *resetSearchFormKey({ payload }, { call, put }) {
      const { key } = payload;
      yield put({
        type: "resetSearchKey",
        payload: { key }
      });
    }
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload
      };
    },
    changeLayoutmobile(state, { payload }) {
      const { mobile } = payload;
      return {
        ...state,
        isMobile: mobile
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload
      };
    },
    saveClearedNotices(state, { payload }) {
      const oldstate = state;
      const { allorderlist } = oldstate;
      let noticedata = getLocalStorage([payload]) || "";
      noticedata = noticedata.split(",");
      allorderlist.map(item => {
        noticedata.push(item.id);
      });
      setLocalStorage([payload], noticedata);
      return {
        ...state,
        ...payload
      };
    },
    setSearchKey(state, { payload }) {
      let { searchform } = state;
      const { key, keyform } = payload;
      Object.keys(searchform).map(item => {
        if (item === key) {
          searchform[item] = { ...keyform };
        }
      });
      return {
        ...state,
        ...payload
      };
    },
    resetSearchKey(state, { payload }) {
      let { searchform } = state;
      const { key } = payload;
      Object.keys(searchform).map(item => {
        if (item !== key) {
          searchform[item] = { ...pageinit };
        }
      });
      // console.log(searchform)
      return {
        ...state,
        ...payload
      };
    }
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== "undefined") {
          window.ga("send", "pageview", pathname + search);
        }
      });
    }
  }
};
