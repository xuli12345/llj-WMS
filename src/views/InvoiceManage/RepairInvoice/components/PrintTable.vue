<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="height:100vh;page-break-after:always"
    >
      <h1
        style="font-size:30px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[0] }}
      </h1>
      <h3
        style="font-size:20px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[1] }}
      </h3>
      <p
        class="page"
        style="margin:0;padding:0;display: flex; justify-content: flex-end;font-size:16px;"
      >
        单据打印时间:{{ dataTime }}
      </p>
      <div
        style="margin-left:10px;display: flex;align-items: center;font-size:16px;"
      >
        <span style="margin:0;padding:0;flex:1"
          >{{ tableHeadData[2] }}:{{ item.fQty }}</span
        >
        <span style="margin:0;padding:0;flex:1"
          >{{ tableHeadData[3] }}:{{ item.fStateName }}</span
        >

        <span style="margin:0;padding:0;flex:1;text-align: right;">
          <svg
            :key="index"
            class="barcode"
            :jsbarcode-value="item.fOrderNo"
            jsbarcode-textmargin="0"
            jsbarcode-height="40"
            jsbarcode-displayvalue="true"
          ></svg
        ></span>
      </div>

      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        border
        style="width: 100% ;"
        :data="RData(item.fID)"
      >
        <template>
          <template v-for="(item, index) in ItemTableHeadData">
            <el-table-column
              v-if="item.fVisible == 1"
              :key="index"
              :label="item.fColumnDes"
              :prop="item.fColumn"
            >
            </el-table-column>
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
  props: [
    "dataCode",
    "printHeadData",
    "title",
    "ItemTableHeadData",
    "ItemBackData"
  ],
  data() {
    return {
      dataTime: timeCycle(new Date()),
      tableData: [],
      tableHeadData: []
    };
  },

  mounted() {
    this.tableData = this.dataCode;
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },
  methods: {
    RData(v) {
      // console.log(v)
      let TableList = [];
      this.ItemBackData.forEach(item => {
        item.forEach(child => {
          if (child.fMstID == v) {
            TableList = item;
          }
        });
      });
      return TableList;
    }
  },
  created() {
    this.tableHeadData = this.printHeadData;
    console.log(this.tableHeadData);
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
