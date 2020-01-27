import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

const category = "/api/goods/category/";
const good = "/api/goods/goods/";

export async function getGoodCategoryList(params) {
  return request(`${category}?${stringify(params)}`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getCategoryData(params) {
  const { id } = params;
  return request(category + id + "/", {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updateCategoryData(params) {
  const { id, data } = params;
  return request(category + id + "/", {
    method: "PUT",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function changeCategorystatus(params) {
  const { id, is_active } = params;
  return request(category + id + "/", {
    method: "PATCH",
    body: {
      is_active
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function createCategoryData(params) {
  return request(category, {
    method: "POST",
    body: {
      ...params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function deleteCategoryData(params) {
  const { id } = params;
  return request(category + id + "/", {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//商品
export async function getGoodsList(params) {
  return request(`${good}?${stringify(params)}`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function createGoodsdata(params) {
  return request(good, {
    method: "POST",
    body: {
      ...params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
export async function updateGoodsdata(params) {
  const { id, data } = params;
  const { is_template } = data;
  const _data = is_template ? "?is_template=true" : "";
  return request(good + id + "/" + _data, {
    method: "PUT",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
export async function getGoodsData(params) {
  const { id, data } = params;
  return request(`${good}${id}/?${stringify(data)}`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function changeGoodsStatus(params) {
  const { id, data } = params;
  return request(good + id + "/", {
    method: "PATCH",
    headers: {
      Authorization: getLocalStorage("token")
    },
    body: {
      ...data
    }
  });
}

export async function delGoodsData(params) {
  const { id, data } = params;
  return request(`${good}${id}/?${stringify(data)}`, {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
