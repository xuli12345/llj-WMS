import Vue from "vue";
import Vuex from "vuex";
import common from "./modules/common";
import user from "./modules/user";
import userLimit from "./modules/userLimit";
import settings from "./modules/settings";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    common,
    user,
    userLimit,
    settings
  },
  state: {
    CustomerData: []
  },
  mutations: {
    //存储客户信息
    updataCustomer(state, data) {
      state.CustomerData = data;
    }
  }
});

export default store;
