<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
      >
        取消</el-button
      >
    </div>
    

    <el-scrollbar style="min-height: 180px;" :native="true">
      <el-form
        label-position="right"
        label-width="125px"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        class="flex-wrap form-margin"
        :show-message="false"
      >
        <template v-for="(item, index) in tableHead">
          <el-form-item
            v-if="item.fVisible == 1"
            :key="index"
            :label="item.fColumnDes"
            :prop="item.fColumn"
          >
            <el-date-picker
              v-if="item.fDataType == 'datetime'"
              v-model="ruleForm[item.fColumn]"
              type="datetime"
              placeholder="选择日期时间"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-date-picker>
            <el-input
              v-else-if="item.fDataType == 'int'"
              v-model.number="ruleForm[item.fColumn]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input>
            <el-checkbox
              v-else-if="item.fDataType == 'bit'"
              v-model="ruleForm[item.fColumn]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-checkbox>
            <el-input
              v-else
              @change="
                item.fColumn == 'fDataTableView'
                  ? getItemData(ruleForm[item.fColumn])
                  : '' || item.fColumn == 'fTableView'
                  ? getTableView(ruleForm[item.fColumn])
                  : ''
              "
              :disabled="item.fReadOnly == 0 ? false : true"
              v-model.trim="ruleForm[item.fColumn]"
            ></el-input>
          </el-form-item>
        </template>
      </el-form>
    </el-scrollbar>

    <hc-title content="子表接口数据"></hc-title>
    <!-- 子表格数据  -->
    <el-table
    :header-cell-style="{ background: '#eef1f6'}"
    v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :data="tableDataPage"
      :max-height="tableHeight"
      border
      style="width: 100%;"
      @current-change="handleSelectionChange"
      :default-sort="{ prop: 'date', order: 'descending' }"
    >
      <template>
        <el-table-column type="index" width="50"></el-table-column>
        <template v-for="(item, index) in itemTableHead">
          <el-table-column
            :key="index"
            :label="item.fColumnDes"
            :prop="item.fColumn"
            v-if="item.fVisible == 1 ? true : false"
            sortable
          >
            <template slot-scope="scope">
              <el-checkbox
                @change="changeA(scope.row, item.fColumn)"
                v-if="item.fDataType == 'bit'"
                :value="scope.row[item.fColumn] == 0 ? false : true"
                :disabled="item.fReadOnly == 0 ? false : true"
              ></el-checkbox>
              <el-select
                v-else-if="item.fColumn == 'fDataType'"
                v-model="scope.row[item.fColumn]"
                placeholder="请选择"
                :disabled="item.fReadOnly == 0 ? false : true"
              >
                <el-option
                  v-for="optionItem in selectOptions"
                  :key="optionItem.value"
                  :label="optionItem.label"
                  :value="optionItem.value"
                ></el-option>
              </el-select>
              <el-select
                v-else-if="item.fColumn == 'fComputer'"
                v-model="scope.row[item.fColumn]"
                placeholder="请选择"
                :disabled="item.fReadOnly == 0 ? false : true"
              >
                <el-option
                  v-for="(opts, i) in selectOpts"
                  :key="i"
                  :label="opts.label"
                  :value="opts.label"
                ></el-option>
              </el-select>
              <el-input
                v-else-if="item.fColumn === 'fSort'"
                v-model="scope.row[item.fColumn]"
                @change="ruleContent(scope.row[item.fColumn])"
                :disabled="item.fReadOnly == 0 ? false : true"
              ></el-input>

              <el-input
                v-else
                v-model="scope.row[item.fColumn]"
                :maxlength="scope.row[item.fLength]"
                :disabled="item.fReadOnly == 0 ? false : true"
              ></el-input>
            </template>
          </el-table-column>
        </template>
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="page flex-justify-end">
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
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  addformSaveData,
  ItemTableHeadData,
  getInterfaceItemData
} from "@/api/index";
import { chunk } from "@/utils/index";
import HcTitle from "@/components/HcTitle";
import { compare, defaultForm, creatRules } from "@/utils/common";
export default {
  name: "addInterface",
  props: ["tableHead"],
  components: {
    HcTitle
  },
  data() {
    return {
       tableHeight:document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      //表单数据
      ruleForm: {},
      rules: {},
      //字表头部数据
      itemTableHead: [],
      //字表table数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //字表修改的数据
      itemData: [],
      //字表的总长度
      allLength: "",
      //表面/视图名
      fTableView: "",
      //数据表或视图
      fTableViewData: "",
      //删除的数据
      deleteRowData: [],
      //字表新增数据
      InsertItemRow: [],
      //主表Columns
      columns: [],
      //字表 Columns
      itemColumns: [],
      //新增数据
      insertRow: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      selectOptions: [
        { label: "字符串", value: "string" },
        { label: "整数", value: "int" },
        { label: "小数", value: "decimal" },
        { label: "布尔值", value: "bit" },
        { label: "数组", value: "bytes" },
        { label: "日期与时间", value: "datetime" }
      ],
      //条件运算符
      selectOpts: [
        { label: "=", value: "string" },
        { label: ">=", value: "string" },
        { label: "<=", value: "string" },
        { label: ">", value: "string" },
        { label: "<", value: "string" },
        { label: "!=", value: "string" },
        { label: "between", value: "string" },
        { label: "_like_", value: "string" },
        { label: "_like", value: "string" },
        { label: "like_", value: "string" }
      ]
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.insertRow = [];
          this.InsertItemRow = [];
          this.columns = this.tableHead.map((item, index) => {
            return {
              ColumnName: item.fColumn,
              ColumnType: item.fDataType
            };
          });
          this.columns.forEach(element => {
            for (const key in this.ruleForm) {
              if (element.ColumnName == key) {
                let obj = {
                  Key: element.ColumnName,
                  Value: this.ruleForm[key]
                };
                this.insertRow.push(obj);
              }
            }
          });
          let arr = [];
          this.itemColumns = this.itemTableHead.map((item, index) => {
            return {
              ColumnName: item.fColumn,
              ColumnType: item.fDataType
            };
          });
          this.itemData.forEach(item => {
            this.itemColumns.forEach(element => {
              for (const key in item) {
                if (element.ColumnName == key) {
                  let obj = {
                    Key: element.ColumnName,
                    Value: item[key]
                  };
                  arr.push(obj);
                }
              }
            });
          });

          this.InsertItemRow = chunk(arr, this.allLength);
          let res = await addformSaveData([
            {
              lstSaveData: [
                //主表数据
                {
                  TableName: "t_Interface_Mst",
                  IdentityColumn: null,
                  DeleteRow: null,
                  UpdateRow: null,
                  Columns: this.columns,
                  InsertRow: [this.insertRow]
                },
                //字表数据
                {
                  TableName: "t_Interface_Item",
                  IdentityColumn: null,
                  DeleteRow: null,
                  UpdateRow: null,
                  Columns: this.itemColumns,
                  InsertRow:
                    this.InsertItemRow.length > 0 ? this.InsertItemRow : null
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
          if (res.State) {
            this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
            this.ruleForm={};
            this.$message.success("新增成功!");
          } else {
            this.$message.error(res.Message);
            this.InsertRow = [];
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.ruleForm={};
      this.$emit("closeBox");
    },
    handleSelectionChange(val, old) {
      if (val == null) {
      } else {
        //表格数据发生变化时
        let inserIdx = this.itemData.indexOf(val);
        if (inserIdx != -1) {
          this.itemData.splice(inserIdx, 1, val);
        } else {
          //不在
          this.itemData.push(val);
        }
      }
    },

    //获取子表内容
    async getItemData(val) {
    
      this.fTableViewData = val;
      let res = await getInterfaceItemData([
        [this.ruleForm.fTableView, this.ruleForm.fDataTableView],
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
      
        this.tableData = JSON.parse(res.Data);
          // console.log(this.tableData,11)
        this.tableData.forEach(item => {
          for (const key in item) {
            if (
              (key === "fNeedSave" ||
                key === "fVisible" ||
                key === "fKey" ||
                key === "fDecimal" ||
                key === "fNotNull" ||
                key === "fReadOnly" ||
                key === "fIdentity" ||
                key === "fQureyCol" ||
                key === "fIsNo" ||
                key === "fNeedOnly" ||
                key === "fLoadData") &&
              item[key] == null
            ) {
              this.$set(item, "fNeedSave", 0);
              this.$set(item, "fVisible", 0);
              this.$set(item, "fKey", 0);
              this.$set(item, "fDecimal", 0);
              this.$set(item, "fNotNull", 0);
              this.$set(item, "fReadOnly", 0);
              this.$set(item, "fIdentity", 0);
              this.$set(item, "fQureyCol", 0);
              this.$set(item, "fLoadData", 0);
              this.$set(item, "fIsNo", 0);
              this.$set(item, "fNeedOnly", 0);
            }
            if (key === "fTableView") {
              this.$set(item, "fTableView", this.fTableView);
            }
          }
        });
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表名/视图名
    getTableView(val) {
      this.fTableView = val;
      this.tableData.map((item, index) => {
        return (item.fTableView = val);
      });
    },

    async getTableHeadData() {
      let res = await ItemTableHeadData([
        {
          fTableView: '["t_Interface_Item"]'
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.itemTableHead = res.lstRet.sort(compare);
        this.allLength = this.itemTableHead.length;
      } else {
        this.$message.error(res.Message);
      }
    },

    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
      } else if (item[val] == 1) {
        item[val] = 0;
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
    //验证表格内容不能为空
    ruleContent(val) {
      var reg = /^[1-9]\d*$|^0$/;
      if (val.length > 0) {
        if (!reg.test(val)) {
          this.$message.warning("请在排序中输入数字!");
        }
      } else {
        this.$message.warning("请在排序中输入数字!");
      }
    },
    //删除
    handleDelete(item, index) {
      //如果删除的是原有的数据
      let delIdx = this.tableData.indexOf(item);
      let deleteRow = this.tableData.splice(delIdx, 1);
      this.deleteRowData.push(...deleteRow);
      let editIdx = this.itemData.indexOf(item);
      if (editIdx != -1) {
        this.itemData.splice(editIdx, 1);
      }
    }
  },
  created() {
    this.rules = creatRules(this.tableHead);
    this.ruleForm = defaultForm(this.tableHead);
    this.getTableHeadData();
  },
  computed: {
    tableDataPage: function() {
      return this.tableData.slice(
        (this.pageNum - 1) * this.pageSize,
        this.pageSize * this.pageNum
      );
    }
  },
  watch: {
    tableData(newval, oldval) {
      this.total = newval.length;
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/ .el-table .cell {
  padding: 0;
}
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}

/deep/.el-table td {
  padding: 2px 0 !important;
}
.el-form {
  min-width: 1200px;
}
</style>
