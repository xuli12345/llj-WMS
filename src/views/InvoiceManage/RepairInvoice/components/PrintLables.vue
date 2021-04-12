<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="padding-left:20px"
    >
     <p style="padding:2px;margin:0;font-size:12px">
        <span >批次号:</span> <span>{{ item.fBatchNo }}</span>
      </p>
      <p style="padding:2px;margin:0;font-size:12px">
        <span >取货位:</span>
        <span>{{ item.fFrombinName }}</span>
      </p>
      <p style="padding:2px;margin:0;font-size:12px">
        <span > 目标货位:</span>
        <span>{{ item.fTobinName }}</span>
      </p>
      <p style="padding:2px;margin:0;font-size:12px">
        <span >货品编码:</span
        ><span>{{ item.fProductCode }}</span>
      </p>
      <p style="padding:2px;margin:0;font-size:12px">
        <span > 货品名称:</span>
        <span>{{ item.fProductName }}</span>
      </p>
      <p style="padding:2px;margin:0;font-size:12px">
        <span >包装规格:</span> <span>{{ item.fQpcstr }}</span>
      </p>
      <p style="padding:2px;margin:0;font-size:12px">
        <span >数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;量:</span> <span>{{ item.fQty }}</span>
      </p>
     
      <!-- <p style="padding:0;margin:0">{{ time }}</p> -->
    </div>
  </div>
</template>
<script>
import JsBarcode from "jsbarcode";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: ["dataCode"],
  data() {
    return {
      tableData: [],
      time: timeCycle(new Date())
    };
  },
  mounted() {
    this.tableData = this.dataCode;
    // console.log(this.dataCode, this.tableData);
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },
  watch: {
    dataCode(newVal, oldVal) {
      this.tableData = newVal;
      setTimeout(() => {
        JsBarcode(".barcode").init();
      }, 250);
    }
  }
};
</script>
<style lang="scss" scoped>
p {
  padding: 0;
  margin: 0;
}
</style>
