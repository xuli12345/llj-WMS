<template>
  <!-- style="page-break-after:always"  page-break-before: always;-->
  <div ref="toPrint">
    <div
      v-for="(item, index) in tableData"
      :key="index"
      style="height:100vh;page-break-after:always;"
    >
      <h1
        style="margin:0;padding:0;font-size:30px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title }}
      </h1>

      <div style="display:flex;justify-content: flex-end">
        第{{ item.areIndex }}页/共{{ item.areTotal }}页
      </div>
      <div
        style="margin:10px;display: flex;align-items: center;font-size:24px;flex-wrap: wrap;font-weight:700"
      >
        <span style="width:50%;margin:0;padding:0;"
          >门店名称:{{ item[0].fShopName }}({{ item[0].fShopCode }})</span
        >
        <span style="width:50%;margin:0;padding:0;"
          >配货作业号:{{ item[0].fJobID }}</span
        >
        <span style="width:50%;margin:0;padding:0;"
          >线路名称:{{ item[0].fRouteName }}</span
        >
      </div>
      <div v-if="chayiData.length > 0">
        <div
          v-for="(val, index) in chayiData"
          :key="index"
          style="display:flex;flex-wrap:wrap;"
        >
          <div style="width:35%">来源单号:{{ val.REFBILLNO }}</div>
          <div style="width:35%">差异单号:{{ val.BILLNO }}</div>
          <div style="width:15%">差异数:{{ val.CYCOUNT }}</div>
          <div style="width:15%">差异金额:{{ val.PSTOTAL }}</div>
        </div>
      </div>

      <div style="width:100%;display:flex;flex-wrap:wrap;">
        <span style="width:35%;margin:0;padding:0;"
          >总件数:{{ RData(item, "fJianshu") }}</span
        >
        <span style="width:35%;margin:0;padding:0;"
          >总散数:{{ RData(item, "fSanjian") }}</span
        >
        <span style="width:15%;margin:0;padding:0;"
          >总实拣数:{{ RData(item, "fRealOutboundNum") }}</span
        >
        <span style="width:15%;margin:0;padding:0;"
          >箱号数:{{ removeRepact(item) }}</span
        >
      </div>
      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        :data="item"
        border
        style="width: 100% ;"
        :row-style="{ height: '35px' }"
      >
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <template v-for="(item, index) in tableHeadData">
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
      </el-table>
    </div>
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";
export default {
  props: ["dataCode", "printHeadData", "chayiData"],
  data() {
    return {
      title: "老邻居配送中心发货单",
      tableData: [],
      tableHeadData: []
    };
  },
  created() {
    console.log(this.chayiData);
    this.tableData = this.dataCode;
    this.tableHeadData = JSON.parse(JSON.stringify(this.printHeadData));
    //     item.fColumn == "fOutboundNum"||
    this.tableHeadData.forEach(item => {
      if (
        item.fColumn == "fProductName" ||
        item.fColumn == "fProductBarCode" ||
        item.fColumn == "fPackQty" ||
        item.fColumn == "fUnitName" ||
        item.fColumn == "fJianshu" ||
        item.fColumn == "fSanjian" ||
        item.fColumn == "fRealOutboundNum" ||
        item.fColumn == "fOrgBillNo" ||
        item.fColumn == "fBoxBar"
      ) {
        this.$set(item, "fVisible", 1);
      } else if (
        item.fColumn == "fShopCode" ||
        item.fColumn == "fShopName" ||
        item.fColumn == "fRouteName"
      ) {
        this.$set(item, "fVisible", 0);
      }
      if (item.fColumn == "fProductBarCode") {
        this.$set(item, "width", 150);
      } else if (item.fColumn == "fOrgBillNo") {
        this.$set(item, "width", 210);
      } else if (item.fColumn == "fProductName") {
        this.$set(item, "width", 300);
      } else if (item.fColumn == "fPackQty") {
        this.$set(item, "width", 60);
      } else if (
        item.fColumn == "fRealOutboundNum" ||
        item.fColumn == "fBoxBar"
      ) {
        this.$set(item, "width", 65);
      } else if (
        item.fColumn == "fUnitName" ||
        item.fColumn == "fJianshu" ||
        item.fColumn == "fSanjian"
      ) {
        this.$set(item, "width", 50);
      } else {
        this.$set(item, "width", 100);
      }
    });
  },
  mounted() {
    console.log(this.tableHeadData);
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },

  methods: {
    RData(data, fcolumn) {
      let sum = 0;
      data.forEach(ele => {
        // console.log(ele)
        if (fcolumn == "fJianshu") {
          sum += ele.fJianshu;
        } else if (fcolumn == "fSanjian") {
          sum += ele.fSanjian;
        } else if (fcolumn == "fRealOutboundNum") {
          sum += ele.fRealOutboundNum;
        }
      });
      // console.log(sum);
      return sum;
    },
    removeRepact(arr) {
      let data = arr.filter(item => {
        return item.fBoxBar != "";
      });
      // console.log(data);
      var hash = {};
      data = data.reduce(function(arr, current) {
        hash[current.fBoxBar]
          ? ""
          : (hash[current.fBoxBar] = true && arr.push(current));
        return arr;
      }, []);
      // console.log(data);
      return data.length;
    }
  }
};
</script>

<style lang="scss" scoped>
.input-box /deep/.el-input__inner {
  border: none !important;
}
</style>
