import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

const apiRequest = {
  notice: "/api/config/notice/",
  hotword: "/api/goods/hotword/",
  level: "/api/config/level/",
  rechargetype: "/api/config/rechargetype/",
  banner: "/api/goods/banner/",
  homebanner: "/api/homepage/homebanner/",
  _module: "/api/homepage/module/",
  shortcut: "/api/homepage/shortcut/",
  storeposter: "/api/config/storeposter/",
  exportexcel: "/api/trade/batch-export/",
  queryexcel: "/api/trade/batch-export-query/"
};
//分销与分享
export async function getExpandData() {
  return request(`/api/config/marketing`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function setExpandData(params) {
  return request(`/api/config/marketing`, {
    method: "POST",
    body: { ...params },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function setStorePoster(params) {
  const { type, _params } = params;
  return request(apiRequest[type], {
    method: "POST",
    body: { ..._params },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getStorePoster(params) {
  const { type } = params;
  return request(apiRequest[type], {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

//店铺信息,搜索热词,会员等级
export async function getTradelist(params) {
  const { type, _params } = params;
  return request(`${apiRequest[type]}?${stringify(_params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getTradeData(params) {
  const { id, type } = params;
  return request(apiRequest[type] + id + "/", {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function updateTrade(params) {
  const { type, id, data } = params;
  return request(apiRequest[type] + id + "/", {
    method: "PATCH",
    body: {
      ...data
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function createTrade(params) {
  const { type, _params } = params;
  return request(apiRequest[type], {
    method: "POST",
    body: {
      ..._params
    },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function deleteTrade(params) {
  const { type, id } = params;
  return request(apiRequest[type] + id + "/", {
    method: "DELETE",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
export async function exportExcel(params) {
  const url = apiRequest.exportexcel;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function() {
    if (this.status === 200) {
      var filename = "";
      var disposition = xhr.getResponseHeader("Content-Disposition");
      if (disposition && disposition.indexOf("attachment") !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1])
          filename = matches[1].replace(/['"]/g, "");
      }
      var type = xhr.getResponseHeader("Content-Type");

      var blob =
        typeof File === "function"
          ? new File([this.response], filename, { type: type })
          : new Blob([this.response], { type: type });
      if (typeof window.navigator.msSaveBlob !== "undefined") {
        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var URL = window.URL || window.webkitURL;
        var downloadUrl = URL.createObjectURL(blob);

        if (filename) {
          // use HTML5 a[download] attribute to specify filename
          var a = document.createElement("a");
          // safari doesn't support this yet
          if (typeof a.download === "undefined") {
            window.location = downloadUrl;
          } else {
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
          }
        } else {
          window.location = downloadUrl;
        }

        setTimeout(function() {
          URL.revokeObjectURL(downloadUrl);
        }, 100); // cleanup
      }
    }
  };
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", getLocalStorage("token"));
  xhr.send(stringify(params));
  return;
  // return request(
  //   apiRequest.exportexcel,
  //   {
  //     method: 'POST',
  //     body:{...params},
  //     headers: {
  //       'Authorization': getLocalStorage("token"),
  //     }
  //   },
  // );
}
export async function queryExcel(params) {
  return request(apiRequest.queryexcel, {
    method: "POST",
    body: { ...params },
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
