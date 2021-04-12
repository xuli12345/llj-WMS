<template>
  <div>
    <el-aside ref="menus" :width="menusWidth" v-if="!pickState">
      <!--default-active 当前激活菜单的 index-->

      <el-menu
        router
        :default-active="menuActiveName || 'home'"
        :collapse="sidebarFold"
        :collapseTransition="false"
        :background-color="theme == '#409EFF' ? '#024D6E' : '#fff'"
        :class="theme == '#409EFF' ? 'dark' : 'light'"
      >
        <a
          class="title flex-center-center"
          href="javascript:;"
          @click="$router.push({ name: 'home' })"
          v-show="!sidebarFold"
          >老邻居物流</a
        >
        <a
          class="title flex-center-center"
          href="javascript:;"
          @click="$router.push({ name: 'home' })"
          v-show="sidebarFold"
        >
          <img style="width:75%" src="../assets/img/test.png" alt="" />
        </a>
        <!-- <input
          style="height:30px;text-align:center;width:100%"
          v-model.trim="menuValue"
          placeholder="请输入菜单名称"
          @blur="getChangeMenus"
        /> -->
        <template v-for="(item, index) in menuList">
          <!-- 这里的index不能去掉,匹配路由的 :index="index + ''" -->
          <el-submenu :index="item.MenuName" v-if="userMenu(item)" :key="index">
            <!-- 一级标题 -->
            <template slot="title">
              <img
                :src="item.icon"
                alt=""
                style="width:18px;height:18px;margin-right:3px"
              />
              <span slot="title ">{{ item.MenuName }}</span>
            </template>
            <!-- 二级 -->
            <template v-for="(item1, idx) in item.Child">
              <el-menu-item-group v-if="userMenu(item1)" :key="idx">
                <!-- 二级标题 -->
                <el-menu-item
                  :index="`/${item1.Url}`"
                  v-if="item1.Child.length == 0"
                >
                  <i class="iconfont icon-menu-spgl-normal"></i>
                  <span>{{ item1.MenuName }}</span>
                </el-menu-item>
                <!-- 二级菜单 -->
                <el-submenu :index="idx + ''" v-if="item1.Child.length > 0">
                  <template slot="title">
                    <i
                      :class="
                        item1.Type == 1
                          ? 'iconfont icon-icon-menus'
                          : 'iconfont icon-menu-spgl-normal'
                      "
                    ></i>
                    <span slot="title ">{{ item1.MenuName }}</span>
                  </template>
                  <!-- 三级菜单 -->
                  <template v-for="(item2, idx) in item1.Child">
                    <el-menu-item
                      :index="`/${item2.Url}`"
                      v-if="userMenu(item2)"
                      :key="idx"
                    >
                      <i class="iconfont icon-menu-spgl-normal"></i>
                      <span>{{ item2.MenuName }}</span>
                    </el-menu-item>
                  </template>
                </el-submenu>
              </el-menu-item-group>
            </template>
          </el-submenu>
        </template>
      </el-menu>
    </el-aside>
  </div>
