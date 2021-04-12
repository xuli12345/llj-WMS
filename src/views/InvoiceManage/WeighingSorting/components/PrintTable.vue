<template>
  <div ref="toPrint">
    <div
      v-for="(item, index) in BatchList"
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
      <div
        style="margin-top:0px; margin-left:20px;display: flex;align-items: center;font-size:22px"
      >
        <span style="flex:2">称重单号:{{ item.fChengzhongNo }}</span>
        <span style="flex:1"
          >是否完成:{{ item.fMstIsEnd == 0 ? "否" : "是" }}</span
        >
        <span style="flex:1">员工工号:{{ item.fHrCode }}</span>
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
          <template v-for="(item, index) in tableHeadData">
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
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { compare } from "@/utils/common";
import { getTableHeadData } from "@/api/index";
export default {
  props: ["dataCode", "BatchList"],
  data() {
    return {
      title: ["老邻居配送中心", "商品称重拣货单"],
      dataTime: timeCycle(new Date()),
      tableData: [],
      tableHeadData: [],
      userDes: this.$store.state.user.userInfo.userDes
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
      let TableList = [];
      this.dataCode.forEach(item => {
        if (item.fMstID == v) {
          TableList.push(item);
        }
      });
      console.log(TableList);
      //处理数组对象 排序相同的属性
      TableList.sort((a, b) => {
        if (a["fProductName"] != b["fProductName"]) {
          return a["fProductName"].localeCompare(b["fProductName"]);
        }
      });
      return TableList;
    },
    async getItemHead() {
      let res = await getTableHeadData("t_ChengzhongRenWu_Item");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        this.tableHeadData.forEach(item => {
          if (
            item.fColumn == "fRemark" ||
            item.fColumn == "fItemIsEnd" ||
            item.fColumn == "fImageFile" ||
            item.fColumn == "fChengzhong" ||
            item.fColumn == "fPizhong"
          ) {
            this.$set(item, "fVisible", 0);
          }
        });
      }
    }
  },
  created() {
    this.getItemHead();
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
