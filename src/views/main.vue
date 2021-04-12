<template>
  <el-container
    v-loading="this.$store.state.common.loadingStatus"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <!-- 左侧菜单 -->
    <main-aside></main-aside>
    <el-container>
      <el-header class="header">
        <main-navbar></main-navbar>
      </el-header>
      <el-main :max-height="tableHeight">
        <main-tabs></main-tabs>
        <transition name="fade-transform" mode="out-in">
          <keep-alive>
            <router-view :key="key"></router-view>
          </keep-alive>
        </transition>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import mainAside from "@/views/main-aside.vue";
import mainNavbar from "@/views/main-navbar.vue";
import mainTabs from "@/views/main-tabs.vue";

export default {
  components: {
    mainAside,
    mainNavbar,
    mainTabs
  },
  data() {
    return {
      tableHeight: document.body.clientHeight,
    };
  },
  computed: {
    sidebarFold: {
      //侧边栏折叠状态
      get() {
        return this.$store.state.common.sidebarFold;
      }
    },
    userId: {
      get() {
        return this.$store.state.user.id;
      },
      set(val) {
        this.$store.commit("user/updateId", val);
      }
    },
    userName: {
      get() {
        return this.$store.state.user.name;
      },
      set(val) {
        this.$store.commit("user/updateName", val);
      }
    },
    key() {
      // console.log(this.$route);
      return this.$route.fullPath;
      // return this.$route.meta.isKeepAlive;
    }
  }
};
</script>
<style lang="scss" scoped>
.el-container {
  height: 100%;
}
.header {
  height: 36px !important;
  background-color: lavender;
  box-shadow: 4px 4px 3px rgba(168, 168, 168, 0.84);
}
.el-main {
  padding: 0;
  margin-top: 40px;
 
}
</style>
