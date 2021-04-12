<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        class="el-icon-bottom"
        @click="downloadTemp"
        size="mini"
        >下载模板</el-button
      >
      <el-upload
        style="margin-right:5px;float:left"
        ref="upload"
        class="upload"
        action=""
        :on-change="handleChange"
        :on-remove="handleRemove"
        :auto-upload="false"
        :show-file-list="false"
        accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      >
        <el-button type="primary" class="iconfont icon-excel" size="mini"
          >导入excel</el-button
        >
      </el-upload>
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >{{ strType == "Outbound" ? "货品新增" : "新增" }}</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >保存</el-button
      >
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
        >取消</el-button
      >
    </div>
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :selectArr="selectArr"
      :StateObj="StateObj"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
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
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { collectionData, imPortExcel, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "../../component/ChildFormHead";
import ChildTable from "../../component/ChildTable";
export default {
  //strType:导入文件的类型
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "strType",
    "StateObj"
  ],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      drawer: false,
      //表格数据
      tableData: [],
      //excel
      fileTemp: null,
      file: null,
      fileName: "",
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      let formHeadData = this.$refs.ruleForm.tableHead; //form表头数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      console.log(formData)
      this.tableData.forEach(item => {
        this.$set(item, "fItemState", 2);
      });
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: formHeadData,
              IdentityColumn: this.fTableViewHead[1]
            },
            {
              TableName: this.fTableViewItem[0],
              insertData: this.tableData,
              headData: childTableData,
              IdentityColumn: this.fTableViewItem[1]
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.Message);
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
          this.tableData.unshift(value);
        }
      }
      this.drawer = false;
    },
    // excel导入
    handleChange(file, fileList) {
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        //xlsx
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
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Outbound")) {
        window.location.href = `${tempUrl}/ImportTempModFile/出库单导入模板.xlsx`;
      }
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });

      if (res.state) {
        this.$message.success("导入成功!");
        let tableData = JSON.parse(res.resultString);
        this.tableData = [...tableData, ...this.tableData];
      } else {
        this.$message.error(res.message);
      }
    }
  }
};
</script>
