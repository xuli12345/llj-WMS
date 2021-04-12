<template>
  <!-- style="page-break-after:always" -->
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="height: 100vh; page-break-after: always"
    >
      <h1
        style="
          margin: 0;
          padding: 0;
          font-size: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        {{ title[0] }}
      </h1>
      <h3
        style="
          margin: 0;
          padding: 0;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        {{ title[1] }}
      </h3>
      <p
        class="page"
        style="
          margin: 0 20px 0 0;
          padding: 0;
          font-size: 16px;
          display: flex;
          justify-content: flex-end;
        "
      >
        单据打印时间:{{ dataTime }}
      </p>
      <div
        style="
          margin: 10px;
          display: flex;
          align-items: center;
          font-size: 16px;
          flex-wrap: wrap;
        "
      >
        <span style="width: 33%; margin: 0; padding: 0"
          >{{ tableHeadData[1] }}:{{ item.fOutboundOrderNo }}</span
        >
        <span style="width: 33%; margin: 0; padding: 0"
          >{{ tableHeadData[4] }}:{{ item.fShopName }}</span
        >
        <span
          style="
            width: 33%;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: flex-end;
          "
        >
          拣货单号: {{ item.fBarcode }}
        </span>
        <span style="width: 33%; margin: 0; padding: 0"
          >{{ tableHeadData[5] }}:{{ item.fAreaName }}</span
        >
        <span style="width: 33%; margin: 0; padding: 0"
          >{{ tableHeadData[6] }}:{{ item.fOutboundNum }}</span
        >
      </div>

      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        :data="item.tableData"
        border
        style="width: 100%"
      >
        <template v-for="(item, index) in ItemTableHeadData">
          <el-table-column
            v-if="item.fVisible == 1"
            :key="index"
            :label="item.fColumnDes"
            :prop="item.fColumn"
            :width="item.width"
          >
          </el-table-column>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: ["dataCode", "printHeadData", "title", "ItemTableHeadData"],
  data() {
    return {
      dataTime: timeCycle(new Date()),
      tableData: [],
      tableHeadData: []
    };
  },

  mounted() {
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },

  created() {
    this.tableHeadData = this.printHeadData;
    this.tableData = this.dataCode;
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
.input-box /deep/.el-input__inner {
  border: none !important;
}
</style>
