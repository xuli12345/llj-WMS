<template>
  <!-- style="page-break-after:always" -->
  <div ref="toPrint" style="width:100%">
    <div
      v-for="(child, index) in tableData"
      :key="index"
      style="width:100%;height:auto;page-break-after:always;position:relative"
    >
      <h1
        style="margin:0;padding:0;font-size:30px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[0] }}
      </h1>
      <h3
        style="margin:0;padding:0;font-size:20px;display: flex;  align-items: center;  justify-content: center;"
      >
        {{ title[1] }}
      </h3>
      <div style="margin:0;padding:0;width:100%;">
        <div
          style="margin:0;padding:0;width:100%;display:flex;padding:0px 0px 5px 10px;color:#131313;font-size:16px"
        >
          <span style="width:33%">排车单号：{{ rowData.fPaicheNo }}</span>
          <span style="width:33%">排车序号：{{ rowData.fJobID }}</span>
          <span style="width:33%">打印时间：{{ dataTime }}</span>
        </div>
        <div
          style="width:100%;display:flex;padding:0px 0px 5px 10px;color:#131313;font-size:16px"
        >
          <span style="width:33%">车号：{{ rowData.fLicenseNo }}</span>
          <span style="width:33%">驾驶员：{{ driverName }}</span>
          <span style="width:33%">装车确定人：{{ rowData.fLoaderCode }}</span>
        </div>
        <div
          style="width:100%;display:flex;padding:0px 0px 5px 10px;color:#131313;font-size:16px"
        >
          <span style="width:33%">操作员：{{ user.username }}</span>
          <!-- <span style="width:33%">排车单号：{{rowData.fPaicheNo}}</span> -->
        </div>
      </div>

      <el-table
        :header-cell-style="{ background: '#eef1f6' }"
        class="singleTable"
        ref="singleTable"
        border
        style="width:100%;"
        :data="[child]"
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
      <div>
        <p>
          请门店如实填写如下内容，以备仓库确认及复查（门店填写内容不得涂改，如有改动门店须在改动处签名盖章，否则无效）
        </p>
        <p style="font-weight:bold">
          温馨提示：整件商品请核对是否原包装，非原包装商品请当面清点箱内数量是否无误，盖章则确认无误。
        </p>

        <div
          style="margin:0;padding:0;width:100%;display:flex;justify-content:space-between"
        >
          <p style="margin:0;padding:0;width:33%">门店退货单号：</p>
          <p style="margin:0;padding:0;width:33%">门店签名盖章：</p>
        </div>
        <div
          style="margin:0;padding:0;width:100%;display:flex;justify-content:space-between"
        >
          <p style="margin:0;padding:0;width:33%">仓库人员签名：</p>
          <p style="margin:0;padding:0;width:33%">日期：</p>
        </div>
        <div
          style="margin:0;padding:0;width:100%;display:flex;justify-content:space-between"
        >
          <p style="margin:0;padding:0;"></p>
          <p style="margin:0;padding:0;width:33%">司机/送货员签名：</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: ["dataCode", "title", "ItemTableHeadData", "rowData", "driver"],
  data() {
    return {
      dataTime: timeCycle(new Date()),
      tableData: [],
      user: JSON.parse(sessionStorage.getItem("user")),
      driverName: ""
    };
  },

  mounted() {
    this.tableData = this.dataCode;
    console.log(this.tableData, "ieiie");
    this.driver.forEach(element => {
      if (element.fJobTypeName == "司机") {
        this.driverName = element.fHrName;
      }
    });
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
