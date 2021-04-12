<template>
  <div>
    <!-- iconfont icon-shuaixuan -->
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng"
        @click="openTable"
        style="margin-bottom:15px"
        >线路分派车辆</el-button
      >
    
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng"
        style="margin-bottom:15px"
        @click="openSceondTable"
        >线路分派人员</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        size="mini"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
        >取消</el-button
      >
    </div>
    <div class="page" style="margin-top:35px">
   
      <div class="flex">
        <p class="label">运输线路体系:</p>
        <el-select
          v-model="routeValue"
          @change="ValChange"
          placeholder="请选择"
        >
          <el-option
            v-for="optionItem in selectOpts"
            :key="optionItem.fID"
            :label="optionItem.fSystemName"
            :value="optionItem.fID"
          ></el-option>
        </el-select>
      </div>

      <div class="flex" style="margin:10px 0 30px">
        <p class="label">预设线路:</p>
        <el-select
          v-model="selValue"
          @change="SelChange(activeName)"
          placeholder="请选择"
        >
          <el-option
            v-for="optionItem in selectOptions"
            :key="optionItem.fID"
            :label="optionItem.fRouteCode"
            :value="optionItem.fID"
          ></el-option>
        </el-select>
      </div>
      <!-- </div> -->
      <!-- <HcTitle content="线路分派车辆"></HcTitle> -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="线路分派车辆" name="first">
          <!-- 表格 -->
          <child-table
            ref="childTable"
            :fTableView="fTableViewHead[0]"
            :tableData="tableData"
          ></child-table>
        </el-tab-pane>
        <el-tab-pane label="线路分派人员" name="second">
          <child-table
            ref="childSecondTable"
            :fTableView="fTableViewGenche[0]"
            :tableData="personnelTableData"
          ></child-table
        ></el-tab-pane>
      </el-tabs>

      <!-- 新增线路分派车辆字表数据 -->
      <el-dialog
        :title="openTitle"
        :visible.sync="dialogFormVisible"
        :append-to-body="true"
        :destroy-on-close="true"
      >
        <alert-table
          @closeBox="closeItemBox"
          :fTableView="'t_Vehcile_Driver'"
        ></alert-table>
      </el-dialog>
      <!-- 线路分派人员 -->
      <el-dialog
        title="线路分派人员"
        :visible.sync="dialogVisible"
        :append-to-body="true"
        :destroy-on-close="true"
      >
        <alert-table
          @closeBox="closeVehcileBox"
          :fTableView="'t_Hr_mst'"
        ></alert-table>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { compare, handelData ,handleVehData} from "@/utils/common";
