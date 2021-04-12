<template>
  <div id="app">
    <transition name="fade-transform" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>

export default {
  name: "App",
  data() {
    return {
      flag: true,
      customerData: []
    };
  },
  created() {
    try {
      if (devicePixelRatio !== 1) {
        //  console.log(devicePixelRatio)
        this.$notify({
          title: "提示",
          message: "请把浏览器缩放改为100%,否则界面可能会受影响",
          duration: 0
        });
      }
      window.onresize = () => {
        if (devicePixelRatio !== 1 && this.flag) {
          this.flag = false;
          this.$notify({
            title: "提示",
            type: "warning",
            message: "请把浏览器缩放改为100%,否则界面可能会受影响",
            duration: 0
          });
        }
      };
    } catch (error) {
      console.log("不支持devicePixelRatio");
    }
  }
};
</script>
