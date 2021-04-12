<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="text-align:center;"
    >
      <div>货品条码</div>
      <svg
        :key="index"
        class="barcode"
        :jsbarcode-value="item.productBarCode"
        jsbarcode-textmargin="0"
        jsbarcode-height="75"
      ></svg>
    </div>
  </div>
</template>
<script>
import JsBarcode from "jsbarcode";

import { getTableBodyData, getTableHeadData } from "@/api/index";
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
