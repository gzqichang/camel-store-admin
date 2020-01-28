import { getVideoList, setblockUser, putVideoData, getSwitchVideo, switchVideo } from '@/services/video';
import { message } from 'antd'

export default {
  namespace: 'video',

  state: {
    videolist: [],
    videolistCount:0,
    video_switch: true,
  },

  effects: {
    *fetchVideo({ payload }, { call, put }) {
      const res = yield call(getVideoList, payload)
      if(res){
        yield put({
          type: 'save',
          payload: {
            videolist: Array.isArray(res.results) ? res.results : [],
            videolistCount:res.count
          },
        });
      }
    },

    *blockUser({ payload }, { call }) {
      const res = yield call(setblockUser, payload)
      if(res){
        message.success('屏蔽成功');
        return res
      }
    },

    *changeVideoData({payload}, { call }) {
      const res = yield call(putVideoData,payload)
      if(res){
        message.success('修改成功');
        return res
      }
    },

    *getSwitchVideoData(_, { call, put }) {
      const res = yield call(getSwitchVideo);
      if(res){
        yield put({
          type: 'save',
          payload: {
            ...res
          },
        });
      }
    },

    *switchVideoData({payload}, { call, put, select }) {
      const res = yield call(switchVideo,payload)
      if(res){
        const video_switch = yield select(state => state.video.video_switch);
        message.success('修改成功');
        yield put({
          type: 'save',
          payload: {
            video_switch: !video_switch
          },
        });
        return res
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
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    }
  },
};
