import { getFaqList, getFaqData, updateFaqData,createFaqData, deleteFaqData,
  getStores, getStoreData, updateStore, createStore, deleteStore, getQrCodeList, deleteQrCode,
  getPrintList, getPrintData, updatePrintData, createPrintData, deletePrintData,createQrCode,
  getMessageBlance, setMessageBlance, getMessageSwitch, updateMessageSwitch, getMessageRecordList
} from '@/services/shopsetting';
import { message } from 'antd'
import { routerRedux } from 'dva/router';

export default {
  namespace: 'shopsetting',

  state: {
    qualist: [],      //买家须知
    qualistCount:0,
    storelist:[],     //门店列表
    storeCount:0,
    printlist: [],    //云打印
    printCount: 0,
    speakers: [],
    qrlist: [],
    qrCount: 0,
    messageSwitch: [],  // 短信开关
  },

  effects: {
    //买家须知
    *fetchFaq({ payload }, { call, put }) {
      const response = yield call(getFaqList, payload );
      response.results.map((item,index) => item.key = index)
      yield put({
        type: 'save',
        payload: {
          qualist: Array.isArray(response.results) ? response.results : [],
          qualistCount:response.count
        }
      });
    },

    *fetchFaqdata({ payload }, { call, put }) {
      const response = yield call(getFaqData, payload );
      return response
    },

    *updateFaqData({ payload }, { call, put }) {
      const response = yield call(updateFaqData, payload );
      if(response){
        message.success('修改成功！')
        yield put(routerRedux.replace('/setting/quacontent'));
        return response
      }
    },

    *createFaqData({ payload }, { call, put }) {
      const response = yield call(createFaqData, payload );
      if(response){
        message.success('创建成功！')
        yield put(routerRedux.replace('/setting/quacontent'));
        return response
      }
    },

    *deleteFaqData({ payload }, { call, put }) {
      const response = yield call(deleteFaqData, payload );
      return response
    },

    //门店
    *fetchStores ({ payload }, { call, put }) {
      const response = yield call(getStores, payload );
      if(response){
        response.results.map((item,index) => item.key = index)
        yield put({
          type: 'save',
          payload: {
            storelist: Array.isArray(response.results) ? response.results : [],
            storeCount:response.count
          }
        });
        return response.results
      }
    },

    *getStoreData({ payload }, { call, put }) {
      const response = yield call(getStoreData, payload );
      if(response){
        return response
      }
    },

    *updateStore({ payload }, { call, put }) {
      const response = yield call(updateStore, payload );
      if(response){
        message.success('修改成功！')
        yield put(routerRedux.replace('/setting/storelist'));
        return response
      }else{
        message.error('修改失败！')
      }
    },

    *createStore({ payload }, { call, put }) {
      const response = yield call(createStore, payload );
      if(response){
        message.success('创建成功！')
        yield put(routerRedux.replace('/setting/storelist'))
        return response
      }else{
        message.error('创建失败！')
      }
    },

    *deleteStore({ payload }, { call, put }) {
      const response = yield call(deleteStore, payload );
      if (response !== undefined)
        message.success('删除成功')
    },

    //云打印
    *fetchPrint({ payload }, { call, put }) {
      const response = yield call(getPrintList, payload );
      response.results.map((item,index) => item.key = index)
      yield put({
        type: 'save',
        payload: {
          printlist: Array.isArray(response.results) ? response.results : [],
          printCount:response.count
        }
      });
      return response.results
    },

    *fetchfetchPrintdata({ payload }, { call, put }) {
      return yield call(getPrintData, payload );
    },

    *updatefetchPrintData({ payload }, { call, put }) {
      const response = yield call(updatePrintData, payload );
      if(response){
        message.success('修改成功！')
        return response
      }
    },

    *createfetchPrintData({ payload }, { call, put }) {
      const response = yield call(createPrintData, payload );
      if(response){
        message.success('创建成功！')
        return response
      }
    },

    *deletefetchPrintData({ payload }, { call, put }) {
      return yield call(deletePrintData, payload );
    },

    *fetchQrCode({ payload }, { call, put }) {
      const response = yield call(getQrCodeList, payload );
      response.results.map((item,index) => item.key = index)
      yield put({
        type: 'save',
        payload: {
          qrlist: Array.isArray(response.results) ? response.results : [],
          qrCount:response.count
        }
      });
      return response.results
    },

    *deleteQrCode({ payload }, { call, put }) {
      return yield call(deleteQrCode, payload );
    },

    *createQrCode({ payload }, { call, put }) {
      const response = yield call(createQrCode, payload );
      if(response){
        message.success('创建成功！')
        return response
      }
    },

    *fetchSpeakers(_, { call, put }) {
      const response = yield call(getPrintList, {page_size: 1000, device_type: 'speaker'} );
      response.results.map((item,index) => item.key = index)
      yield put({
        type: 'save',
        payload: {
          speakers: Array.isArray(response.results) ? response.results : [],
        }
      });
      return response.results
    },

    // 短信开关
    *fetchBalance(_, { call }) {
      return yield call(getMessageBlance);
    },

    *addMessageBlance({payload}, { call }) {
      const res = yield call(setMessageBlance, payload);
      if (res) {
        return res;
      }
    },

    *fetchMessageSwitch(_, { call,put }) {
      const res = yield call(getMessageSwitch);
      if (res) {
        yield put({
          type: 'save',
          payload: {
            messageSwitch: [...res],
          }
        });
        return res;
      }

    },

    *setMessageSwitch({payload}, { call }) {
      const res =  yield call(updateMessageSwitch, payload);
      if (res) {
        message.success(res)
        return res;
      }
    },

    *fetchMessageRecord({payload}, { call }) {
      return yield call(getMessageRecordList, payload);
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
