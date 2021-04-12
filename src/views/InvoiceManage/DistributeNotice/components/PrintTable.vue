<template>
  <!--  style="page-break-after:always"  page-break-before: always;-->
  <div>
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
      <!-- ,总共{{item.lengthNum}}页 -->
      <div style="display:flex;justify-content: space-between">
        <div style="font-size:30px;font-weight:700">
          区域名称:{{ item[0].fAreaName }}
        </div>
        <div>第{{ item.areIndex }}页/当前区域共{{ item.areTotal }}页</div>
      </div>

      <div
        style="margin:10px;display: flex;align-items: center;font-size:28px;flex-wrap: wrap;font-weight:700"
      >
        <span style="width:50%;margin:0;padding:0;"
          >门店名称:{{ item[0].fShopName }}({{ item[0].fShopCode }})</span
        >
        <span style="width:50%;margin:0;padding:0;"
          >来源单号:{{ item[0].fOrgBillNo }}</span
        >
        <span style="width:50%;margin:0;padding:0;"
          >品种数:{{ removeRepact(item) }}</span
        >
        <span style="width:50%;margin:0;padding:0;"
          >总数量:{{ RData(item) }}</span
        >
      </div>

      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        :data="item"
        :row-style="{ height: '35px' }"
        borderd
        style="width: 100% ;"
      >
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <template v-for="(item, index) in printHeadData">
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
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: ["dataCode", "printHeadData", "title"],
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
    removeRepact(data) {
      var hash = {};
      data = data.reduce(function(arr, current) {
        hash[current.fProductBarcode]
          ? ""
          : (hash[current.fProductBarcode] = true && arr.push(current));
        return arr;
      }, []);
      //  console.log(data)
      return data.length;
    },
    RData(data) {
      let sum = 0;
      data.forEach(ele => {
        sum += ele.fQty;
      });
      // console.log(sum);
      return sum;
    }
  }
};
</script>

<style lang="scss" scoped>
.input-box /deep/.el-input__inner {
  border: none !important;
}
</style>
