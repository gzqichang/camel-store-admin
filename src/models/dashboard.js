import { getCount, getTotalCount, getOrderFoodCount, getStatistic } from '@/services/dashboard';

export default {
  namespace: 'dashboard',

  state: {
    chartslist:[],
    countform:{},
    allform: {}
  },

  effects: {

    *fetchCount({payload}, { call, put }) {
      const response = yield call(getCount, payload);
      if(response){
        yield put({
          type: 'save',
          payload: {
            chartslist:[...response.count]
          }
        });
      }

    },

    *fetchTotalCount({payload}, { call, put }) {
      const response = yield call(getTotalCount, payload);
      if(response){
        yield put({
          type: 'save',
          payload: {
            countform: { ...response },
          }
        });
      }
    },

    *fetchOrderGoodCount({payload}, { call, put }) {
      const response = yield call(getOrderFoodCount, payload);
      if(response){
        yield put({
          type: 'save',
          payload: {
            allform: { ...response },
          }
        });
      }
    },

    *fetchStatistic({payload}, { call, put }) {
      const response = yield call(getStatistic, payload);
      if(response){
        return response
      }
    },
  },

  reducers: {
    save(state, action){
      return {
        ...state,
        ...action.payload
      }
    },
  },
};
