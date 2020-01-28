import { stringify } from 'qs';
import request from '@/utils/request';

export async function getlist() {
  return request('/api/ws/district/v1/list');
}

export async function getCity(params) {
  const { id } = params;
  return request(
    '/api/ws/district/v1/getchildren?id=' + id
  );
}

export async function convertaddr(params) {
  const { addr } = params;
  return request(
    '/api/ws/geocoder/v1/?address=' + addr
  );
}
