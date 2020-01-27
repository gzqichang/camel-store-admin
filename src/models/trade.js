import {
  getExpandData,
  setExpandData,
  getStorePoster,
  setStorePoster,
  queryExcel,
  getTradelist,
  getTradeData,
  updateTrade,
  createTrade,
  deleteTrade,
  exportExcel
} from "@/services/trade";
import { message } from "antd";
import { routerRedux } from "dva/router";

export default {
  namespace: "trade",

  state: {
    bonus: null,
    rebate: null,
    hotword: [], //搜索热词列表
    hotwordCount: 0,
    shoplist: [], //促销消息列表
    shoplistCount: 0,
    levelList: [], //会员等级
    levelCount: 0,
    rechargetypelist: [], //优惠充值
    rechargetypeCount: 0,
    swiperlist: [], //首页海报
    swiperlistCount: 0,
    homebannerlist: [], //首页轮播图
    modulelist: [], //模块
    shortcutlist: [] //快速入口
  },

  effects: {
    //分销与分享
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

    //分销海报
    *getStorePoster({ payload }, { call, put }) {
      const res = yield call(getStorePoster, payload);
      if (res) {
        return res;
      }
    },
    *setStorePoster({ payload }, { call, put }) {
      return yield call(setStorePoster, payload);
    },

    //店铺信息
    *fetchShop({ payload }, { call, put }) {
      const _payload = { type: "notice", _params: { ...payload } };
      const response = yield call(getTradelist, _payload);
      response.results.map((item, index) => (item.key = index));
      yield put({
        type: "save",
        payload: {
          shoplist: Array.isArray(response.results) ? response.results : [],
          shoplistCount: response.count
        }
      });
    },

    *fetchShopData({ payload }, { call, put }) {
      const _payload = { type: "notice", ...payload };
      const response = yield call(getTradeData, _payload);
      return response;
    },

    *updateShop({ payload }, { call, put }) {
      const _payload = { type: "notice", ...payload };
      const response = yield call(updateTrade, _payload);
      if (response) {
        message.success("修改成功！");
        yield put(routerRedux.replace("/trade/shopmessage"));
        return response;
      } else {
        message.error("修改失败！");
      }
    },

    *createShop({ payload }, { call, put }) {
      const _payload = { type: "notice", _params: { ...payload } };
      const response = yield call(createTrade, _payload);
      if (response) {
        message.success("创建成功！");
        yield put(routerRedux.replace("/trade/shopmessage"));
        return response;
      } else {
        message.error("创建失败！");
      }
    },

    *deleteShop({ payload }, { call, put }) {
      const _payload = { type: "notice", ...payload };
      const response = yield call(deleteTrade, _payload);
      return response;
    },

    //搜索热词
    *fetchHotword({ payload }, { call, put }) {
      const _payload = { type: "hotword", _params: { ...payload } };
      const response = yield call(getTradelist, _payload);
      response.results.map((item, index) => (item.key = index));
      yield put({
        type: "save",
        payload: {
          hotword: Array.isArray(response.results) ? response.results : [],
          hotwordCount: response.count
        }
      });
    },

    *fetchHotwordData({ payload }, { call, put }) {
      const _payload = { type: "hotword", ...payload };
      const response = yield call(getTradeData, _payload);
      return response;
    },

    *updateHotword({ payload }, { call, put }) {
      const _payload = { type: "hotword", ...payload };
      const response = yield call(updateTrade, _payload);
      if (response) {
        message.success("修改成功！");
        return response;
      } else {
        message.error("修改失败！");
      }
    },

    *createHotword({ payload }, { call, put }) {
      const _payload = { type: "hotword", _params: { ...payload } };
      const response = yield call(createTrade, _payload);
      if (response) {
        message.success("创建成功！");
        return response;
      } else {
        message.error("创建失败！");
      }
    },

    *deleteHotword({ payload }, { call, put }) {
      const _payload = { type: "hotword", ...payload };
      return yield call(deleteTrade, _payload);
    },

    //等级
    *fetchlevelList({ payload }, { call, put }) {
      const _payload = { type: "level", _params: { ...payload } };
      const response = yield call(getTradelist, _payload);
      response.results.map((item, index) => (item.key = index + 1));
      yield put({
        type: "save",
        payload: {
          levelList: Array.isArray(response.results) ? response.results : [],
          levelCount: response.count
        }
      });
      return response.results;
    },

    *fetchlevelData({ payload }, { call, put }) {
      const _payload = { type: "level", ...payload };
      const response = yield call(getTradeData, _payload);
      return response;
    },

    *updatelevelData({ payload }, { call, put }) {
      const _payload = { type: "level", ...payload };
      const response = yield call(updateTrade, _payload);
      if (response) {
        message.success("修改成功");
        return response;
      } else {
        message.error("修改失败");
      }
    },

    *createlevelData({ payload }, { call, put }) {
      const _payload = { type: "level", _params: { ...payload } };
      const response = yield call(createTrade, _payload);
      if (response) {
        message.success("添加成功");
        return response;
      } else {
        message.error("添加失败" + response);
      }
    },

    *dellevelData({ payload }, { call, put }) {
      const _payload = { type: "level", ...payload };
      return yield call(deleteTrade, _payload);
    },
    //优惠充值
    *fetchrecharge({ payload }, { call, put }) {
      const _payload = { type: "rechargetype", _params: { ...payload } };
      const response = yield call(getTradelist, _payload);
      response.results.map((item, index) => (item.key = index + 1));
      yield put({
        type: "save",
        payload: {
          rechargetypelist: Array.isArray(response.results)
            ? response.results
            : [],
          rechargetypeCount: response.count
        }
      });
    },

    *fetchrechargeData({ payload }, { call, put }) {
      const _payload = { type: "rechargetype", ...payload };
      const response = yield call(getTradeData, _payload);
      return response;
    },

    *updaterecharge({ payload }, { call, put }) {
      const _payload = { type: "rechargetype", ...payload };
      const response = yield call(updateTrade, _payload);
      if (response) {
        message.success("修改成功");
        return response;
      }
    },

    *createrecharge({ payload }, { call, put }) {
      const _payload = { type: "rechargetype", _params: { ...payload } };
      const response = yield call(createTrade, _payload);
      if (response) {
        message.success("添加成功");
        return response;
      }
    },

    *delrecharge({ payload }, { call, put }) {
      const _payload = { type: "rechargetype", ...payload };
      return yield call(deleteTrade, _payload);
    },

    //首页海报
    *fetchSwiper({ payload }, { call, put }) {
      const _payload = { type: "banner", _params: { ...payload } };
      const response = yield call(getTradelist, _payload);
      response.results.map((item, index) => (item.key = index));
      yield put({
        type: "save",
        payload: {
          swiperlist: Array.isArray(response.results) ? response.results : [],
          swiperlistCount: response.count
        }
      });
      return Array.isArray(response.results) ? response.results : [];
    },

    *getSwiperdata({ payload }, { call, put }) {
      const _payload = { type: "banner", ...payload };
      const response = yield call(getTradeData, _payload);
      return response;
    },

    *createSwiperdata({ payload }, { call, put }) {
      const _payload = { type: "banner", _params: { ...payload } };
      const response = yield call(createTrade, _payload);
      if (response) {
        message.success("添加成功");
        yield put(routerRedux.replace("/trade/swiperlist"));
      } else {
        message.error("修改失败");
      }
    },
    *updateSwiperdata({ payload }, { call, put }) {
      const _payload = { type: "banner", ...payload };
      const response = yield call(updateTrade, _payload);
      if (response) {
        message.success("修改成功");
        yield put(routerRedux.replace("/trade/swiperlist"));
      } else {
        message.error("修改失败");
      }
    },
    *delSwiperdata({ payload }, { call, put }) {
      const _payload = { type: "banner", ...payload };
      return yield call(deleteTrade, _payload);
    },

    //首页设置
    *fetchhomepageList({ payload }, { call, put }) {
      const { type } = payload;
      const response = yield call(getTradelist, payload);
      response.results.map((item, index) => (item.key = index + 1));
      let data = {},
        res = Array.isArray(response.results) ? response.results : [];
      let _key = null;
      const _list = data =>
        data.map(item => {
          const { jump_type, category, goods, goods_type } = item;
          let link = null;
          if (jump_type === "category") {
            //商品分类
            link = category && category.url;
          }
          if (jump_type === "goods") {
            //商品详情
            link = goods;
          }
          if (jump_type === "goods_type") {
            //商品类型
            link = goods_type;
          }
          return {
            ...item,
            link
          };
        });
      switch (type) {
        case "homebanner":
          const _homebannerlist = _list(res);
          data = { homebannerlist: [..._homebannerlist] };
          _key = "homebannerlist";
          break;
        case "_module":
          data = { modulelist: res };
          _key = "modulelist";
          break;
        case "shortcut":
          const _shortcutlist = _list(res);
          data = { shortcutlist: [..._shortcutlist] };
          _key = "shortcutlist";
          break;
        default:
          break;
      }

      yield put({
        type: "save",
        payload: {
          ...data
        }
      });
      return data[_key];
    },
    *updatehomepage({ payload }, { call, put }) {
      const response = yield call(updateTrade, payload);
      if (response) {
        return response;
      } else {
        return false;
      }
    },
    *createhomepage({ payload }, { call, put }) {
      const response = yield call(createTrade, payload);
      if (response) {
        message.success("添加成功");
      } else {
        message.error("修改失败");
      }
    },
    *exportExcelBatch({ payload }, { call }) {
      return yield call(exportExcel, payload);
    },
    *queryExcelBatch({ payload }, { call }) {
      return yield call(queryExcel, payload);
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
