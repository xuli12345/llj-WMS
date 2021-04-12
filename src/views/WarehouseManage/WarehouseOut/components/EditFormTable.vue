<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        class="el-icon-bottom"
        @click="downloadTemp"
        :disabled="isDisabled"
        size="mini"
      >下载模板</el-button>
      <el-upload
        style="margin-right:5px;float:left"
        ref="upload"
        class="upload"
        action
        :on-change="handleChange"
        :on-remove="handleRemove"
        :auto-upload="false"
        :show-file-list="false"
        accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      >
        <el-button
          type="primary"
          :disabled="isDisabled"
          class="iconfont icon-excel"
          size="mini"
        >导入excel</el-button>
      </el-upload>
      <el-button
        v-if="addItem"
        :disabled="isDisabled"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
      >新增</el-button>
      <!-- ||(rowData.fMstState==8? isCreate:isDisabled)  -->
      <el-button
        v-if="addItem"
        :disabled="isSuss"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="creatPopRight"
      >生成补货单</el-button>

      <el-button
        :disabled="isDisabled"
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
      >保存</el-button>
      <el-button
        type="primary"
        class="el-icon-s-opportunity"
        @click="editStock()"
        size="mini"
      >调整实出数量</el-button>
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()">取消</el-button>
    </div>
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fID"
      :changeData="changeData"
      :isDisabled="isDisabled"
      :rowData="rowData"
    ></child-table>
    <!-- 新增字表数据 -->
    <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="addItem"
    >
      <child-form-head
        @closeBox="closeItemBox"
        :fTableViewHead="fTableViewItem[0]"
        ref="ItemRuleForm"
        :addItem="addItem"
        :selectArr="selectArr2"
      ></child-form-head>
    </el-drawer>
    <!-- 生成补货单 -->

    <el-dialog
      :append-to-body="true"
      title="补货单"
      :visible.sync="dialogForm"
      class="dialog"
      width="30%"
    >
      <span>拣货单ID</span>
      <el-input v-model="inputValue"></el-input>
      <div>
        <span>补货途径</span>
        <el-select v-model="value" placeholder="补货途径" style="width:200px;margin-top:10px">
          <el-option
            v-for="item in options"
            :key="item.fID"
            :label="item.fTypeName"
            :value="item.fID"
          ></el-option>
        </el-select>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button class="iconfont icon-quxiao" size="mini" @click="dialogForm = false">取 消</el-button>
        <el-button type="primary" class="iconfont icon-baocun" size="mini" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare, handelData, batchDelete } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import {
  collectionData,
  imPortExcel,
  savePickingList,
  getTableBodyData,
  saveOutStockData
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "../../component/EditChildFormHead";
import ChildTable from "../../component/EditChildTable";

export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "rowData",
    "changeData",
    "strType"
  ],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      inputValue: "",
      value: "",
      options: [],
      dialogForm: false,
      drawer: false,
      //表格添加的数据
      insertData: {},
      isDisabled: false,
      isSuss: false,
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      userId: this.$store.state.user.userInfo.userId,
      isCreate: true
    };
  },
  methods: {
    async editStock() {
      this.saveStock();
    },

    //扣减库存
    async saveStock() {
      let childHeadData = this.$refs.childTable.tableHeadData; //从表表头数据
      let childTableData = this.$refs.childTable.tableData; //从表表头数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      console.log(childTableData, backData);
      childTableData.forEach(item => {
        console.log(item.fReviewNum);
        backData.forEach(val => {
          if (
            item.fRealOutboundNum != val.fRealOutboundNum &&
            item.fID == val.fID
          ) {
            console.log(
              item.fRealOutboundNum != val.fRealOutboundNum &&
                item.fID == val.fID
            );
            this.$set(
              item,
              "fReviewNum",
              item.fRealOutboundNum - val.fRealOutboundNum
            );
          }
        });
      });
      let result = batchDelete(childHeadData, childTableData);
      let res = await saveOutStockData([
        {
          lstSaveData: [
            {
              TableName: "t_OutboundOrder_Item",
              IdentityColumn: null,
              InsertRow: null,
              UpdateRow: result.arr,
              DeleteRow: null,
              Columns: result.columns
            }
          ]
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res, "减除库存");
      if (res.State) {
        this.submitForm();
        this.$emit("closeBox");
      } else {
        this.$message.error(res.Message);
      }
    },
    //保存
    submitForm() {
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      let wantData = handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      let deletedArr = wantData[2];
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: formHeadData
            },
            {
              TableName: this.fTableViewItem[0],
              updateData: updateArr,
              insertData: insertArr,
              deleteData: deletedArr,
              headData: childTableData
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("修改成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.message);
          }
        }
      });
    },
    //取消
    resetForm() {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //新增按钮
    addPopRight() {
      this.drawer = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    async closeItemBox(value) {
      if (value) {
        let where = [
          {
            Computer: "=",
            DataFile: "fID",
            Value: value.fProductID
          }
        ];
        let res = await getTableBodyData("v_Product", where);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

        if (res.State) {
          let data = JSON.parse(res.Data);
          data.forEach(element => {
            this.$set(value, "fProductCode", element.fProductCode);
            this.$set(value, "fProductName", element.fProductName);
          });
          this.insertData = value;
        }
      }
      this.drawer = false;
    },
    //获取补货途径下拉框数据
    async getRplwayData() {
      let res = await getTableBodyData("v_Type_PGRplWay");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.options = JSON.parse(res.Data);
      }
    },
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Outbound")) {
        window.location.href = `${tempUrl}/ImportTempModFile/出库单导入模板.xlsx`;
      }
    },
    // excel导入
    handleChange(file, fileList) {
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        if (
          this.fileTemp.type ==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          this.fileTemp.type == "application/vnd.ms-excel"
        ) {
          this.importFile(this.strType, this.fileTemp);
        } else {
          this.$message({
            type: "warning",
            message: "附件格式错误，请删除后重新上传！"
          });
        }
      } else {
        this.$message({
          type: "warning",
          message: "请上传附件！"
        });
      }
    },

    handleRemove(file, fileList) {
      this.fileTemp = null;
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });

      if (res.state) {
        this.$message.success("导入成功!");
        let tableData = JSON.parse(res.resultString);
        tableData.forEach(element => {
          this.$set(element, "fMstID", this.rowData.fID);
        });

        this.insertData = [...tableData, ...this.insertData];
      } else {
        this.$message.error(res.message);
      }
    },
    creatPopRight() {
      this.dialogForm = true;
      this.getRplwayData();
    },
    async save() {
      let res = await savePickingList([
        {
          fID: this.inputValue,
          RplwayID: this.value
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.$message.success("生成补货单成功!");
        this.isSuss = true;
        let headData = [
          {
            fColumn: "fID",
            fColumnDes: "ID",
            fDataType: "int"
          },
          {
            fColumn: "fMstState",
            fColumnDes: "主表状态",
            fDataType: "int"
          }
        ];
        let obj = JSON.parse(JSON.stringify(this.rowData));
        obj.fMstState = 7;
        let res1 = await collectionData([
          {
            TableName: "t_OutboundOrder_Mst",
            headData: this.$refs.childTable.tableHeadData,
            updateData: [obj]
          }
        ]);
        res1 = JSON.parse(decryptDesCbc(res1, String(this.userDes)));
        if (res1) {
          this.dialogForm = false;
        } else {
          this.$message.warning(res.Message);
        }
      } else {
        this.$message.warning(res.Message);
      }
    }
  },

  async created() {
    this.inputValue = this.rowData.fID;
    if (this.rowData.fMstState && this.rowData.fMstState != 1) {
      this.isDisabled = true;
    }
    // console.log(this.rowData)
    // let res = await getTableBodyData("v_PGRpl_Mst", [
    //   {
    //     Computer: "=",
    //     DataFile: "fOutBoundOrderNo",
    //     Value: this.rowData.fOutboundOrderNo
    //   }
    // ]);
    // res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
    // console.log(res)
    // if (res.State) {
    //   if (res.Data == "[]") {
    //     this.isCreate = false;
    //   }
    // }
  }
};
</script>

<style lang="scss" scoped>
.dialog .el-input {
  width: 200px;
}
</style>
