<template>
  <div>
    <div class="page flex-wrap" style="margin-bottom:0">
      <div style="margin-right:20px">
        <span>时间：</span>
        <el-date-picker
          style="width:250px !important;"
          v-model="dateValue"
          type="date"
          placeholder="选择日期时间"
        ></el-date-picker>
        <span>供应商：</span>
        <el-input
          style="display:inline-block;width:200px"
          v-model.trim="supplierCode"
          placeholder="请输入商家代号"
          @keyup.enter.native="getHetonghao"
        ></el-input>
        <span>合同号：</span>
        <el-select
          style="width:250px"
          filterable
          v-model="selectValue"
          @change="getProductList"
          placeholder="请选择"
        >
          <el-option
            v-for="item in outBoundOption"
            :key="item.HTCODE"
            :label="item.HTCODE"
            :value="item.HTCODE"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          size="mini"
          class="el-icon-search"
          :disabled="userLimit('fQurey')"
          @click="getHetonghao"
        >获取合同号</el-button>
      </div>
    </div>
    <div class="flex-wrap" style="margin-left:10px">
      <div style="margin-top: 10px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          :disabled="userLimit('fQurey')"
          @click="search"
        >查询</el-button>
        <download-excel
          :data="tableData"
          :fields="exportDataHead"
          type="csv"
          worksheet="My Worksheet"
          name="历史数据.xls"
          style="display:inline-block;"
        >
          <el-button
            type="primary"
            class="el-icon-download"
            size="mini"
            :disabled="userLimit('fExport')"
          >导出</el-button>
        </download-excel>
        <!-- </el-button> -->
        <el-button
          type="primary"
          size="mini"
          class="el-icon-printer"
          @click="printData"
          :disabled="userLimit('fExport')"
        >打印</el-button>
      </div>
    </div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%;margin-top:5px"
      :row-key="getRowKeys"
      :data="tableData| pagination(pageNum, pageSize)"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="50"
        :selectable="selectable"
        :reserve-selection="true"
      ></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
          :column-key="item.fColumn"
        >
          <template slot-scope="scope">
            <el-checkbox v-if="item.fColumn == 'FSEL'" :value="scope.row[item.fColumn] == 1"></el-checkbox>
            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="page flex-justify-end">
      <div class="total-style">
        <span>未含税金额：{{weiTotal}}</span>
        <span>含税金额：{{oTotal}}</span>
        <span>差额：{{diff}}</span>

        <span>退回未含税金额：{{tweiTotal}}</span>
        <span>退回含税金额：{{toTotal}}</span>
        <span>退回差额：{{tDiff}}</span>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[5,10, 50, 100, 400]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
    <div style="width:0;height:0;overflow:hidden">
      <print-table
        ref="print"
        id="toPrint"
        v-if="isRender"
        :dataCode="tableData"
        :printHeadData="printHeadData"
        :title="title"
      ></print-table>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import PrintJS from "print-js";
import PrintTable from "../printTable/PrintTable";

