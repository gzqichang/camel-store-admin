import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

const _parmas = {
  credentials: "same-origin"
};

//GET,url,no data
export async function getUrlNodata(params) {
  const { url } = params;
  return request(url, {
    ..._parmas,
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//POST,url,data
export async function postUrlData(params) {
  const { url, data } = params;
  return request(url, {
    method: "POST",
    body: {
      ...data
    },
    ..._parmas,
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//POST,url,no data
export async function postUrlNodata(params) {
  const { url } = params;
  return request(url, {
    method: "POST",
    ..._parmas,
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//PATCH,url,data
export async function patchUrlData(params) {
  const { url, data } = params;
  return request(url, {
    method: "PATCH",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    },
    credentials: "same-origin"
  });
}

//PUT,url,data
export async function putUrlData(params) {
  const { url, data } = params;
  return request(url, {
    method: "PUT",
    body: {
      ...data
    },
    ..._parmas,
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//DELETE,url,no data
export async function deleteUrlNodata(params) {
  const { url } = params;
  return request(url, {
    method: "DELETE",
    ..._parmas,
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
