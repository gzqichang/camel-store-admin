import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

//提现
export async function getwithdrawalList(params) {
  return request(`/api/wxuser/withdrawal/?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function withdrawalDataStatus(params) {
  const { id, status, remark } = params;
  let formdata = new FormData();
  formdata.append("status", status);
  formdata.append("remark", remark);
  return request("/api/wxuser/withdrawal/" + id + "/operation/", {
    method: "POST",
    body: { status, remark },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//返利
export async function getaccountlogList(params) {
  const { type, data } = params;
  return request(`/api/wxuser/${type}/?${stringify(data)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//充值记录
export async function getRecgargelist(params) {
  return request(`/api/wxuser/rchgrecord/?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
