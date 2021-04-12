<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >新增</el-button
      >
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-baocun"
        @click="submitForm('editForm')"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('editForm')"
        >取消</el-button
      >
    </div>
    <el-scrollbar style="min-height: 180px;" :native="true">
      <el-form
        label-position="right"
        label-width="125px"
        :model="editForm"
        :rules="rules"
        ref="editForm"
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
              v-model="editForm[item.fColumn]"
              type="datetime"
              placeholder="选择日期时间"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-date-picker>
            <el-input
              v-else-if="item.fDataType == 'int'"
              v-model.number="editForm[item.fColumn]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input>
            <el-checkbox
              v-else-if="item.fDataType == 'bit'"
              v-model="editForm[item.fColumn]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-checkbox>
            <el-input
              v-else
              v-model.trim="editForm[item.fColumn]"
              :disabled="item.fReadOnly == 0 ? false : true"
              @change="
                item.fColumn == 'fDataTableView'
                  ? getItemData(editForm[item.fColumn])
                  : ''
              "
            ></el-input>
          </el-form-item>
        </template>
      </el-form>
    </el-scrollbar>
    <!-- 字表格数据 -->
    <hc-title content="子表接口数据"></hc-title>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :data="tableDataPage"
      @current-change="handleSelectionChange"
      border
      :max-height="tableHeight"
      style="width: 100%;"
      :default-sort="{ prop: 'date', order: 'descending' }"
    >
      <template>
        <el-table-column type="index" width="50"></el-table-column>
        <template v-for="(item, index) in itemTableHead">
          <el-table-column
            v-if="item.fVisible == 1"
            :key="index"
            :label="item.fColumnDes"
            :prop="item.fColumn"
            sortable
            min-width="120"
          >
            <template slot-scope="scope">
              <el-checkbox
                @change="changeA(scope.row, item.fColumn)"
                v-if="item.fDataType == 'bit'"
                :value="scope.row[item.fColumn] == 1 ? true : false"
                :disabled="item.fReadOnly == 0 ? false : true"
              ></el-checkbox>
              <el-select
                @change="selectDataType(scope.row, scope.row[item.fColumn])"
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
                @change="selectfComputer(scope.row, scope.row[item.fColumn])"
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
      <el-table-column
        fixed="right"
        label="操作"
        align="center"
        width="120"
        v-if="tableDataPage.length > 0"
      >
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
    <!-- 新增侧滑框 -->
    <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
    >
      <addItemInterface
        @closeBox="closeItemBox"
        :tableHead="this.itemTableHead"
        :fTableView="this.editForm.fTableView"
      ></addItemInterface>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  addformSaveData,
  ItemTableHeadData,
  getInterfaceItemData,
   getTableBodyData
} from "@/api/index";
import HcTitle from "@/components/HcTitle";
import addItemInterface from "../components/addItemInterface";
import { addParams, batchDelete, creatRules, compare } from "@/utils/common";
export default {
  name: "editInterface",
  props: ["tableHead", "rowData"],
  components: {
    HcTitle,
    addItemInterface
  },
  data() {
    return {
      tableHeight: document.body.clientHeight,
      //查询从表需要的字段
      ViewData: "",
      drawer: false,
      fTableViewData: "",
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      //UpdateRow
      updateRow: [],
      //Columns
      columns: [],
      //表单数据
      editForm: null,
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //字表头部数据
      itemTableHead: [],
      //字表table数据
      tableData: [],
      getRowKeys(row) {
        return row.fTableView;
      },
      //批量删除选中索引值
      batchIndex: [],
      rules: {},
      //字表的总长度
      allLength: "",
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
      ],
      //字表修改的数据
      editRow: [],
      //需要删除的数据
      deleteRow: [],
      //需要新增的数据
      insertRow: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      nullTable: []
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.updateRow = [];
          this.columns = this.tableHead.map((item, index) => {
            return {
              ColumnName: item.fColumn,
              ColumnType: item.fDataType
            };
          });
          this.columns.forEach(element => {
            for (const key in this.editForm) {
              if (element.ColumnName == key) {
                let obj = {
                  Key: element.ColumnName,
                  Value: this.editForm[key]
                };
                this.updateRow.push(obj);
              }
            }
          });

          let itemColumns = [];
          itemColumns = this.itemTableHead.map((item, index) => {
            // console.log(item);
            return {
              ColumnName: item.fColumn,
              ColumnType: item.fDataType
            };
          });

          let deleteRowArr = [],
            editRowArr = [],
            insertRowArr = [];
          if (this.deleteRow.length > 0) {
            a(this.deleteRow, deleteRowArr, itemColumns);
          }
          if (this.editRow.length > 0) {
            a(this.editRow, editRowArr, itemColumns);
          }
          if (this.insertRow.length > 0) {
            a(this.insertRow, insertRowArr, itemColumns);
          }

          function a(oriArr, newArr, sequence) {
            oriArr.forEach(item => {
              let itemArr = [];
              sequence.forEach(element => {
                for (const key in item) {
                  if (element.ColumnName == key) {
                    let obj = {
                      Key: element.ColumnName,
                      Value: item[key]
                    };
                    itemArr.push(obj);
                  }
                }
              });
              newArr.push(itemArr);
            });
          }

          let res = await addformSaveData([
            {
              lstSaveData: [
                {
                  TableName: "t_Interface_Mst",
                  IdentityColumn: null,
                  DeleteRow: null,
                  InsertRow: null,
                  UpdateRow: [this.updateRow],
                  Columns: this.columns
                },
                {
                  TableName: "t_Interface_Item",
                  IdentityColumn: null,
                  DeleteRow: deleteRowArr.length > 0 ? deleteRowArr : null,
                  InsertRow: insertRowArr.length > 0 ? insertRowArr : null,
                  UpdateRow: editRowArr.length > 0 ? editRowArr : null,
                  Columns: itemColumns
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
          if (res.State) {
            this.$message.success("修改成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(this.editForm)));
            this.ruleForm = {};
            this.updateRow = [];
          } else {
            this.$message.error(res.Message);
            this.updateRow = [];
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$emit("closeBox");
    },

    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
      } else if (item[val] == 1) {
        item[val] = 0;
      }
    },
    selectDataType(row, val) {
      let isNullData = this.nullTable.some(item => {
        return row.fColumn == item.fColumn;
      });
      if (isNullData) {
        this.insertRow.push(row);
      } else {
        let editIdx2 = this.editRow.indexOf(row);
        if (editIdx2 == -1) {
          this.editRow.push(row);
        } else {
          this.editRow.splice(editIdx2, 1, row);
        }
      }
    },
    selectfComputer(row, val) {
      let isNullData = this.nullTable.some(item => {
        return row.fColumn == item.fColumn;
      });
      if (isNullData) {
        this.insertRow.push(row);
      } else {
        let editIdx2 = this.editRow.indexOf(row);
        if (editIdx2 == -1) {
          this.editRow.push(row);
        } else {
          this.editRow.splice(editIdx2, 1, row);
        }
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
    //删除
    handleDelete(row, index) {
      //如果删除的是新增的数据
      let inserIdx = this.insertRow.indexOf(row);
      if (inserIdx != -1) {
        this.insertRow.splice(inserIdx, 1);
      }

      //如果删除的是原有的数据
      let delIdx = this.tableData.indexOf(row);
      if (delIdx != -1) {
        let deleteArr = this.tableData.splice(delIdx, 1);
        if (inserIdx != -1) {
        } else {
          this.deleteRow.push(deleteArr[0]);
        }
      }

      //如果删除的是修改的数据
      //修改了原来的数据然后再删除
      let editIdx = this.editRow.indexOf(row);
      // console.log(editIdx);
      if (editIdx != -1) {
        this.editRow.splice(editIdx, 1);
      }
    },

    //新增按钮
    addPopRight() {
      this.drawer = true;
    },
    //数据改变之后重新获取表格内容数据
    getItemData(val) {
      this.fTableViewData = val;
      this.getTableBodyData();
    },
    //表头数据
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
        //查询从表需要的字段
        this.ViewData = res.fTableViewData;
        this.getSearchItemData();
      } else {
        this.$message.error(res.Message);
      }
    },

    //数据改变之后重新获取表格内容数据
    async getTableBodyData() {
      let res = await getInterfaceItemData([
        [this.editForm.fTableView, this.editForm.fDataTableView],
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(
        decryptDesCbc(res.qureyInterfaceItemDataResult, String(this.userDes))
      );
      if (res.State) {
        let tableDataArr = JSON.parse(res.Data);
        this.nullTable = [];
        tableDataArr.forEach((item, idx) => {
          if (item.fSort === null) {
            this.nullTable.push(item);
          }
        });
        this.tableData = JSON.parse(res.Data);
        // console.log(this.tableData, "表体内容");
        this.tableData.forEach(item => {
          for (const key in item) {
            if (
              (key === "fNeedSave" ||
                key === "fVisible" ||
                key === "fKey" ||
                key === "fDecimal" ||
                key === "fNotNull" ||
                key === "fIdentity" ||
                key === "fQureyCol" ||
                key === "fIsNo" ||
                key === "fNeedOnly" ||
                key === "fLoadData" ||
                key === "fReadOnly") &&
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
          }
        });
      } else {
        this.$message.error(res.Message);
      }
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭新增弹窗
    closeBox(value) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        this.tableData.unshift(value);
        this.insertRow.push(value);
        // console.log(this.insertRow, "新增");
      }
      this.drawer = false;
    },
    //表格数据发生变化时
    handleSelectionChange(val, old) {
      if (val == null) {
      } else {
        let inserIdx = this.insertRow.indexOf(val);
        let editIdx = this.editRow.indexOf(val);
        if (inserIdx != -1) {
          this.insertRow.splice(inserIdx, 1, val);
        } else if (editIdx != -1) {
          this.editRow.splice(editIdx, 1, val);
        } else {
          this.editRow.push(val);
        }
      }

      //如果修改了没有数据的数，把它添加到插入数组（insertRow）里面,不应该放在修改数组（editRow）里面
      this.nullTable.forEach((item, idx) => {
        if (val.fColumn == item.fColumn) {
          let editIdx2 = this.editRow.indexOf(val);
          let nullIdx = this.insertRow.indexOf(val);
          if (nullIdx == -1) {
            this.insertRow.push(val);
          }
          this.editRow.splice(editIdx2, 1);
        }
      });
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
    async getSearchItemData() {
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: "fTableView",
          Value: this.editForm.fTableView
        }
      ];
      let res = await getTableBodyData(this.ViewData, searchWhereObj);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let resultData = JSON.parse(res.Data);
        this.tableData = resultData;
        console.log(this.tableData);
      }
    }
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
    rowData(newVal, oldVal) {
      this.editForm = JSON.parse(JSON.stringify(newVal));
      this.editForm.fModifier = JSON.parse(
        sessionStorage.getItem("user")
      ).userId;
      this.editForm.fModifierCode = JSON.parse(
        sessionStorage.getItem("user")
      ).usercode;
      this.fTableViewData = this.editForm.fDataTableView;
      this.getSearchItemData();
    },
    tableData(newval, oldval) {
      this.total = newval.length;
    }
  },
  created() {
    this.getTableHeadData();
    this.rules = creatRules(this.tableHead);
    this.editForm = JSON.parse(JSON.stringify(this.rowData));
    this.fTableViewData = this.editForm.fDataTableView;
    this.editForm.fModifier = JSON.parse(sessionStorage.getItem("user")).userId;
    this.editForm.fModifierCode = JSON.parse(
      sessionStorage.getItem("user")
    ).usercode;
    this.editForm.fModifyDate = new Date();
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

.add {
  margin-top: -15px;
  margin-bottom: 5px;
}
.el-form {
  min-width: 1200px;
}
</style>