</template>
<script>
import { getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
export default {
  data() {
    return {
      menuList: [],
      //搜索的值
      menuValue: "",
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      dynamicMenuRoutes:null
    };
  },
  methods: {
    //路由操作
    routeHandle(route) {
      // console.log(route, "route");
      if (route.meta.isTab) {
        // tab选中, 不存在先添加
        var tab = this.mainTabs.filter(item => item.name === route.name)[0];
        if (!tab) {
          if (route.meta.isDynamic) {
            route = this.dynamicMenuRoutes.filter(
              item => item.name === route.name
            )[0];
            if (!route) {
              return console.error("未能找到可用标签页!");
            }
          }
          tab = {
            menuId: route.meta.menuID || route.name,
            name: route.name,
            title: route.meta.title
          };
          this.mainTabs = this.mainTabs.concat(tab);
        }
        this.menuActiveName = tab.menuId + "";
        this.mainTabsActiveName = tab.name;
      }
    },
    //根据用户权限，筛选菜单
    userMenu(i) {
      // 如果菜单类型是模块分类，不用设置权限，Type=1
      if (i.Type == 1) {
        return true;
      }
      let _userLimit = JSON.parse(sessionStorage.getItem("userLimit"));
      let show = false;
      if (_userLimit && _userLimit.length > 0) {
        show = _userLimit.some(element => {
          return element.fModID == i.MenuID && element.fLook == 1;
        });
      }
      return show;
      // return true
    },
    getChangeMenus() {
      // console.log("woshijiaole");
      // this.searchMenus();
    },
    //搜索菜单
    async searchMenus() {
      if (this.menuValue == "") {
        this.menuList = JSON.parse(sessionStorage.getItem("menuList") || "[]");
      } else {
        let searchWhere = [
          {
            Computer: "_like_",
            DataFile: "fModName",
            Value: this.menuValue
          }
        ];
        let res = await getTableBodyData("t_Mod_Mst", searchWhere);

        res = JSON.parse(
          decryptDesCbc(res.qureyDataResult, String(this.userDes))
        );
        if (res.State) {
          let result = JSON.parse(res.Data);
          // console.log(result, "result");
          this.menuList.forEach(ele => {
            result.forEach(item => {
              if (ele.MenuID == item.fPID) {
                this.menuList = [ele];
              } else {
                ele.Child.forEach(child => {
                  if (child.MenuID == item.fPID) {
                    this.menuList = [ele];
                  }
                });
              }
            });
          });
          // console.log(this.menuList);
        }
      }
    }
  },
  computed: {
    pickState: {
      get() {
        console.log(this.$store.state.common.pickState);
        return this.$store.state.common.pickState;
      }
    },
    theme: {
      get() {
        return this.$store.state.settings.theme;
      }
    },
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      }
    },
    sidebarFold: {
      get() {
        return this.$store.state.common.sidebarFold;
      }
    },
    menusWidth: {
      get() {
        return this.$store.state.common.menusWidth;
      }
    },
    menuActiveName: {
      get() {
        return this.$store.state.common.menuActiveName;
      },
      set(val) {
        // console.log(val);
        this.$store.commit("common/updateMenuActiveName", val);
        // this.$store.commit("common/setKeepAliveList", val);
      }
    },
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      },
      set(val) {
        this.$store.commit("common/updateMainTabs", val);
      }
    },
    mainTabsActiveName: {
      get() {
        return this.$store.state.common.mainTabsActiveName;
      },
      set(val) {
        this.$store.commit("common/updateMainTabsActiveName", val);
      }
    }
  },
  watch: {
    $route: "routeHandle"
  },
  async created() {
    this.menuList = JSON.parse(sessionStorage.getItem("menuList") || "[]");
    this.dynamicMenuRoutes = JSON.parse(
      sessionStorage.getItem("dynamicMenuRoutes") || "[]"
    );
    this.routeHandle(this.$route);
    let userLimit = JSON.parse(sessionStorage.getItem("userLimit"));
    if (userLimit && userLimit.length > 0) {
      this.menuList.forEach(item => {
        userLimit.forEach(ele => {
          item.Child.forEach(v => {
            if (v.MenuID == ele.fModID && ele.fLook == 1) {
              this.$set(item, "show", true);
            }
          });
        });
      });
    }
    this.menuList = this.menuList.filter(item => {
      return item.show == true;
    });
    // console.log(this.menuList);
  }
};
</script>
<style lang="scss" scoped>
.el-aside {
  height: 100%;
}

.el-menu {
  height: 100%;
  .title {
    color: #fff;
    // color: $--color-primary;
    height: 50px;
    font-size: 20px;
  }
}
.light {
  background-color: #ffffff;
  .title {
    color: #333;
  }
  .el-submenu__title i {
    color: #17b3a3;
  }
}

.dark {
  // background-color: #024d6e;
  /deep/ .el-submenu__title {
    color: #fff;
  }
  .el-submenu .el-menu-item {
    color: #fff;
  }
  /deep/ .el-menu {
    background-color: #024d6e;
  }
  /deep/ .el-submenu__title:hover {
    background-color: #023e58 !important;
  }
  /deep/ .el-menu-item {
    background-color: #024d6e !important;
  }
  /deep/ .el-menu-item:hover {
    background-color: #023e58 !important;
  }
}
</style>
