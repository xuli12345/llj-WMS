<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="height:100vh;page-break-after:always"
    >
      <h1
        style="margin:0;padding:0;font-size:30px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[0] }}
      </h1>
      <h3
        style="margin:0;padding:0;font-size:20px;margin-bottom:10px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[1] }}
      </h3>
      <div class="page" style="font-size:16px;display: flex;flex-wrap:wrap">
        <p style="width:33.33%;margin:0;padding:0">
          收货单号:{{ item[0].fReceiveNo }}
        </p>
        <p style="width:33.33%;margin:0;padding:0">
          订单号:{{ item[0].fInboundOrderNo }}
        </p>
        <p style="width:33.33%;margin:0;padding:0">
          单据打印时间:{{ dataTime }}
        </p>
        <p style="width:33.33%;margin:0;padding:0">
          供应商:{{ item[0].fSupplierName }}
        </p>
      </div>

      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        border
        style="width: 100% ;"
        :data="item"
      >
        <template>
          <template v-for="(item, index) in ItemTableHeadData">
            <el-table-column
              v-if="item.fVisible == 1"
              :key="index"
              :label="item.fColumnDes"
              :prop="item.fColumn"
              :width="item.width"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <div
                  style="white-space: nowrap; overflow: hidden;text-overflow: ellipsis;"
                >
                  {{ scope.row[item.fColumn] }}
                </div>
              </template>
            </el-table-column>
          </template>
        </template>
      </el-table>
      <div style="display:flex;font-size:20px">
        <p style="flex:1">送货人:</p>
        <p style="flex:1">签收人:</p>
      </div>
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

    console.log(this.tableData);
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },

  created() {
    this.tableHeadData = this.printHeadData;
  },
  watch: {
    dataCode(newVal, oldVal) {
      this.tableData = newVal;
      console.log(this.tableData);
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
