<template>
  <div ref="toPrint">
    <!-- page-break-after:always ;justify-content: flex-start;padding-top:20px-->
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="height:100vh;display: flex;flex-direction: column;"
    >
      <!--  jsbarcode-margin="10" zoom:0.5; -->
      <div style="zoom:0.6; transform: translate(-10px,0);">
        <svg
          :key="index"
          class="barcode"
          :jsbarcode-value="item.fBarcode"
          jsbarcode-textmargin="0"
          jsbarcode-height="50"
          jsbarcode-width="2"
          jsbarcode-displayvalue="true"
        ></svg>
      </div>

      <div
        style="font-size:14px;font-weight:700; padding:0;text-overflow:ellipsis; white-space:nowrap;"
      >
        拣货单号:{{ item.fOutboundOrderNo }}
      </div>
      <div style="font-size:14px;font-weight:700;  padding:0">
        门店代码:{{ item.fShopCode }}
      </div>
      <div style="font-size:14px;font-weight:700;  padding:0">
        门店名称:{{ item.fShopName }}
      </div>

      <div style="font-size:14px;font-weight:700;  padding:0">
        区域名称:{{ item.fAreaName }}
      </div>
      <div style="font-size:14px;font-weight:700;  padding:0">
        线路名称:{{ item.fRouteName }}
      </div>
      <div style="font-size:14px;font-weight:700; padding:0">
        数量:{{ item.fOutboundNum }}
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
