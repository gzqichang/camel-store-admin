import {
  getUrlNodata,
  postUrlData,
  postUrlNodata,
  patchUrlData,
  putUrlData,
  deleteUrlNodata
} from "@/services/costom";
import { message } from "antd";

export default {
  namespace: "costom",

  state: {},

  effects: {
    *_getUrlNodata({ payload }, { call, put }) {
      const response = yield call(getUrlNodata, payload);
      if (response) {
        return response;
      }
    },

    *_postUrlData({ payload }, { call, put }) {
      const response = yield call(postUrlData, payload);
      if (response) {
        message.success("修改成功！");
        return response;
      }
    },

    *_postUrlNodata({ payload }, { call, put }) {
      const response = yield call(postUrlNodata, payload);
      if (response) {
        message.success("修改成功！");
        return response;
      } else {
        message.error("修改失败！");
      }
    },

    *_patchUrlData({ payload }, { call, put }) {
      const response = yield call(patchUrlData, payload);
      if (response) {
        message.success("修改成功！");
        return response;
      } else {
        message.error("修改失败！");
      }
    },

    *_putUrlData({ payload }, { call, put }) {
      const response = yield call(putUrlData, payload);
      if (response) {
        message.success("修改成功！");
        return response;
      } else {
        message.error("修改失败！");
      }
    },

    *_deleteUrlNodata({ payload }, { call, put }) {
      return yield call(deleteUrlNodata, payload);
    }
  },

  reducers: {}
};
