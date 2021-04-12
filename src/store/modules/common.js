export default {
  namespaced: true,
  state: {
    // 页面文档可视高度(随窗口改变大小)
    documentClientHeight: 0,
    // 侧边栏, 布局皮肤, light(浅色) / dark(黑色)
    sidebarLayoutSkin: "dark",
    // 侧边栏, 折叠状态
    sidebarFold: false,
    // 侧边栏, 菜单
    menuList: [],
    //侧边栏 菜单宽度
    menusWidth: "230px",
    //侧边栏 当前激活菜单的index
    menuActiveName: "",
    // 内容, 是否需要刷新
    contentIsNeedRefresh: false,
    // 主入口标签页
    mainTabs: [],
    //tab栏当前激活的index
    mainTabsActiveName: "",
    //loading的状态
    loadingStatus: false,
    //路线主表下拉框的值(fID)
    changeValue: "",
    //排车 排车序号
    Jobid: "",
    //排车 排车序号ID
    PaicheSn: "",
    //排车 随车人员数据
    suicheData: [],
    //排车人员初始值
    baseSuicheData: [],
    // 称重分拣员工工号
    staffNo: null,
    pickState: false
  },
  mutations: {
    updateChangeDefaul(state, data) {
      if (data.length != 0) {
        state.baseSuicheData.push(data);
      }
      // console.log(state.baseSuicheData, "state.baseSuicheData");
    },
    //已经选择过的人员数据
    updateSuiche(state, data) {
      // console.log(state, data);
      let res = Array.isArray(data);
      if (res) {
        state.suicheData = [...state.suicheData, ...data];
      } else {
        let suiChe = state.suicheData;
        suiChe.forEach((element, index) => {
          if (element.fHrID == data.fHrID) {
            suiChe.splice(index, 1);
          }
        });
        state.suicheData = suiChe;
        console.log(state.suicheData, suiChe);
      }
    },
    updateRouteValue(state, data) {
      state.changeValue = data;
    },
    updateJobid(state, Jobid) {
      // console.log(state, Jobid);
      state.Jobid = Jobid;
    },
    updatefPaicheSn(state, PaicheSn) {
      state.PaicheSn = PaicheSn;
    },
    updateSidebarLayoutSkin(state, skin) {
      state.sidebarLayoutSkin = skin;
    },
    updateSidebarFold(state, fold) {
      if (fold === true) {
        state.menusWidth = "64px";
      } else {
        state.menusWidth = "230px";
      }
      state.sidebarFold = fold;
    },
    updateMenuList(state, list) {
      // console.log(list,"12e")
      state.menuList = list;
    },
    updateMenuActiveName(state, name) {
      // console.log(name)
      state.menuActiveName = name;
    },
    updateContentIsNeedRefresh(state, status) {
      state.contentIsNeedRefresh = status;
    },
    updateMainTabs(state, tabs) {
      state.mainTabs = tabs;
    },
    updateMainTabsActiveName(state, name) {
      state.mainTabsActiveName = name;
    },
    //更改loading的状态
    updateLoadingStatus(state, value) {
      // console.log(value)
      state.loadingStatus = value;
    },
    //保存登录员工工号
    updateStaffNo(state, value) {
      // console.log(value)
      state.staffNo = value;
    },
    //跳转到称重拣货保存状态
    updatePickState(state, value) {
      // console.log(value)
      state.pickState = value;
    }
  }
};
