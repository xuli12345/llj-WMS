import Vue from "vue";
import App from "./App";
import router from "./router";
import "babel-polyfill";
import "./assets/css/index.scss";
import "./assets/css/icon/iconfont.css";
import store from "@/store/store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

import numberKeyboard from "@/views/keyboard/";
Vue.use(numberKeyboard);

import Plugin from 'v-fit-columns';
Vue.use(Plugin)
// 避免路由重复点击时报错或npm i vue-router@3.0 -S
import Router from "vue-router";
const routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error);
};

import JsonExcel from 'vue-json-excel'
Vue.component('downloadExcel', JsonExcel)

import { preventReClick } from "@/utils/preventReClick";

Vue.filter("pagination", function (tableData, pageNum, pageSize) {
  // console.log(tableData)
  //当前页第一条的索引
  let offset = (pageNum - 1) * pageSize;
  let data =
    offset + pageSize >= tableData.length
      ? tableData.slice(offset, tableData.length)
      : tableData.slice(offset, offset + pageSize);
  return data;
});

// console.log(router.options.routes)

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  store,
  components: {
    App
  },
  template: "<App/>"
});
