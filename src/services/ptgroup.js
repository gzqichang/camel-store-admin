import { stringify } from "qs";
import request from "@/utils/request";
import { getLocalStorage } from "@/utils/authority";

export async function getptList(params) {
  return request(`/api/pt/ptgroup/?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}

export async function getptListData(params) {
  const { id } = params;
  return request("/api/pt/ptgroup/" + id + "/", {
    headers: {
      Authorization: getLocalStorage("token")
    }
  });
}
