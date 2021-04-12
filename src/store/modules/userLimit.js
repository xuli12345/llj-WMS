export default {
  namespaced: true,
  state: {
    userLimit:[] 
  },
  mutations: {
    insertUserLimit(state, Arr) {
      state.userLimit= Arr;
    }
  }
};
