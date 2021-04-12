<template>
  <!-- style="page-break-after:always" -->
  <div ref="toPrint" style="width:100%">
    <div
      v-for="(child, index) in tableData"
      :key="index"
      style="width:100%;height:100vh;page-break-after:always;position:relative"
    >
      <h1
        style="font-size:34px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[0] }}
      </h1>
      <h3
        style="font-size:24px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[1] }}
      </h3>
      <div style="width:100%;">
        <div
          style="width:100%;display:flex;padding:0px 0px 10px 20px;color:#131313;font-size:16px"
        >
          <span style="width:33%">操作人：{{ user.username }}</span>
          <span style="width:33%"
            >货主：{{ rowData[index].fConsignorName }}</span
          >
          <!-- <span>：</span> -->
        </div>
        <div
          style="width:100%;display:flex;padding:0px 0px 10px 20px;color:#131313;font-size:16px"
        >
          <span style="width:33%">单号：{{ rowData[index].fRtnNo }}</span>
          <span style="width:33%">总部单号：</span>
          <span style="width:33%">打印时间：{{ dataTime }}</span>
        </div>
        <div
          style="width:100%;display:flex;padding:0px 0px 10px 20px;color:#131313;font-size:16px"
        >
          <span style="width:33%"
            >建单人：{{ rowData[index].fCreaterCode }}</span
          >
          <span style="width:33%"
            >单据状态：{{ rowData[index].fStateName }}</span
          >
          <span style="width:33%"
            >填单日期：{{ format(rowData[index].fCreateDate) }}</span
          >
        </div>
        <div
          style="width:100%;display:flex;padding:0px 0px 10px 20px;color:#131313;font-size:16px"
        >
          <span style="width:33%"
            >供应商：{{ rowData[index].fSupplierName }}</span
          >
        </div>
      </div>
      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        border
        style="width:100%;height:auto;transform-origin:left top;transform:scale(0.6);"
        :data="child"
      >
        <template>
          <template v-for="(item, index) in ItemTableHeadData">
            <el-table-column
              v-if="item.fVisible == 1"
              :key="index"
              :label="item.fColumnDes"
              :prop="item.fColumn"
            ></el-table-column>
          </template>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  // rowData 选择的表格数据（主表数据）
  props: ["dataCode", "title", "ItemTableHeadData", "rowData"],
  data() {
    return {
      dataTime: timeCycle(new Date()),
      tableData: [],
      user: JSON.parse(sessionStorage.getItem("user"))
    };
  },

  mounted() {
    this.tableData = this.dataCode;
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },
  methods: {
    // 格式化时间
    format(v) {
      return timeCycle(v);
    }
  },
  created() {},
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
