import request from '@/utils/request';
import { stringify } from 'qs';
import { getLocalStorage } from '@/utils/authority';

const user = '/api/user/user/'
const video = '/api/video/video/'

export async function getVideoList(params) {
  return request(
    `${video}?${stringify(params)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}

export async function setblockUser(params) {
  return request(
    video + 'blockuser/',
    {
      method: 'POST',
      body: {...params},
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}

export async function putVideoData(params) {
  const {id, ...restdata} = params;
  return request(
    `${video}${id}/`,
    {
      method: 'PATCH',
      body: {
        ...restdata
      },
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}

export async function getSwitchVideo() {
  return request(
    `/api/video/switch/`,
    {
      method: 'GET',
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}

export async function switchVideo(params) {
  const {video_switch} = params;
  let formData = new FormData();
  formData.append('video_switch', video_switch);
  return request(
    `/api/video/switch/`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}