import {
  collectionData,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
import HcTitle from "@/components/HcTitle";
import ChildTable from "@/components/ChildTable";
import AlertTable from "./AlertTable";
export default {
  props: ["fTableViewHead", "fTableView", "fTableViewGenche"],
  components: {
    HcTitle,
    ChildTable,
    AlertTable
  },
  data() {
    return {
      //下拉框选项的值
      selectOpts: [],
      //预设线路下拉框的值
      selectOptions: [],
      selValue: "",
      userDes: this.$store.state.user.userInfo.userDes,
      routeValue: this.$store.state.common.changeValue,
      //表格列头数据
      tableHead: [],
      tableData: [],
      personnelTableData: [],
      //回显的数据
      backData: [],
      backSecondData: [],
      openTitle: "线路分派车辆",
      dialogFormVisible: false,
      dialogVisible: false,
      activeName: "first"
    };
  },
  methods: {
    async handleClick(tab, event) {
      this.SelChange(this.activeName);
    },
    async submitForm(formName) {
      let fMstID = this.$store.state.common.changeValue;
      if (this.selValue == "") {
        this.$message.warning("请选择预设线路!");
        return;
      }

      if (this.tableData.length != 0) {
        this.tableData.forEach(item => {
          this.$set(item, "fSystemItemID", this.selValue);
        });
      }
      //分派线路数据
      let wantData = handelData(this.backData, this.tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      let deletedArr = wantData[2];
      // console.log(updateArr, insertArr, deletedArr);
      //分派人员数据

      let wantSecondData = handleVehData(
        this.backSecondData,
        this.personnelTableData
      );
      console.log(wantSecondData);
      let updateSArr = wantSecondData[0];
      let insertSArr = wantSecondData[1];
      let deleteSArr = wantSecondData[2];
      let personnelTableHead = this.$refs.childSecondTable.tableHeadData;
     
      console.log(updateSArr, insertSArr, deleteSArr);
      // console.log(this.backSecondData,"回显",this.personnelTableData,"iei")
      let res = await collectionData([
        {
          TableName: "t_Route_VehicleItem",
          updateData: updateArr,
          insertData: insertArr,
          deleteData: deletedArr,
          headData: this.tableHead
        },
        {
          TableName: "t_genche",
          updateData: updateSArr,
          insertData: insertSArr,
          deleteData: deleteSArr,
          headData: personnelTableHead
        }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.$message.success("保存成功!");
        this.$emit("closeBox", res.State);
      } else {
        this.$message.error(res.Message);
      }
    },
    resetForm(formName) {
      this.$emit("closeBox");
    },
    openTable() {
      console.log(this.routeValue, this.selValue);
      if (this.routeValue == "" || this.selValue == "") {
        this.$message.warning("请先选择线路信息!");
      } else {
        this.dialogFormVisible = true;
        this.activeName = "first";
      }
    },
    //线路分派人员
    openSceondTable() {
      if (this.routeValue == "" || this.selValue == "") {
        this.$message.warning("请先选择线路信息!");
      } else {
        this.dialogVisible = true;
        this.activeName = "second";
      }
    },
    //主表
    async ValChange() {
      this.$store.commit("common/updateRouteValue", this.routeValue);
      this.selValue = "";
      let where = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: this.$store.state.common.changeValue
        }
      ];
      this.selectOptions = await this.getTableData(
        "v_Route_System_Item",
        where
      );
    },
    //从表
    async SelChange(activeName) {
      console.log(activeName);
      let DataFile, tableView;
      if (activeName == "first") {
        DataFile = "fSystemItemID";
        tableView = "v_Route_VehicleItem";
      } else if (activeName == "second") {
        DataFile = "fMstID";
        tableView = "v_genche";
      }
      //获取回显的数据
      let where = [
        {
          Computer: "=",
          DataFile: DataFile,
          Value: this.selValue
        }
      ];
      let result = await this.getTableData(tableView, where);
      if (tableView == "v_Route_VehicleItem") {
        this.backData = JSON.parse(JSON.stringify(result));
        this.tableData = result;
      } else if (tableView == "v_genche") {
        this.backSecondData = JSON.parse(JSON.stringify(result));
        this.personnelTableData = result;
      }
      console.log(result, "回显的数据");
    },
    //主表数据
    async getMstData(searchWhere = []) {
      let res = await getTableBodyData("v_Route_System_Mst", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.selectOpts = JSON.parse(res.Data);
        // console.log(this.selectOpts, "主表数据");
      }
    },

    async getTableData(fTableView, searchWhere) {
      let res = await getTableBodyData(fTableView, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        return result;
      }
    },

    //获取表格的表头
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
        console.log(this.tableHead, "表格表头");
      } else {
        this.$message.error(res.Message);
      }
    },

    //关闭子表新增弹窗
    closeItemBox(value) {
      if (value) {
        // console.log(value, "value");
        value.forEach((item, index) => {
          this.$set(item, "fVehicleID", item.fID);
          this.$set(item, "fSort", this.tableData.length + index + 1);
        });

        this.tableData = [...this.tableData, ...value];
      }
      this.dialogFormVisible = false;
    },
    //关闭车辆分派人员弹窗
    closeVehcileBox(value) {
      console.log(this.routeValue, this.selValue, "333");
      if (value) {
        console.log(value, "value");
        value.forEach((item, index) => {
          this.$set(item, "fHrID", item.fID);
          this.$set(item, "fMstID", this.selValue);
          // this.$set(item, "fSort", this.tableData.length + index + 1);
        });

        this.personnelTableData = [...this.personnelTableData, ...value];
      }
      this.dialogVisible = false;
    }
  },
  async created() {
    this.getMstData();
    this.getTableHead();
    let where = [
      {
        Computer: "=",
        DataFile: "fMstID",
        Value: this.$store.state.common.changeValue
      }
    ];
    this.selectOptions = await this.getTableData("v_Route_System_Item", where);
  }
};
</script>
<style lang="scss" scoped>
.label {
  min-width: 88px;
}
.el-select {
  width: 300px;
}
</style>
