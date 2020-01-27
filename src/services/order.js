import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

export async function getOrderList(params) {
  return request(`/api/trade/order/?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getOrderitemList(params) {
  return request(`/api/trade/item/?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
//GET,id
export async function getOrderData(params) {
  const { id, data } = params;
  return request(`/api/trade/order/${id}/?${stringify(data)}`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//快递公司
export async function getExpresslist(params) {
  return request(`/api/trade/express/?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
export async function createExpress(params) {
  return request(`/api/trade/express/`, {
    method: "POST",
    headers: {
      Authorization: getLocalStorage("token")
    },
    body: {
      ...params
    }
  });
}
export async function delExpress(params) {
  const { id } = params;
  return request(`/api/trade/express/` + id + `/`, {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
//GET,url,no data
export async function checkOrder(params) {
  const { url } = params;
  return request(url, {
    headers: {
      Authorization: getLocalStorage("token")
    },
    credentials: "same-origin"
  });
}

export async function expressList() {
  return request(`/api/trade/express/express_list/`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
