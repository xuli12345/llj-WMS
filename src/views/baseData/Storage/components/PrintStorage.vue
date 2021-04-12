<template>
  <div ref="toPrint">
    <!-- align-items: center; -->
    <div
      v-for="(value, index) in tableData"
      :key="index"
      style="width:100%;display:flex;"
    >
      <!-- align-items: flex-start; -->
      <div
        :style="{
          width: '50%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: index1 % 2 == 0 ? 'flex-start' : 'flex-end'
        }"
        v-for="(item, index1) in value"
        :key="index1"
      >
        <div
          v-for="(val, i) in item"
          :key="i"
          style="display: flex;
      flex-direction: column;
      align-items: center;
     "
        >
          <div style="font-size:14px">
            {{
              val.lastNum == "5"
                ? "第五层"
                : val.lastNum == "4"
                ? "第四层"
                : val.lastNum == "3"
                ? "第三层"
                : val.lastNum == "2"
                ? "第二层"
                : "第一层"
            }}
          </div>
          <div style="zoom: 0.9">
            <svg
              id="svg"
              :key="i"
              class="barcode"
              :jsbarcode-value="val.fStorageBarCode"
              jsbarcode-textmargin="0"
              jsbarcode-height="75"
              jsbarcode-width="2"
              jsbarcode-fontoptions="bold"
              jsbarcode-displayvalue="false"
            ></svg>
          </div>

          <span
            style="font-size:35px;text-align: center;padding:0;font-weight:700;"
          >
            {{ val.fStorageCode }}
          </span>
          <img
            style="width:40px"
            v-if="val.direction"
            src="@/assets/img/right.jpg"
            alt=""
          />
          <img style="width:40px" v-else src="@/assets/img/left.jpg" alt="" />
        </div>
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
    console.log(this.tableData, this.dataCode, "print");
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },
  watch: {
    dataCode(newVal, oldVal) {
      // console.log(newVal, "newVal");
      this.tableData = newVal;
      setTimeout(() => {
        JsBarcode(".barcode").init();
      }, 250);
    }
  }
};
</script>

<style>
.input-box /deep/.el-input__inner {
  border: none !important;
}
#svg {
  width: 100% !important;
}
</style>
