<template>
  <div
    class="site-content"
    :class="{ 'site-content--tabs': $route.meta.isTab }"
  >
    <!-- mainTabsActiveName=='home'?false :true -->

    <el-tabs
      v-if="$route.meta.isTab"
      v-model="mainTabsActiveName"
      :closable="
        mainTabsActiveName == 'home' && this.mainTabs.length == 1 ? false : true
      "
      @tab-click="selectedTabHandle"
      @tab-remove="removeTabHandle"
      :style="{ left: sidebarFold === true ? '64px' : changeWidth }"
    >
      <el-dropdown
        class="site-tabs__tools"
        :show-timeout="0"
        v-show="this.mainTabs.length > 0"
      >
        <i class="el-icon-arrow-down el-icon--right"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="tabsCloseCurrentHandle"
            >关闭当前标签页</el-dropdown-item
          >
          <el-dropdown-item @click.native="tabsCloseOtherHandle"
            >关闭其它标签页</el-dropdown-item
          >
          <el-dropdown-item @click.native="tabsCloseAllHandle"
            >关闭全部标签页</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
      <el-tab-pane
        v-for="item in mainTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
      >
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  data() {
    return {
      changeWidth: "",
      pickState: this.$store.state.common.pickState
    };
  },
  created() {
    if (this.pickState) {
      this.changeWidth = 0;
    } else {
      this.changeWidth = "230px";
    }
  },
  computed: {
    menuActiveName: {
      get() {
        return this.$store.state.common.menuActiveName;
      },
      set(val) {
        this.$store.commit("common/updateMenuActiveName", val);
      }
    },
    mainTabsActiveName: {
      get() {
        return this.$store.state.common.mainTabsActiveName;
      },
      set(val) {
        this.$store.commit("common/updateMainTabsActiveName", val);
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
    sidebarFold: {
      get() {
        return this.$store.state.common.sidebarFold;
      }
    }
  },

  methods: {
    // tabs, 选中tab
    selectedTabHandle(tab) {
      tab = this.mainTabs.filter(item => item.name === tab.name);
      if (tab.length >= 1) {
        this.$router.push({
          name: tab[0].name
          // query: tab[0].query,
          // params: tab[0].params
        });
      }
      // console.log(this.$router)
    },
    // tabs, 删除tab
    removeTabHandle(tabName) {
      this.mainTabs = this.mainTabs.filter(item => item.name !== tabName);
      if (this.mainTabs.length >= 1) {
        // 当前选中tab被删除
        if (tabName === this.mainTabsActiveName) {
          var tab = this.mainTabs[this.mainTabs.length - 1];
          this.$router.push(
            { name: tab.name, query: tab.query, params: tab.params },
            () => {
              this.mainTabsActiveName = this.$route.name;
            }
          );
        }
      } else {
        this.menuActiveName = "";
        this.$router.push({ name: "home" });
      }
    },
    // tabs, 关闭当前
    tabsCloseCurrentHandle() {
      this.removeTabHandle(this.mainTabsActiveName);
    },
    // tabs, 关闭其它
    tabsCloseOtherHandle() {
      this.mainTabs = this.mainTabs.filter(item => {
        return item.name === this.mainTabsActiveName;
      });
    },
    // tabs, 关闭全部
    tabsCloseAllHandle() {
      this.mainTabs = [];
      this.menuActiveName = "";
      this.$router.push({ name: "home" });
    }
  }
};
</script>
<style lang="scss" scoped>
.site-content {
  position: relative;
}

.el-tabs--card > .el-tabs__header {
  border-bottom: none;
}

/deep/ .el-tabs__new-tab {
  border: none !important;
}

.el-tabs {
  position: fixed;
  z-index: 9;
  top: 40px;
  right: 0;
}
/deep/ .el-tabs__header {
  margin: 0;
  background-color: #fff;
  border-bottom: none !important;
}

/deep/ .el-tabs__item {
  border-bottom: none !important;
  border-left: none !important;
}
/deep/ .el-tabs__item.is-top:nth-child(2) {
  padding: 0 20px;
}
/deep/ .el-tabs__nav {
  border: none !important;
}
/deep/ .el-tabs__content {
  position: fixed;
  right: 20px;
  top: 50px;
}

/deep/ .el-tabs__nav-wrap.is-scrollable {
  padding: 0 40px;
}

/deep/ .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
  padding-left: 10px;
}
</style>
