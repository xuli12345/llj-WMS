<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        :disabled="this.tableData.length > 3 ? true : false"
        >新增</el-button
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

    <HeadForm
      :tableHead="tableHead"
      ref="formBox"
      :selectArr="selectArr"
    ></HeadForm>
    <HcTitle content="库位模板编码生成规则"></HcTitle>
    <el-table
    :header-cell-style="{ background: '#eef1f6'}"
     v-fit-columns
      class="table-wrapper"
      ref="singleTable"
       :max-height="tableHeight"
      border
      style="width: 100%"
      :data="tableData"
    >
    <!-- :filters="screenFuction(item.fColumn)"
          :filter-method="filtersF" -->
      <el-table-column type="index" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
          
        ></el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click.stop="handleDelete(scope.row, scope.$index)"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增侧滑框 -->
    <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_CodeRules_Template_Item'"
      ></CreatFrom>
    </el-drawer>
  </div>
</template>

<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData, getTableHeadData } from "@/api/index";
import { compare } from "@/utils/common";
import HeadForm from "@/components/HeadForm";
import HcTitle from "@/components/HcTitle";
import CreatFrom from "./CreatFrom";
export default {
  components: {
    CreatFrom,
    HeadForm,
    HcTitle
  },
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    tableName: {
      type: String,
      default: () => ""
    },
    selectArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
       tableHeight:document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      fTableView: "t_CodeRules_Template_Item",
      tableHeadData: [],
      BatchList: [],
      tableData: [],
      drawer: false,
      //修改侧滑显示隐藏
      drawerValue: false,
      //控制侧滑框的方向
      direction: "rtl",
      editForm: {},
      fID: "",
      //批量删除选中索引值
      batchIndex: []
    };
  },
  methods: {
    submitForm(formName) {
      let ruleFormData = this.$refs.formBox.ruleForm;
      this.$refs.formBox.$refs.ruleForm.validate(async valid => {
        if (valid) {
          // //权限表
          let res = await collectionData(
            //insert新建，update修改，delete删除
            [
              //主表
              {
                TableName: "t_Storage_Template_Mst",
                IdentityColumn: "fID",
                insertData: [ruleFormData],
                headData: this.tableHead
              },
              {
                TableName: "t_CodeRules_Template_Item",
                IdentityColumn: "fMstID",
                insertData: this.tableData,
                headData: this.tableHeadData
              }
            ]
          );
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.State);
            this.$refs.formBox.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs.formBox.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //删除
    handleDelete(row, index) {
      this.tableData.splice(index, 1);
    },

    //表格筛选
    filtersF(val, row, column) {
      const property = column["property"];
      return row[property] === val;
    },
    //筛选的条件数组
    screenFuction(val) {
      let copyTable = this.tableData;
      var screenData = [];
      copyTable.forEach((item, idx) => {
        let obj = {
          text: item[val],
          value: item[val]
        };
        screenData.push(JSON.stringify(obj));
      });
      let screenArr = Array.from(new Set(screenData));
      var newData = screenArr.map(function(item) {
        return JSON.parse(item);
      });
      return newData;
    },

    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "表头");
      } else {
        this.$message.error(res.Message);
      }
    },

    //双击表格弹框
    dblclick(row) {
      this.resetForm = JSON.parse(JSON.stringify(row));
      this.drawer = true;
    },

    addPopRight() {
      this.drawer = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.tableData.push(value);
        this.tableData.forEach((item, index) => {
          this.$set(item, "fSort", index + 1);
        });
      }
      this.drawer = false;
    }
  },
  created() {
    this.getTableHeadData();
  }
};
</script>
<style lang="scss" scoped></style>
