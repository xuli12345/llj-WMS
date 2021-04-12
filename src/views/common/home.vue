<template>
  <div style="position:relative">
    <el-card>
      <img class="chart-box" src="../../assets/img/home2.jpg" alt />
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      height:document.body.clientHeight-130
    };
  }
};
</script>
<style lang="scss" scoped>
.chart-box {
  width: 38%;
  height: 30%;
}
</style>
