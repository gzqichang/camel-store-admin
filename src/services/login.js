import request from '@/utils/request';
import { getLocalStorage } from '@/utils/authority';

export async function getToken(params) {
  return request(
    '/api/user/login/', {
      method: 'POST',
      body: params
    }
  );
}

export async function getCode() {
  return request(
    '/api/quser/captcha-generate/', {
      method: 'GET',
      headers:{
        'Authorization':getLocalStorage("token")
      }
    }
  );
}
