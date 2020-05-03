import request from "@/utils/request";
export function getConfig() {
  return request({
    url: "/config.json",
    method: "get"
  });
}
export function getUser() {
  return request({
    url: "/user",
    method: "get"
  });
}

export function getNotification() {
  return request({
    url: "/notification",
    method: "get"
  });
}

export function readNotification(nid) {
  return request({
    url: "/notification/" + nid + "/read",
    method: "get"
  });
}
export function getNonce() {
  return request({
    url: "/nonce",
    method: "get"
  });
}
export function userLogin(data) {
  return request({
    url: "/login",
    method: "post",
    data
  });
}
export function getToken(params) {
  return request({
    url: "/token",
    method: "get",
    params
  });
}
export function getGears() {
  return request({
    url: "/user/gears",
    method: "get"
  });
}
export function sendVerify(data) {
  return request({
    url: "/sendVerify",
    method: "post",
    data
  });
}
export function updateUser(data) {
  return request({
    url: "/user",
    method: "patch",
    data
  });
}
export function getGame(params) {
  return request({
    url: "/games/ongoing",
    method: "get",
    params
  });
}
export function getData(params) {
  return request({
    url: "/data",
    method: "get",
    params
  });
}
export function getBillings(params) {
  return request({
    url: "/billings",
    method: "get",
    params
  });
}
export function getTeamPerformance(params) {
  return request({
    url: "/team-performance",
    method: "get",
    params
  });
}
export function getReferrers(params) {
  return request({
    url: "/referrers",
    method: "get",
    params
  });
}
