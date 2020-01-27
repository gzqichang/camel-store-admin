import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

//获取店铺名
export async function queryStorename() {
  return request("/api/config/storename", {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
export async function queryStoreicon() {
  return request("/api/config/storelogo/", {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
export async function setStoreicon(params) {
  return request("/api/config/storelogo/", {
    method: "POST",
    body: params,
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
//返利分销的启动检测
export async function queryConfig() {
  return request("/api/config/config", {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
export async function queryWxappQRCode() {
  return request("/api/config/wxapp-qrcode", {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
//获取用户权限
export async function getUserinfo() {
  return request("/api/user/user/info/", {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
//修改用户密码
export async function changePassword({ url, params }) {
  return request("/api/user/change-password/", {
    method: "POST",
    headers: {
      Authorization: getLocalStorage("token")
    },
    body: params
  });
}
// export async function patchUpdate({url, params}) {
//   return request(
//     url, {
//       method: 'PATCH',
//       headers:{
//         'Authorization':getLocalStorage("token")
//       },
//       body: params,
//       credentials: 'same-origin'
//     }
//   );
// }//-----
export async function queryProjectNotice() {
  return request("/api/project/notice");
}

export async function queryActivities() {
  return request("/api/activities");
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request("/api/rule", {
    method: "POST",
    body: {
      ...params,
      method: "delete"
    }
  });
}

export async function addRule(params) {
  return request("/api/rule", {
    method: "POST",
    body: {
      ...params,
      method: "post"
    }
  });
}

export async function updateRule(params) {
  return request("/api/rule", {
    method: "POST",
    body: {
      ...params,
      method: "update"
    }
  });
}

export async function fakeSubmitForm(params) {
  return request("/api/forms", {
    method: "POST",
    body: params
  });
}

export async function fakeChartData() {
  return request("/api/fake_chart_data");
}

export async function queryTags() {
  return request("/api/tags");
}

export async function queryBasicProfile() {
  return request("/api/profile/basic");
}

export async function queryAdvancedProfile() {
  return request("/api/profile/advanced");
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: "POST",
    body: {
      ...restParams,
      method: "delete"
    }
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: "POST",
    body: {
      ...restParams,
      method: "post"
    }
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: "POST",
    body: {
      ...restParams,
      method: "update"
    }
  });
}

export async function fakeAccountLogin(params) {
  return request("/api/login/account", {
    method: "POST",
    body: params
  });
}

export async function fakeRegister(params) {
  return request("/api/register", {
    method: "POST",
    body: params
  });
}

export async function queryNotices() {
  return request("/api/notices");
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`);
}
