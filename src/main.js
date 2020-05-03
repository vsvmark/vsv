import "lib-flexible";
import "reset-css";
import "@assets/scss/main.scss";
import Vue from "vue";
import VueI18n from "vue-i18n";
import App from "./App.vue";
import router from "./router";
import store from "./store/index";
import language from "./services/language";
import { Notify, Toast } from "vant";
import trackTx from "./utils/trackTx";
import VueClipboard from "vue-clipboard2";
Vue.use(VueI18n);
Vue.use(Toast).use(Notify);
Vue.use(VueClipboard);
Vue.config.productionTip = false;
Vue.prototype.trackTx = trackTx;

const locale = localStorage.getItem("locale");
const i18n = new VueI18n({
  locale: locale ? locale : "en-US",
  messages: language
});

const NumFormat = function(value, length) {
  if (!value) {
    return "0";
  }
  let dist = parseFloat(value);
  if (value % 1 == 0) {
    dist = parseInt(value);
  } else {
    dist = dist.toFixed(length ? length : 3);
  }
  var parts = dist.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

Vue.filter("NumFormat", NumFormat);

const DateFormat = function(date) {
  return new Date(date).toLocaleString(i18n.locale, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};

Vue.filter("DateFormat", DateFormat);

const BlockToSecond = function(value) {
  if (!value) {
    return 0;
  }
  return 14 * value;
};

Vue.filter("BlockToSecond", BlockToSecond);

const SecondFormat = function(x) {
  var sec_num = parseInt(x, 10);
  var days = Math.floor(sec_num / (3600 * 24));
  var hours = Math.floor((sec_num - days * 3600 * 24) / 3600);
  var minutes = Math.floor((sec_num - days * 3600 * 24 - hours * 3600) / 60);
  var seconds = sec_num - days * 3600 * 24 - hours * 3600 - minutes * 60;

  const fmt =
    (days > 0 ? days + " " + i18n.t("day") : "") +
    (hours > 0 ? " " + hours + " " + i18n.t("hour") : "") +
    (minutes > 0
      ? !days && !hours
        ? " " + minutes + " " + i18n.t("minute")
        : ""
      : "") +
    (seconds > 0
      ? !days && !hours && !minutes
        ? " " + seconds + " " + i18n.t("second")
        : ""
      : "");
  return fmt.trim() == "" ? "0 " + " " + i18n.t("hour") : fmt;
};

Vue.filter("SecondFormat", SecondFormat);

const modulesFiles = require.context("./components", true, /\.vue$/);
modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
  const value = modulesFiles(modulePath);
  Vue.component(moduleName, value.default);
}, {});

Vue.mixin({
  methods: {
    NumFormat,
    DateFormat,
    BlockToSecond,
    SecondFormat
  }
});

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount("#app");
