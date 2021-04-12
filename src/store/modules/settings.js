//设置皮肤
import variables from "@/assets/css/element-variables.scss";
export default {
  namespaced: true,
  state: {
    theme: variables.theme
  },
  mutations: {
    CHANGE_SETTING: (state, { key, value }) => {
      if (state.hasOwnProperty(key)) {
        state[key] = value;
      }
    }
  },
  actions: {
    changeSetting({ commit }, data) {
      commit("CHANGE_SETTING", data);
    }
  }
};
