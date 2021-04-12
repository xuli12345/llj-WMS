<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="text-align:center;"
    >
      <svg
        :key="index"
        class="barcode"
        :jsbarcode-value="item.fContainerCode"
        jsbarcode-textmargin="0"
        jsbarcode-height="75"
        jsbarcode-displayvalue="false"
      ></svg>
      <span
        style="font-size:24px;text-align: center;padding:0;font-weight:700;"
      >
        {{ item.fContainerCode }}
      </span>
    </div>
  </div>
</template>
<script>
import JsBarcode from "jsbarcode";
export default {
  props: ["tableData"],
  data() {
    return {
      dataTime: new Date(),
      userDes: this.$store.state.user.userInfo.userDes,
      tableHeadData: []
    };
  },

  mounted() {
    console.log(this.tableData);
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 150);
  }
};
</script>

<style>
.input-box /deep/.el-input__inner {
  border: none !important;
}
</style>
