<template>
  <div class="navbar flex-justify-space-between">
    <div>
      <i class="el-icon-s-operation" @click="sidebarFold = !sidebarFold"></i>
      <breadcrumb id="breadcrumb-container" />
    </div>

    <div class="flex">
      <screenfull id="screenfull" />

      <el-dropdown
        :show-timeout="1"
        placement="bottom"
        style="width: 50px; padding-top: 10px;"
      >
        <span>
          <el-badge value="new">
            <i class="el-icon-setting" style="padding-top: 10px;"></i>
          </el-badge>
        </span>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            换肤
            <el-color-picker
              @change="themeChange"
              v-model="theme"
              :predefine="[
                '#409EFF',
                '#67C23A',
                '#E6A23C',
                '#f5222d',
                '#11a983',
                '#13c2c2',
                '#6959CD',
                '#434f5d'
              ]"
              class="theme-picker"
              popper-class="theme-picker-dropdown"
              title="换肤"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown
        :show-timeout="0"
        placement="bottom"
        class="flex-align-center"
      >
        <span class="el-dropdown-link">
          <img class="avatar" src="../assets/img/avatar.png" />
          {{ this.$store.state.user.userInfo.username }}
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="updatePasswordHandle()"
            >修改密码</el-dropdown-item
          >
          <el-dropdown-item @click.native="logoutHandle">退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 弹窗, 修改密码 -->
    <update-password
      v-if="updatePassowrdVisible"
      ref="updatePassowrd"
    ></update-password>
  </div>
</template>
<script>

import Screenfull from "@/components/Screenfull";
import Breadcrumb from "@/components/Breadcrumb";
 import UpdatePassword from './main-navbar-update-password'
const version = require("element-ui/package.json").version; // element-ui version from node_modules
const ORIGINAL_THEME = "#409EFF";
export default {
  components: {
    Screenfull,
    Breadcrumb,
    UpdatePassword
  },
  data() {
    return {
      chalk: "",
      theme: "",
      updatePassowrdVisible: false
    };
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
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      },
      set(val) {
        this.$store.commit("common/updateMainTabs", val);
      }
    },
    defaultTheme() {
      return this.$store.state.settings.theme;
    },

    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      },
      set(val) {
        this.$store.commit("common/updateSidebarLayoutSkin", val);
      }
    },

    sidebarFold: {
      get() {
        return this.$store.state.common.sidebarFold;
      },
      set(val) {
        this.$store.commit("common/updateSidebarFold", val);
      }
    }
  },
  watch: {
    defaultTheme: {
      handler: function(val, oldVal) {
        this.theme = val;
      },
      immediate: true
    },
    async theme(val) {
      const oldVal = this.chalk ? this.theme : ORIGINAL_THEME;
      if (typeof val !== "string") return;
      const themeCluster = this.getThemeCluster(val.replace("#", ""));
      const originalCluster = this.getThemeCluster(oldVal.replace("#", ""));
      // console.log(themeCluster, originalCluster)

      const $message = this.$message({
        message: "更换主题中...",
        customClass: "theme-message",
        type: "success",
        duration: 0,
        iconClass: "el-icon-loading"
      });

      const getHandler = (variable, id) => {
        return () => {
          const originalCluster = this.getThemeCluster(
            ORIGINAL_THEME.replace("#", "")
          );
          const newStyle = this.updateStyle(
            this[variable],
            originalCluster,
            themeCluster
          );

          let styleTag = document.getElementById(id);

          if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.setAttribute("id", id);

            document.head.appendChild(styleTag);
            // document
            //   .getElementsByTagName("style")[0]
            //   .insertBefore(styleTag, null);
          }
          styleTag.innerText = newStyle;
        };
      };

      if (!this.chalk) {
        const url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`;
        await this.getCSSString(url, "chalk");
      }

      const chalkHandler = getHandler("chalk", "chalk-style");
      chalkHandler();

      const styles = [].slice
        .call(document.querySelectorAll("style"))
        .filter(style => {
          const text = style.innerText;
          return (
            new RegExp(oldVal, "i").test(text) && !/Chalk Variables/.test(text)
          );
        });
      styles.forEach(style => {
        const { innerText } = style;
        if (typeof innerText !== "string") return;
        style.innerText = this.updateStyle(
          innerText,
          originalCluster,
          themeCluster
        );
      });

      this.$emit("change", val);

      $message.close();
    }
  },

  methods: {
    // 修改密码
    updatePasswordHandle() {
      this.updatePassowrdVisible = true;
      this.$nextTick(() => {
        this.$refs.updatePassowrd.init();
      });
    },
    updateStyle(style, oldCluster, newCluster) {
      let newStyle = style;
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, "ig"), newCluster[index]);
      });
      return newStyle;
    },

    getCSSString(url, variable) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, "");
            resolve();
          }
        };
        xhr.open("GET", url);
        xhr.send();
      });
    },

    getThemeCluster(theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16);
        let green = parseInt(color.slice(2, 4), 16);
        let blue = parseInt(color.slice(4, 6), 16);

        if (tint === 0) {
          // when primary color is in its rgb space
          return [red, green, blue].join(",");
        } else {
          red += Math.round(tint * (255 - red));
          green += Math.round(tint * (255 - green));
          blue += Math.round(tint * (255 - blue));

          red = red.toString(16);
          green = green.toString(16);
          blue = blue.toString(16);

          return `#${red}${green}${blue}`;
        }
      };

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16);
        let green = parseInt(color.slice(2, 4), 16);
        let blue = parseInt(color.slice(4, 6), 16);

        red = Math.round((1 - shade) * red);
        green = Math.round((1 - shade) * green);
        blue = Math.round((1 - shade) * blue);

        red = red.toString(16);
        green = green.toString(16);
        blue = blue.toString(16);

        return `#${red}${green}${blue}`;
      };

      const clusters = [theme];
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))));
      }
      clusters.push(shadeColor(theme, 0.1));
      return clusters;
    },
    themeChange(val) {
      this.$store.dispatch("settings/changeSetting", {
        key: "theme",
        value: val
      });
    },
    //退出登录
    logoutHandle() {
      this.$confirm("确定进行退出操作吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          //删除token
          window.sessionStorage.removeItem("user");
          this.$store.commit("user/updataUser", {});
          this.mainTabs = [];
          this.menuActiveName = "";
          this.$router.replace("/login");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.el-icon-s-operation {
  line-height: 36px;
  font-size: 24px;
}
img.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
