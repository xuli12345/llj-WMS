<template>
  <div style="margin-top:20px">
    <el-button type="primary" size="mini" class="iconfont icon-A" @click="changeViewFn" style="margin-left:20px">确定切换</el-button>

    <el-select style="width:250px" v-model="changeView" placeholder="请选择">
      <el-option label="海信对账" value="1"></el-option>
      <el-option label="知行对账" value="2"></el-option>
    </el-select>
  </div>
</template>

<script>
import { change_JinxiaoView_zxyt } from "@/api/distributor";
export default {
  data() {
    return {
      changeView: ""
    };
  },
  methods: {
    // 切换视图
    async changeViewFn() {
      // console.log('切换视图')
      if (this.changeView == "") {
        return this.$message.warning("请先选择视图!");
      }
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let res = await change_JinxiaoView_zxyt(Number(this.changeView));
      loading.close();
      // console.log(res)
      // res = JSON.parse(decryptDesCbc(res, String(this.user.userDes)));
      if (!res.state) {
        return this.$message.warning(res.message);
      }
      return this.$message.success("切换成功");
    }
  }
};
</script>

<style>
</style>