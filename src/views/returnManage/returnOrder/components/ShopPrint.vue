<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="display:flex;flex-direction:column;align-items:center"
    >
      <div>
        <svg
          :key="index"
          class="barcode"
          :jsbarcode-value="item.fOutboundOrder"
          jsbarcode-textmargin="0"
          jsbarcode-height="50"
          jsbarcode-displayvalue="true"
        ></svg>
      </div>

      <!-- <div
        style="display:flex;flex-direction:row;  margin:0; padding:0"
      >
        <p style="margin:0; padding:0">门店代码:{{ item.fShopCode }}</p>
        <p style="margin:0;padding:0">数量:{{ item.fSkus }}</p>
      </div> -->
      <div style="margin:0; padding:0">
        <p style="margin:0; padding:0">门店代码:{{ item.fShopCode }}</p>
        <p style="margin:0; padding:0">门店名称:{{ item.fShopName }}</p>
        <p style="margin:0; padding:0">拣货单号:{{ item.fOutboundOrderNo }}</p>
        <p style="margin:0;padding:0">数量:{{ item.fSkus }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import JsBarcode from "jsbarcode";

export default {
  props: ["dataCode"],
  data() {
    return {
      tableData: [],
      dataTime: new Date()
    };
  },

  mounted() {
    this.tableData = this.dataCode;
    // console.log(this.dataCode)
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 350);
  },
  watch: {
    dataCode(newVal, oldVal) {
      this.tableData = newVal;
      setTimeout(() => {
        JsBarcode(".barcode").init();
      }, 350);
    }
  }
};
</script>

<style>
.input-box /deep/.el-input__inner {
  border: none !important;
}
</style>
