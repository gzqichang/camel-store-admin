import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

export async function getCount(params) {
  return request(`/api/count/count`, {
    method: "POST",
    body: { ...params },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getTotalCount(params) {
  return request(`/api/count/count?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getOrderFoodCount(params) {
  return request(`/api/count/statistic?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//统计分析
export async function getStatistic(params) {
  const { type, data } = params;
  return request(`/api/count/${type}?${stringify(data)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
