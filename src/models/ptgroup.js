import { getptList, getptListData, } from '@/services/ptgroup';

export default {
  namespace: 'ptgroup',

  state: {
    ptList: [],
    ptCount: 0,
  },

  effects: {
    *fetchptgroup({ payload }, { call, put }) {
      const response = yield call(getptList, payload);
      response.results.map((item, index) => (item.key = index + 1));
      yield put({
        type: 'save',
        payload: {
          ptList: Array.isArray(response.results) ? response.results : [],
          ptCount: response.count,
        },
      });
      return response.results
    },

    *fetchptListData({ payload }, { call, put }) {
      const response = yield call(getptListData, payload);
      return response;
    },

  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
