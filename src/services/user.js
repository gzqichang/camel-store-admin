import request from '@/utils/request';
import { stringify } from 'qs';
import { getLocalStorage } from '@/utils/authority';

const user = '/api/user/user/'
const feedback = '/api/feedback/feedback/'

export async function query(params) {
  return request(
   `/api/wxuser/userinfo/?${stringify(params)}`,
   {
     method: 'GET',
     headers: {
       'Authorization': getLocalStorage("token"),
     }
   },
 );
}

export async function queryUser(params) {
  const { id } = params
  return request(
    `/api/wxuser/userinfo/${id}/`,
    {
      method: 'GET',
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
 );
}
//分销
export async function bonusUser(params) {
  const { url, bonus_right  } = params
  return request(url +`bonus_right/`,
    {
      method: 'POST',
      headers: {
        'Authorization': getLocalStorage("token"),
      },
      body:{ bonus_right },
      credentials: 'same-origin'
    },
  );
}
//返利
export async function rebateUser(params) {
  const { url, rebate_right  } = params
  return request(url +`rebate_right/`,
    {
      method: 'POST',
      headers: {
        'Authorization': getLocalStorage("token"),
      },
      body:{ rebate_right },
      credentials: 'same-origin'
    },
  );
}
//测试
export async function testerUser(params) {
  const { url, testers } = params
  let formData = new FormData();
  formData.append('testers', testers);
  return request(url +`testers/`,
   {
     method: 'POST',
     headers: {
       'Authorization': getLocalStorage("token"),
     },
     body:formData,
     credentials: 'same-origin'
   },
 );
}
export async function videoUser(params) {
  const { url, upload_perm } = params
  let formData = new FormData();
  formData.append('upload_perm', upload_perm);
  return request(url +`upload_perm/`,
    {
      method: 'POST',
      headers: {
        'Authorization': getLocalStorage("token"),
      },
      body:formData,
      credentials: 'same-origin'
    },
  );
}
//会员钱包和积分记录
export async function AccountCreditlist(params) {
  const { url, type, data, postdata, method = 'GET' } = params
  const _data = data ? ('?' + stringify(data)) : ''
  return request(`${url}${type}/${_data}`,
    {
      method: method,
      body: postdata || undefined,
      headers: {
        'Authorization': getLocalStorage("token"),
      },
      credentials: 'same-origin'
    },
  );
}

//管理员列表
export async function queryAdmin(params) {
  return request(
    `${user}?${stringify(params)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}
export async function setpwdAdmin(params) {
  const { url } = params
  return request(
    url,
    {
      method: 'POST',
      headers: {
        'Authorization': getLocalStorage("token"),
      },
      credentials: 'same-origin'
    },
  );
}
export async function createAdmin(params) {
  const { data } = params
  return request(
    user,
    {
      method: 'POST',
      body: {...data},
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}
export async function readAdmin(params) {
  const { id } = params
  return request(
    `${user}${id}/`,
    {
      method: 'GET',
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}
export async function updateAdmin(params) {
  const { id, data } = params
  return request(
    `${user}${id}/`,
    {
      method: 'PATCH',
      body: {...data},
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}
export async function delAdmin(params) {
  const { id } = params
  return request(
    `${user}${id}/`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}
export async function queryAdmingroup(params) {
  return request(
    `/api/user/group/?${stringify(params)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': getLocalStorage("token"),
      }
    },
  );
}
//用户反馈
export async function getFeedbackList(params) {
  return request( `${feedback}?${stringify(params)}`,{
    headers: {
      'Authorization': getLocalStorage("token"),
    }
  });
}
