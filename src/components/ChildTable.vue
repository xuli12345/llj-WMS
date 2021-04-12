<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :max-height="tableHeight"
      :data="tableList | pagination(pageNum, pageSize)"
      class="table-wrapper"
      ref="singleTable"
      border
      :row-key="getRowKeys"
      style="width: 100%;"
    >
      <el-table-column type="index" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="120px"
        >
          <template slot-scope="scope">
            <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 0 ? false : true"
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
            <el-input
              v-else-if="item.fColumn === 'fSort'"
              v-model="scope.row[item.fColumn]"
              @change="ruleContent(scope.row[item.fColumn])"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input>
            <div v-else>{{ scope.row[item.fColumn] }}</div>
            <!-- <el-input
              v-else
              v-model="scope.row[item.fColumn]"
              :maxlength="scope.row[item.fLength]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input> -->
          </template>
        </el-table-column>
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
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { addParams, batchDelete, compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
export default {
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "value",
    "isSave",
    "selBatchList",
    "tableData"
  ],
  data() {
    return {
      getRowKeys(row) {
        return row.fCompanyID || row.fModName;
      },
      tableHeadData: [],
      BatchList: [],
      tableList: [],
      OrignData: [],
      nullTable: [],
      select: true,
      fTableViewData: "",
      fTableViewll: "",
      asData: {},
      pageNum: 1,
      pageSize: 10,
      total: 0,
      //权限表修改的数据
      editTableData: [],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  methods: {
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    changeA(item, val) {
      if (this.isAuthority) {
        this.editTableData.push(item);
        this.editTableData = Array.from(new Set(this.editTableData));
        this.$emit("update:selBatchList", this.editTableData);
        // console.log(this.editTableData);
      }

      if (item[val] == 0) {
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        this.$set(item, val, 0);
      }
    },

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      res = JSON.parse(decryptDesCbc(res, String(userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "字表表头数据");
      } else {
        this.$message.error(res.Message);
      }
    },

    //下拉选择框
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
    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    }
  },
  watch: {
    tableData: function() {
      this.tableList = [...this.tableData];
      this.total = this.tableList.length;
    }
  },

  created() {
    this.getTableHeadData();
    this.tableList = this.tableData;
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
</style>
