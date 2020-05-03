import axios from "axios";

export const cache = {
  data: {},
  set(key, data) {
    this.data[key] = data;
  },
  get(key) {
    return this.data[key];
  },
  clear(key) {
    delete this.data[key];
  }
};

export const buildUniqueUrl = (url, method, params = {}, data = {}) => {
  const paramStr = obj => {
    if (toString.call(obj) === "[object Object]") {
      return JSON.stringify(
        Object.keys(obj)
          .sort()
          .reduce((result, key) => {
            result[key] = obj[key];
            return result;
          }, {})
      );
    } else {
      return JSON.stringify(obj);
    }
  };
  url += `?${paramStr(params)}&${paramStr(data)}&${method}`;
  return url;
};

export default (options = {}) => async config => {
  const defaultOptions = {
    time: 0,
    ...options
  };
  const index = buildUniqueUrl(
    config.url,
    config.method,
    config.params,
    config.data
  );
  let responsePromise = cache.get(index);
  if (!responsePromise) {
    responsePromise = (async () => {
      try {
        const response = await axios.defaults.adapter(config);
        return Promise.resolve(response);
      } catch (reason) {
        cache.clear(index);
        return Promise.reject(reason);
      }
    })();
    cache.set(index, responsePromise);
    if (defaultOptions.time !== 0) {
      setTimeout(() => {
        cache.clear(index);
      }, defaultOptions.time);
    }
  }
  return responsePromise.then(data => JSON.parse(JSON.stringify(data)));
};
