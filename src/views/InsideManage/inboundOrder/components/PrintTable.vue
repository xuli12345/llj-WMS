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
        style="margin:0 20px 0 0;padding:0;font-size:16px;display: flex; justify-content: flex-end;"
      >
        单据打印时间:{{ dataTime }}
      </p>

      <div style="display:flex">
        <span
          style="width:35%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          >供应商:{{ item.fSupplierName }}</span
        >
        <span style="width:35%;padding-left:20px"
          >来源单号:{{ item.fRelatedOrderNo }}</span
        >
        <span style="width:25%;padding-left:20px"
          >{{ tableHeadData[2] }}:{{
            item.fInboundSumNum || item.fOutboundSumNum
          }}</span
        >
      </div>
      <div style="display:flex">
        <span style="width:35%;"
          >{{ tableHeadData[0] }}:{{ item.OrdeTypeName }}</span
        >
        <span style="width:35%;padding-left:20px">
          单号:{{ item.fOrderNo }}
        </span>
        <span style="width:25%;padding-left:20px">
          验收人:{{ item.ReceiveName }}
        </span>
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
      tableHeadData: [],
      userCode: this.$store.state.user.userInfo.usercode
    };
  },

  mounted() {
    this.tableData = this.dataCode;
    console.log(this.tableData);
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },
  methods: {
    RData(v) {
      let TableList = [];
      this.ItemBackData.forEach(item => {
        item.forEach(child => {
          // console.log(child)
          if (
            child.fPrice == null ||
            child.fRealReceiptNum == null ||
            child.fRealAmt == null
          ) {
            this.$set(child, "fPrice", 0);
            this.$set(child, "fRealReceiptNum", 0);
            this.$set(child, "fRealAmt", 0);
          }
          this.$set(item, "fRealAmt", child.fPrice * child.fRealReceiptNum);
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
      // console.log(TableList)
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
