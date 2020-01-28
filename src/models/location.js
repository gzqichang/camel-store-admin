import { convertaddr, getCity, getlist } from '@/services/location';
import { message } from 'antd'
export default {
  namespace: 'location',

  state: {
  },

  effects: {
    *fetchALL({ payload }, { call, put }) {
      const response = yield call(getlist);
      if(response){
        return response
      }
    },

    *fetchCity({ payload}, { call, put }) {
      const { id,data } = payload
      const addrid = ['110000', '120000', '310000', '500000', '810000', '820000']
      if(addrid.includes(id)){
        data.fullname = data.label
        data.id = id
        return  { result: [[data]] }
      }
      else{
        const res = yield call(getCity, payload);
        if(res){
          return res
        }
      }
    },

    *fetchItem({ payload}, { call, put }) {
      const res = yield call(getCity, payload);
      if(res) {
        return res
      }
    },

    *convertlocation({payload}, { call, put}) {
      const res = yield call(convertaddr,payload)
      if(res && res.result){
        return res.result
      }else{
        message.error(res.message)
      }
    }
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
