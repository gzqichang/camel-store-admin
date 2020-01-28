import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/api';
import { setAuthority, setLocalStorage, removeAllLocalStorage } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import { getToken, getCode } from '@/services/login';
export default {
  namespace: 'login',

  state: {
    status: undefined
  },

  effects: {
    *login({ payload }, { call, put }) {
      const res = yield call(getToken, payload);
      if(res){
        removeAllLocalStorage();
        yield put({
          type: 'changeStatus',
          status: res,
        });
        setLocalStorage('username', payload.username)
        setLocalStorage('token', 'Token '+ res.token || '')
        reloadAuthorized();
        yield put(routerRedux.replace('/'));
      }
    },

    *getcode({ payload }, { call, put }) {
      const response = yield call(getCode);
      if(response){
        return response
      }
    },
  },

  reducers: {
    changeStatus(state, { payload }) {
      setAuthority('admin');
      return {
        ...state,
        status: payload,
      };
    },
  },
};