import {
  getCntContractHTCode,
  getCntContractHTData,
  saveCntContractHTData,
  getCntContractHTData_History
} from "@/api/distributor";
export default {
  components: {
    PrintTable
  },
  data() {
    return {
      isRender: false,
      title: "商家经销对账",
      getRowKeys(row) {
        return row.YWBILLNO;
      },
      supplierCode: "",
      dateValue: null, //时间
      selectValue: "", //合同号
      tableHeadData: [
        { fColumn: "FSEL", fColumnDes: "是否已提交" },
        { fColumn: "YWBILLNO", fColumnDes: "入库单号" },
        { fColumn: "WFSTOTAL", fColumnDes: "未含税金额" },
        { fColumn: "HFSTOTAL", fColumnDes: "含税金额" }
      ], //表头数据
      printHeadData: [],
      exportDataHead: {
        是否已提交: "FSEL",
        入库单号: "YWBILLNO",
        未含税金额: "WFSTOTAL",
        含税金额: "HFSTOTAL"
      },
      BatchList: [], //批量
      tableData: [], //表格数据
      // FSTATE=1已提交，FSTATE=2已核对
      outBoundOption: [],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      user: this.$store.state.user.userInfo,
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      // total: 0,
      dialogVisible: false
    };
  },
  computed: {
    total() {
      let total = this.tableData.length;
      return total;
    },
    weiTotal() {
      let total = this.BatchList;
      let jine = 0;
      total.forEach(ele => {
        if (ele.WFSTOTAL > 0) {
          jine += parseFloat(ele.WFSTOTAL);
        }
      });
      return jine.toFixed(2);
    },
    oTotal() {
      let total = this.BatchList;
      let jine = 0;
      total.forEach(ele => {
        if (ele.HFSTOTAL > 0) {
          jine += parseFloat(ele.HFSTOTAL);
        }
      });
      return jine.toFixed(2);
    },
    tweiTotal() {
      let total = this.BatchList;
      let jine = 0;
      total.forEach(ele => {
        if (ele.WFSTOTAL < 0) {
          jine += parseFloat(ele.WFSTOTAL);
        }
      });
      return jine.toFixed(2);
    },
    toTotal() {
      let total = this.BatchList;
      let jine = 0;
      total.forEach(ele => {
        if (ele.HFSTOTAL < 0) {
          jine += parseFloat(ele.HFSTOTAL);
        }
      });
      return jine.toFixed(2);
    },
    diff() {
      return (this.oTotal - this.weiTotal).toFixed(2);
    },
    tDiff() {
      return (this.toTotal - this.tweiTotal).toFixed(2);
    }
  },
  methods: {
    printData() {
      // console.log("打印");
      this.isRender = true;
      const style =
        "table td,th,tr {border: 1px #000 solid;font-size: 22px; text-align: center;page-break-inside:avoid}; ";
      let copyData = JSON.parse(JSON.stringify(this.tableHeadData));
      copyData.forEach(ele => {
        if (ele.fColumn == "FSEL") {
          ele.width = 150;
        } else if (ele.fColumn == "YWBILLNO") {
          ele.width = 300;
        } else if (ele.fColumn == "WFSTOTAL") {
          ele.width = 150;
        } else if (ele.fColumn == "HFSTOTAL") {
          ele.width = 150;
        } else {
          ele.width = 130;
        }
      });
      this.printHeadData = copyData;
      setTimeout(() => {
        PrintJS({
          printable: "toPrint",
          type: "html",
          scanStyles: false,
          style,
          css: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
        });
      }, 300);

      setTimeout(() => {
        this.isRender = false;
      }, 400);
    },
    userLimit(v) {
      return userLimit(v);
    },
    //根据合同号获取数据
    async getProductList(val) {
      // console.log(val, this.OutboundOrderNo, this.selectValue);
      // console.log(this.user.usercode);
      // if(userLimit('fQurey')){
      //   return this.$message.error('没有权限')
      // }
      this.$refs.singleTable.clearSelection();
      this.tableData = [];
      this.BatchList = [];
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let res = await getCntContractHTData_History(
        val,
        this.dateValue ? timeCycle(this.dateValue) : ""
      );
      loading.close();
      //   console.log(res);
      if (res.message && !res.state) {
        return this.$message.warning(res.message);
      }
      res = JSON.parse(decryptDesCbc(res, String(this.user.userDes)));
      //   console.log(res, "数据");
      if (!res.State) {
        return this.$message.warning(res.Message);
      }
      if (res.Data == "[]" || res.Data == null) {
        this.tableData = [];
        return this.$message.warning("当前没有可查看的数据！");
      }
      // let data = JSON.parse(res.Data);
      this.tableData = JSON.parse(res.Data).filter(item => {
        return item.FSEL == 0 || item.FSTATE == null || item.FSTATE == 0;
      });
      //   console.log(this.tableData);
      this.tableData.forEach(ele => {
        if (ele.FSEL == 0 || ele.HFSTOTAL < 0 || ele.WFSTOTAL < 0) {
          this.$refs.singleTable.toggleRowSelection(ele, true);
        }
      });
    },

    //查询
    search() {
      // 查询合同数据
      if (this.selectValue == "") {
        return this.$message.error("请选择合同号");
      }
      this.getProductList(this.selectValue);
    },
    // 对账保存
    async reconCiliation() {
      console.log("对账保存");
      console.log(this.BatchList);
      if (this.BatchList.length == 0) {
        return this.$message.warning("请先选择至少一条数据");
      }
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let InsertData = [],
        UpdateData = [];
      let allData = JSON.parse(JSON.stringify(this.BatchList));
      let aLength = allData.length;
      for (let i = 0; i < aLength; i++) {
        if (allData[i].FSEL == 0 && allData[i].FSTATE == 0) {
          // UpdateData.push({
          //   fYWBILLNO: allData[i].YWBILLNO,
          //   fState: 1,
          //   fType: 1,
          //   fHeTong: this.selectValue,
          //   fCreater: this.user.usercode
          // });
          UpdateData.push({
            fYWBILLNO: allData[i].YWBILLNO,
            fState: 1,
            fType: 1,
            fHeTong: this.selectValue,
            fCreater: this.user.usercode,
            fSupplyDate: timeCycle(new Date()),
            fSupplyer: this.user.usercode,
            fWFSTOTAL: allData[i].WFSTOTAL,
            fHFSTOTAL: allData[i].HFSTOTAL,
            fSupplyCode: this.user.usercode
          });
        }
        if (allData[i].FSEL == 0 && allData[i].FSTATE !== 0) {
          // InsertData.push({
          //   fYWBILLNO: allData[i].YWBILLNO,
          //   fState: 1,
          //   fType: 1,
          //   fHeTong: this.selectValue,
          //   fCreater: this.user.usercode
          // });
          InsertData.push({
            fYWBILLNO: allData[i].YWBILLNO,
            fState: 1,
            fType: 1,
            fHeTong: this.selectValue,
            fCreater: this.user.usercode,
            fSupplyDate: timeCycle(new Date()),
            fSupplyer: this.user.usercode,
            fWFSTOTAL: allData[i].WFSTOTAL,
            fHFSTOTAL: allData[i].HFSTOTAL,
            fSupplyCode: this.user.usercode
          });
        }
      }
      console.log(InsertData, UpdateData);
      // return
      let res = await saveCntContractHTData(
        InsertData.length > 0 ? InsertData : null,
        UpdateData.length > 0 ? UpdateData : null
      );
      loading.close();
      console.log(res);
      if (res.message && !res.state) {
        return this.$message.warning(res.message);
      }
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res);
      if (!res.State) {
        return this.$message.error(res.Message);
      } else {
        this.BatchList = [];
        this.$message.success("对账成功");
        this.search();
        return;
      }
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },
    //重置
    reset() {
      this.selectValue = "";
    },
    // 复选框禁用
    selectable(row, index) {
      // console.log(row,index)
      if (row.FSEL === 1 || row.HFSTOTAL < 0 || row.WFSTOTAL < 0) {
        return false;
      } else {
        return true;
      }
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    // 单击对账
    async handleClick(row, index) {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      console.log(row, index);
      let InsertData = [
        {
          fYWBILLNO: row.YWBILLNO,
          fState: 1,
          fType: 1,
          fHeTong: this.selectValue,
          fCreater: this.user.usercode
        }
      ];
      let res = await saveCntContractHTData(InsertData);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      loading.close();
      if (!res.State) {
        return this.$message.error(res.Message);
      }
      this.search();
      return this.$message.success("对账成功");
    },
    async getHetonghao() {
      if (this.userLimit("fQurey")) {
        return false;
      }
      if (this.supplierCode == "") {
        return this.$message.warning("请输入商家代号");
      }
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let res = await getCntContractHTCode(this.supplierCode);
      loading.close();
      if (res.message && !res.state) {
        return this.$message.warning(res.message);
      }
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      console.log(res);
      res = JSON.parse(decryptDesCbc(res, String(userDes)));
      console.log(res);
      if (!res.State) {
        return this.$message.warning(res.Message);
      }
      if (res.Data == "[]") {
        return this.$message.warning("当前用户没有合同!");
      }
      this.outBoundOption = JSON.parse(res.Data);
    },
    exportData() {
      var blob = new Blob([this.tableData], {
        type: "application/vnd.ms-excel;charset=utf-8"
      });
      var downloadElement = document.createElement("a");
      var href = window.URL.createObjectURL(blob);
      downloadElement.href = href;
      downloadElement.download = `${this.$route.meta.titlte}-详情.xlsx`;
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);
    }
  },
};
</script>
<style lang="scss" scoped>
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}

.el-form-item {
  width: 50%;
}

/deep/ .el-checkbox__inner {
  width: 20px;
  height: 20px;
}
.total-style {
  position: absolute;
  left: 10px;
  top: 8px;
  span {
    margin-right: 10px;
  }
}
</style>
