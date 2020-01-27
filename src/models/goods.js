import {
  getGoodCategoryList,
  getCategoryData,
  updateCategoryData,
  changeCategorystatus,
  createCategoryData,
  deleteCategoryData,
  getGoodsList,
  createGoodsdata,
  updateGoodsdata,
  getGoodsData,
  delGoodsData,
  changeGoodsStatus,
  updateTem
} from "@/services/goods";
import { routerRedux } from "dva/router";
import { message } from "antd";

export default {
  namespace: "goods",

  state: {
    list: [],
    categorylistCount: 0,
    goodslist: [],
    goodlistCount: 0,
    goodsTempaltelist: [],
    goodTempalteCount: 0,
    subgoodslist: [],
    subgoodCount: 0,
    subTemplatelist: [],
    subTemplateCount: 0,
    replgoodslist: [],
    replgoodCount: 0,
    replTemplatelist: [],
    replTemplateCount: 0
  },

  effects: {
    //分类
    *fetchCategory({ payload }, { call, put }) {
      const response = yield call(getGoodCategoryList, payload);
      if (response) {
        response.results.map((item, index) => {
          return { ...item, key: index };
        });
        yield put({
          type: "save",
          payload: {
            list: Array.isArray(response.results) ? response.results : [],
            categorylistCount: response.count
          }
        });
        return Array.isArray(response.results) ? response.results : [];
      }
    },

    *fetchCategorydata({ payload }, { call, put }) {
      const response = yield call(getCategoryData, payload);
      return response;
    },

    *updateCategorydata({ payload }, { call, put }) {
      const res = yield call(updateCategoryData, payload);
      if (res) {
        yield put(routerRedux.replace("/good/categorylist"));
        message.success("修改成功！");
      }
    },

    *changeCategorystatus({ payload }, { call, put }) {
      const res = yield call(changeCategorystatus, payload);
      return new Promise((resolve, reject) => {
        if (res) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    },

    *createCategoryData({ payload }, { call, put }) {
      const res = yield call(createCategoryData, payload);
      if (res) {
        message.success("创建成功");
        yield put(routerRedux.replace("/good/categorylist"));
      }
    },

    *deleteCategoryData({ payload }, { call, put }) {
      const res = yield call(deleteCategoryData, payload);
      return res;
    },

    //商品
    *fetchGoods({ payload }, { call, put }) {
      const { model_type, is_template } = payload;
      const response = yield call(getGoodsList, payload);
      response.results.map((item, index) => {
        return { ...item, key: index };
      });
      if (model_type && model_type === "ord") {
        if (is_template) {
          yield put({
            type: "save",
            payload: {
              goodsTempaltelist: Array.isArray(response.results)
                ? response.results
                : [],
              goodTempalteCount: response.count
            }
          });
        } else {
          yield put({
            type: "save",
            payload: {
              goodslist: Array.isArray(response.results)
                ? response.results
                : [],
              goodlistCount: response.count
            }
          });
        }
      } else if (model_type && model_type === "sub") {
        if (is_template) {
          yield put({
            type: "save",
            payload: {
              subTemplatelist: Array.isArray(response.results)
                ? response.results
                : [],
              subTemplateCount: response.count
            }
          });
        } else {
          yield put({
            type: "save",
            payload: {
              subgoodslist: Array.isArray(response.results)
                ? response.results
                : [],
              subgoodCount: response.count
            }
          });
        }
      } else if (model_type && model_type === "replace") {
        if (is_template) {
          yield put({
            type: "save",
            payload: {
              replTemplatelist: Array.isArray(response.results)
                ? response.results
                : [],
              replTemplateCount: response.count
            }
          });
        } else {
          yield put({
            type: "save",
            payload: {
              replgoodslist: Array.isArray(response.results)
                ? response.results
                : [],
              replgoodCount: response.count
            }
          });
        }
      }
      return Array.isArray(response.results) ? response.results : [];
    },

    *createGoodsdata({ payload }, { call, put }) {
      const { is_template } = payload;
      const res = yield call(createGoodsdata, payload);
      if (res) {
        if (is_template) {
          message.success("模板创建成功!");
        } else {
          message.success("商品创建成功!");
        }
        return res;
      }
    },
    *updateGoodsdata({ payload }, { call, put }) {
      const res = yield call(updateGoodsdata, payload);
      if (res) {
        message.success("修改成功!");
        return res;
      } else {
        message.error("修改失败 !");
      }
    },

    *fetchGoodsdata({ payload }, { call, put }) {
      const response = yield call(getGoodsData, payload);
      return response;
    },

    *changeGoodsStatus({ payload }, { call, put }) {
      const response = yield call(changeGoodsStatus, payload);
      return new Promise((resolve, reject) => {
        if (response) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    },

    *delGoodsData({ payload }, { call, put }) {
      const response = yield call(delGoodsData, payload);
      return response;
    },

    //更新模板
    *updateTemplete({ payload }, { call, put }) {
      const res = yield call(updateTem, payload);
      message.success("删除成功！");
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
