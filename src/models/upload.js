import { getImagelist, createImage, createMoreImage, delMoreImage,
  getImageTaglist, createImageTag } from '@/services/upload';
import { message } from 'antd';
export default {
  namespace: 'upload',

  state: {
    filelist: [],
    fileCount: 0,
    videolist: [],
    videoCount: 0,
    taglist: [],
    tagCount: 0
  },

  effects: {
    *fetchImagelist({ payload }, { call, put }) {
      const { file_type } = payload
      const response = yield call(getImagelist, payload);
      if(response){
        response.results.map((item,index) => item.key = index)
        if(file_type === 'video'){
          yield put({
            type: 'save',
            payload: {
              videolist: Array.isArray(response.results) ? response.results : [],
              videoCount: response.count
            }
          })
        }
        else{
          yield put({
            type: 'save',
            payload: {
              filelist: Array.isArray(response.results) ? response.results : [],
              fileCount: response.count
            }
          })
        }
        return response.results
      }
    },
    *createImage({ payload }, { call, put }) {
      const response = yield call(createImage, payload);
      if(response && response.url){
        return response
      }
      else{
        message.error("上传失败")
      }
    },
    *createMoreImage({ payload }, { call, put }) {
      return yield call(createMoreImage, payload);
    },
    *delMoreImage({ payload }, { call, put }) {
      return yield call(delMoreImage, payload);
    },

    *fetchImageTaglist({ payload }, { call, put }) {
      const response = yield call(getImageTaglist, payload);
      if(response){
        response.results.map((item,index) => item.key = index)
        yield put({
          type: 'save',
          payload: {
            taglist: Array.isArray(response.results) ? response.results : [],
            tagCount: response.count
          }
        })
        return response.results
      }
    },
    *createImageTag({ payload }, { call, put }) {
      const response = yield call(createImageTag, payload);
      if(response && response.url){
        return response
      }
      else{
        message.error("创建失败")
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
