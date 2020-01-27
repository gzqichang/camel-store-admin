import request from "@/utils/request";

const redirectUrl = "/api/transfer/transfer/";

const requestWrapper = (url = "", param = {}) => {
  const method = param.method || "POST";
  const body = param.body || {};

  let headers = param.headers || {};

  if (param && param.body instanceof FormData) delete headers["Content-Type"];

  const finalURL =
    `${redirectUrl}?redirect_url=${encodeURIComponent(url)}` +
    `&allow_headers=${Object.keys(headers).join(",")}`;

  const options = ["GET", "HEAD"].includes(method)
    ? {
        method,
        headers,
        credentials: "same-origin"
      }
    : {
        body,
        method,
        headers,
        credentials: "same-origin"
      };

  return request(finalURL, options);
};

export default requestWrapper;
