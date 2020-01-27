import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

const fap = "/api/config/faq/";
const shop = "/api/shop/shop/";
const print = "/api/shop/printer/";
const qrcode = "/api/shop/qrcode/";
const sms_balance = "/api/sms/sms_balance/";
const sms_recharge = "/api/sms/recharge/";
const sms_switch = "/api/sms/sms_switch/";
const sms_record = "/api/sms/smsrecord/";
//买家须知
export async function getFaqList(params) {
  return request(`${fap}?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getFaqData(params) {
  const { id } = params;
  return request(`${fap}${id}/`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updateFaqData(params) {
  const { id, data } = params;
  return request(`${fap}${id}/`, {
    method: "PUT",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function createFaqData(params) {
  return request(fap, {
    method: "POST",
    body: {
      ...params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function deleteFaqData(params) {
  const { id } = params;
  return request(`${fap}${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//门店
export async function getStores(params) {
  return request(`${shop}?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getStoreData(params) {
  const { id } = params;
  return request(`${shop}${id}/`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updateStore(params) {
  const { id, data } = params;
  return request(`${shop}${id}/`, {
    method: "PATCH",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function createStore(params) {
  const { data } = params;
  return request(shop, {
    method: "POST",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function deleteStore(params) {
  const { id } = params;
  return request(`${shop}${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
//云打印
export async function getPrintList(params) {
  return request(`${print}?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getPrintData(params) {
  const { id } = params;
  return request(`${print}${id}/`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updatePrintData(params) {
  const { id, data } = params;
  return request(`${print}${id}/`, {
    method: "PUT",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function createPrintData(params) {
  return request(print, {
    method: "POST",
    body: {
      ...params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function deletePrintData(params) {
  const { id } = params;
  return request(`${print}${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getQrCodeList(params) {
  return request(`${qrcode}?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function createQrCode(params) {
  return request(qrcode, {
    method: "POST",
    body: {
      ...params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function deleteQrCode(params) {
  const { id } = params;
  return request(`${qrcode}${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

// 短信开关
export async function getMessageBlance() {
  return request(sms_balance, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function setMessageBlance({ amount }) {
  return request(sms_recharge, {
    method: "POST",
    body: {
      amount
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getMessageSwitch() {
  return request(sms_switch, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updateMessageSwitch(params) {
  return request(sms_switch, {
    method: "POST",
    body: {
      ...params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

// 发送短信记录
export async function getMessageRecordList(params) {
  return request(`${sms_record}?${stringify(params)}`, {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
