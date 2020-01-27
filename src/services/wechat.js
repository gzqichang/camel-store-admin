import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

// const BASE_URL = 'https://qccloud.test.gzqichang.com';
const BASE_URL = window.__debug_qichang_online || "https://s.qichang.online";
const wechatConfig = "/api/config/wechatconfig/";
const subDomain =
  window.__debug_sub_domain ||
  window.location.origin
    .replace("https://", "")
    .replace("http://", "")
    .split(".")[0];

export async function getWxappInfo() {
  return request(`${BASE_URL}/api/wxa-info/${subDomain}/`, {
    method: "GET",
    credentials: "same-origin"
  });
}

export async function getWxappStatus() {
  return request(`${BASE_URL}/api/wxa-audit-results/?sub_domain=${subDomain}`, {
    method: "GET",
    credentials: "same-origin"
  });
}

export async function updateWxapp() {
  return request(`${BASE_URL}/api/wxa-update-code/`, {
    method: "POST",
    body: { sub_domain: subDomain },
    credentials: "same-origin"
  });
}

export async function releaseWxapp() {
  return request(`${BASE_URL}/api/wxa-release/`, {
    method: "POST",
    body: { sub_domain: subDomain },
    credentials: "same-origin"
  });
}

export async function submitWxapp() {
  return request(`${BASE_URL}/api/wxa-submit/`, {
    method: "POST",
    body: { sub_domain: subDomain },
    credentials: "same-origin"
  });
}

export async function getWechatConfig() {
  return request(wechatConfig, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updateWechatConfig(payload) {
  let formData = new FormData();
  Object.entries(payload).map(([k, v]) => formData.append(k, v));
  return request(wechatConfig, {
    method: "POST",
    headers: {
      Authorization: getLocalStorage("token")
    },
    body: formData
  });
}

export async function getPayjsConfig() {
  return request("/api/config/payjsconfig/", {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updatePayjsConfig(params) {
  return request("/api/config/payjsconfig/", {
    method: "POST",
    body: {
      ...params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
