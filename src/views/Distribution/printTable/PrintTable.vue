<template>
  <div ref="toPrint" style="height:auto">
    <h3
      style="margin:0;padding:0;font-size:20px;margin-bottom:10px;display: flex;  align-items: center;  justify-content: center;"
    >
      {{ title }}
    </h3>
    <p
      class="page"
      style="margin:0 20px 0 0;padding:0;font-size:16px;display: flex; justify-content: flex-end;"
    >
      打印时间:{{ dataTime }}
    </p>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      class="singleTable"
      ref="singleTable"
      border
      style="width: 100% ;"
      :data="tableData"
    >
      <el-table-column type="index" label="序号" width="80"></el-table-column>
      <template v-for="(item, index) in printHeadData">
        <el-table-column
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          :width="item.width"
          align="center"
        ></el-table-column>
      </template>
    </el-table>
    <!-- </div> -->
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: ["dataCode", "printHeadData", "title", "ItemBackData"],
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
  methods: {
    // RData(v) {
    //   let TableList = [];
    //   this.ItemBackData.forEach(item => {
    //     item.forEach(child => {
    //       // console.log(child)
    //       if (
    //         child.fPrice == null ||
    //         child.fRealReceiptNum == null ||
    //         child.fRealAmt == null
    //       ) {
    //         this.$set(child, "fPrice", 0);
    //         this.$set(child, "fRealReceiptNum", 0);
    //         this.$set(child, "fRealAmt", 0);
    //       }
    //       this.$set(item, "fRealAmt", child.fPrice * child.fRealReceiptNum);
    //       if (child.fMstID == v) {
    //         TableList = item;
    //       }
    //     });
    //   });
    //   return TableList;
    // }
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
