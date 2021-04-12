<template>
  <div>
    <div class="page flex-wrap" style="margin-bottom:0">
      <div style="margin-right:20px">
        <span>供应商：</span>
        <el-input
          style="display:inline-block;width:200px"
          v-model.trim="supplierCode"
          placeholder="请输入供应商代号"
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
        <el-button
          type="primary"
          size="mini"
          class="el-icon-upload2"
          @click="openDrawer"
        >代销数据更新到海信接口</el-button>
        <el-button type="primary" size="mini" class="el-icon-delete" @click="clearData">清除已上传数据</el-button>
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
        <el-button
          type="primary"
          size="mini"
          class="el-icon-document-checked"
          @click="reconCiliation"
          :disabled="userLimit('fApp')"
        >核对</el-button>
        <el-button
          type="primary"
          size="mini"
          class="el-icon-back"
          @click="rebackCiliation"
          :disabled="userLimit('fApp')"
        >撤回</el-button>
        <download-excel
          :data="tableData"
          :fields="exportDataHead"
          type="csv"
          worksheet="My Worksheet"
          :name="selectValue+'代销对账数据.xls'"
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
            <el-checkbox v-else-if="item.fColumn == 'FSTATE'" :value="scope.row[item.fColumn] == 2"></el-checkbox>
            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click.stop="handleClick(scope.row,scope.$index)"
              :disabled="scope.row.FSEL==1||userLimit('fApp')"
            >核对</el-button>
            <!-- <el-button
              type="text"
              size="small"
              @click.stop="deleteClick(scope.row,scope.$index)"
              :disabled="scope.row.FSEL==0"
            >删除</el-button>-->
          </div>
        </template>
      </el-table-column>
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

        <span>未结算金额：{{aQty}}</span>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 50, 100, 400]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
    <!-- 弹出框输入合同号 发送数据到海信系统-->
    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <div>
        <span>合同号：</span>
        <el-input
          style="width:35%"
          v-model="sendHetong"
          @keyup.enter.native="sendDataToHaixin"
          readonly
          placeholder="请输入合同号"
        ></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendDataToHaixin">确 定</el-button>
      </span>
    </el-dialog>
    <div style="width:0;height:0;overflow:hidden">
      <print-table
        ref="print"
        id="toPrint"
        v-if="isRender"
        :dataCode="tableData"
        :printHeadData="printHeadData"
        :title="selectValue+''+title"
      ></print-table>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import {
  getCntContractHTCode,
  getCntContractHTData,
  saveCntContractHTData,
  get_Daixiaoduizhang_zxyt,
  send_DaixiaoDataTohaixin_zxyt,
  change_JinxiaoView_zxyt,
  clear_DaixiaoDataTohaixin_zxyt
} from "@/api/distributor";
import PrintJS from "print-js";
import PrintTable from "../printTable/PrintTable";
export default {
  components: {
    PrintTable
  },
  data() {
    return {
      getRowKeys(row) {
        return row.YWBILLNO;
      },
      isRender: false,
      title: "代销数据",
      selectValue: "", //合同号
      tableHeadData: [
        { fColumn: "FSEL", fColumnDes: "是否已提交" },
        { fColumn: "FSTATE", fColumnDes: "是否已核对" },
        { fColumn: "YWBILLNO", fColumnDes: "入库单号" },
        { fColumn: "WFSTOTAL", fColumnDes: "未含税金额" },
        { fColumn: "HFSTOTAL", fColumnDes: "含税金额" },
        { fColumn: "FQTY", fColumnDes: "未结算金额" },
        { fColumn: "REMARK", fColumnDes: "备注" }
      ], //表头数据
      printHeadData: [],
      exportDataHead: {
        是否已提交: "FSEL",
        是否已核对: "FSTATE",
        入库单号: "YWBILLNO",
        未含税金额: "WFSTOTAL",
        含税金额: "HFSTOTAL",
        未结算金额: "FQTY",
        备注: "REMARK"
      },
      BatchList: [], //批量
      tableData: [], //表格数据
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
      // 供应商代号
      supplierCode: "",
      // 发送的合同号
      sendHetong: "",
      dialogVisible: false,
      // 判断清除数据还是发送数据
      dataState: 1 //1是发送数据，2是清除数据
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
    },
    aQty() {
      let total = this.BatchList;
      let jine = 0;
      total.forEach(ele => {
        jine += ele.FQTY;
      });
      return jine.toFixed(2);
    }
  },
  methods: {
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
      let res = await get_Daixiaoduizhang_zxyt(this.supplierCode, val);
      loading.close();
      // console.log(res, "数据");
      if (res.message && !res.state) {
        return this.$message.warning(res.message);
      }
      res = JSON.parse(decryptDesCbc(res, String(this.user.userDes)));
      //   console.log(res, "数据");
      loading.close();
      if (!res.State) {
        return this.$message.warning(res.Message);
      }
      if (res.Data == "[]") {
        return this.$message.warning("当前合同号没有数据！");
      }
      console.log(JSON.parse(res.Data));
      // this.tableData = JSON.parse(res.Data).filter(item => {
      //   return item.FSTATE == null || item.FSTATE == 0;
      // });
      // console.log(this.tableData);
      this.tableData = JSON.parse(res.Data);
      this.tableData.forEach(ele => {
        if (ele.FSEL == 1) {
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
      this.BatchList = [];
      this.getProductList(this.selectValue);
    },
    // 核对保存
    async reconCiliation() {
      console.log("核对保存");
      console.log(this.BatchList);
      if (this.BatchList.length == 0) {
        return this.$message.warning("请先选择至少一条数据");
      }
      let isCorrent = this.BatchList.every(child => {
        return child.FSEL == 1;
      });
      if (!isCorrent) {
        return this.$message.warning("请选择已提交的数据");
      }
      let isState = this.BatchList.some(child => {
        return child.FSTATE == 2;
      });
      if (isState) {
        return this.$message.warning("请选择未核对的数据");
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
        if (allData[i].FSEL == 1) {
          UpdateData.push({
            fYWBILLNO: allData[i].YWBILLNO,
            fState: 2,
            fType: 2,
            fHeTong: this.selectValue,
            fCreater: this.user.usercode,
            fWFSTOTAL: allData[i].WFSTOTAL,
            fHFSTOTAL: allData[i].HFSTOTAL,
            fQty: allData[i].FQTY,
            fCaiwuDate: timeCycle(new Date()),
            fCaiwuer: this.user.usercode
          });
        }
        if (allData[i].FSEL == 0) {
          InsertData.push({
            fYWBILLNO: allData[i].YWBILLNO,
            fState: 2,
            fType: 2,
            fHeTong: this.selectValue,
            fCreater: this.user.usercode,
            fWFSTOTAL: allData[i].WFSTOTAL,
            fHFSTOTAL: allData[i].HFSTOTAL,
            fQty: allData[i].FQTY,
            fCaiwuDate: timeCycle(new Date()),
            fCaiwuer: this.user.usercode
          });
        }
      }
      console.log(InsertData, UpdateData);
      // return
      let res = await saveCntContractHTData(
        InsertData.length > 0 ? InsertData : null,
        UpdateData.length > 0 ? UpdateData : null
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      loading.close();
      console.log(res);
      if (!res.State) {
        return this.$message.error(res.Message);
      } else {
        this.search();
        this.BatchList = [];
        this.tableData = [];
        return this.$message.success("核对成功");
      }
    },
    // 撤回
    rebackCiliation() {
      console.log("退回保存");
      console.log(this.BatchList);
      if (this.BatchList.length == 0) {
        return this.$message.warning("请先选择至少一条数据");
      }
       let trueSelect = this.BatchList.every(child => {
        return child.FSTATE == 1 || child.FSTATE == 2;
      });
      console.log(trueSelect, "1");
      if (!trueSelect) {
        return this.$message.warning("请选择已提交或已核对的数据");
      }
      this.$confirm("确定进行撤回操作吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
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
            if (allData[i].FSEL == 1) {
              UpdateData.push({
                fYWBILLNO: allData[i].YWBILLNO,
                fState: 0,
                fType: 2,
                fHeTong: this.selectValue,
                fCreater: this.user.usercode
              });
            }
          }
          console.log(InsertData, UpdateData);
          let res = await saveCntContractHTData(
            InsertData.length > 0 ? InsertData : null,
            UpdateData.length > 0 ? UpdateData : null
          );
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          loading.close();
          console.log(res);
          if (!res.State) {
            return this.$message.error(res.Message);
          } else {
            this.search();
            this.BatchList = [];
            this.tableData = [];
            return this.$message.success("退回成功");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
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
      // if (row.FSEL == 1) {
        return true;
      // } else {
      //   false;
      // }
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    // 单击核对
    async handleClick(row, index) {
      console.log(row, index);
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let InsertData = [
        {
          fYWBILLNO: row.YWBILLNO,
          fState: 2,
          fType: 2,
          fHeTong: this.selectValue,
          fCreater: this.user.usercode
        }
      ];
      let res = await saveCntContractHTData(null, InsertData);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      loading.close();
      if (!res.State) {
        return this.$message.error(res.Message);
      }
      this.search();
      this.BatchList = [];
      return this.$message.success("核对成功");
    },
    async getHetonghao() {
      if (this.supplierCode == "") {
        return this.$message.error("请输入供应商代号");
      }
      this.selectValue = "";
      this.outBoundOption = [];
      this.tableData = [];
      this.BatchList = [];
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      // let user = JSON.parse(sessionStorage.getItem("user")).usercode;
      let user = this.supplierCode;
      let res = await getCntContractHTCode(user + "");
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      res = JSON.parse(decryptDesCbc(res, String(userDes)));
      loading.close();
      if (!res.State) {
        return this.$message.warning(res.Message);
      }
      console.log(res);
      if (res.Data == "[]") {
        return this.$message.warning("当前供应商没有合同数据");
      }
      this.outBoundOption = JSON.parse(res.Data);
      this.selectValue = this.outBoundOption[0].HTCODE;
    },
    openDrawer() {
      this.dialogVisible = true;
      this.dataState = 1;
      this.sendHetong = this.selectValue;
    },
    async sendDataToHaixin() {
      if (this.sendHetong == "") {
        return this.$message.warning("请输入合同号");
      }
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let res;
      if (this.dataState == 1) {
        let saveCaiwu = await get_Daixiaoduizhang_zxyt(
          this.supplierCode,
          this.selectValue
        );
        if (saveCaiwu.message && !saveCaiwu.state) {
          return this.$message.warning(saveCaiwu.message);
        }
        saveCaiwu = JSON.parse(
          decryptDesCbc(saveCaiwu, String(this.user.userDes))
        );
        if (!saveCaiwu.State) {
          return this.$message.warning(saveCaiwu.Message);
        }
        console.log(saveCaiwu);
        if (saveCaiwu.Data == "[]") {
          return this.$message.warning("当前合同号没有数据！");
        }
        let copyD = JSON.parse(saveCaiwu.Data);
        let ciData = [],
          cuData = [];
        for (let i = 0, l = copyD.length; i < l; i++) {
          cuData.push({
            fYWBILLNO: copyD[i].YWBILLNO,
            fHeTong: this.selectValue,
            fShangchuanDate: timeCycle(new Date()),
            fShangchuaner: this.user.usercode
          });
        }
        let cRes = await saveCntContractHTData(null, cuData);
        cRes = JSON.parse(decryptDesCbc(cRes, String(this.userDes)));
        if (!cRes.State) {
          return this.$message.error(cRes.Message);
        }
        res = await send_DaixiaoDataTohaixin_zxyt(this.selectValue);
      } else if (this.dataState == 2) {
        res = await clear_DaixiaoDataTohaixin_zxyt(this.selectValue);
      }
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      console.log(res);
      loading.close();
      if (!res.state) {
        return this.$message.warning(res.message);
      }
      if (this.dataState == 1) {
      }
      this.dialogVisible = false;
      if (this.dataState == 1) {
        this.$message.success("更新成功");
      } else if (this.dataState == 2) {
        this.$message.success("清除成功");
      }
    },
    clearData() {
      this.dialogVisible = true;
      this.dataState = 2;
      this.sendHetong = this.selectValue;
    },
    handleClose(done) {
      done();
    },
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
        } else if (ele.fColumn == "FQTY") {
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
    }
  }
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
