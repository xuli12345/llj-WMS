<template>
  <!--   page-break-after:always-->
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="display: flex;
    height: 100vh;
    justify-content: space-around;
    page-break-after:always"
    >
      <div
        style="display: flex;justify-content: space-around;flex-direction: column;height:100%;zoom: 1.2"
      >
      <!-- fStorageCode -->
        <svg
          :key="index"
          class="barcode"
          :jsbarcode-value="item.fStorageBarCode"
          jsbarcode-textmargin="0"
          jsbarcode-height="100"
          jsbarcode-width="2"
          jsbarcode-displayvalue="false"
          jsbarcode-fontoptions="bold"
        ></svg>
        <!-- transform:scale(2.1,2)  zoom: 1.5-->
        <span
          style="font-size:40px;text-align: center;padding:0;font-weight:700;"
        >
          {{ item.fStorageCode }}
        </span>
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
