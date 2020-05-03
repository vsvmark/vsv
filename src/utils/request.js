import axios from "axios";
import emitter from "../services/emitter";
import cache from "./cache";

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: true,
  timeout: 20000,
  adapter: cache({
    time: 5000
  })
});

service.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    if (response.status === 200) {
      return response.data;
    }
    return Promise.reject(response);
  },
  error => {
    const { status } = error.response;
    if (status === 401) {
      emitter.emit("EVENT_LOGIN_INVALID");
    }
    return Promise.reject(error);
  }
);

export default service;
