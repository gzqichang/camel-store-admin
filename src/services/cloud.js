import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

// const BASE_URL = 'https://qccloud.test.gzqichang.com';
const BASE_URL = window.__debug_qichang_online || "https://s.qichang.online";
const subDomain =
  window.__debug_sub_domain ||
  window.location.origin
    .replace("https://", "")
    .replace("http://", "")
    .split(".")[0];

export async function getExtensionList() {
  return request(`${BASE_URL}/api/extensions/?sub_domain=${subDomain}`, {
    method: "GET",
    credentials: "same-origin"
  });
}

export async function createOrder(item_id) {
  return request(`${BASE_URL}/api/order/purchase/`, {
    method: "POST",
    body: {
      item_id,
      sub_domain: subDomain,
      purchase_item: "extensions"
    },
    credentials: "same-origin"
  });
}

export async function createPayment(order_sn) {
  return request(`${BASE_URL}/api/payment/`, {
    method: "POST",
    body: { order_sn },
    credentials: "same-origin"
  });
}

export async function cancelOrder(order_sn) {
  return request(`${BASE_URL}/api/order/cancel/`, {
    method: "POST",
    body: { order_sn },
    credentials: "same-origin"
  });
}

export async function queryOrder(order_sn) {
  return request(`${BASE_URL}/api/order/query/?order_sn=${order_sn}`, {
    method: "GET",
    credentials: "same-origin"
  });
}
