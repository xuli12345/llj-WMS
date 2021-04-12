<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="height:auto;page-break-after:always"
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
      <p
        class="page"
        style="margin:0 20px 0 0;padding:0;display: flex; justify-content: flex-end;font-size:20px;"
      >
        单据打印时间:{{ dataTime }}
      </p>
      <div
        style="margin-top:0px; display: flex;align-items: center;font-size:18px"
      >
        <span style="flex:2"
          >{{ tableHeadData[1] }}:{{ item.fCustomerName }}</span
        >
        <span style="flex:1"
          >{{ tableHeadData[2] }}:{{
            item.fInboundSumNum || item.fOutboundSumNum
          }}</span
        >
        <span style="flex:1"
          >{{ tableHeadData[0] }}:{{ item.OrdeTypeName }}</span
        >
        <span style="flex:1;text-align: right;">
          盘点单号:{{ item.fOrderNo }}
        </span>
      </div>

      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        border
        style="width: 100%;"
        :data="RData(item.fID)"
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
      TableList.forEach(ele => {
        if (ele.fBatchNo) {
          this.$set(ele, "fBatchNo", ele.fBatchNo.slice(0, 8));
        }
      });
      return TableList;
    }
  },
  created() {
    this.tableHeadData = this.printHeadData;
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
