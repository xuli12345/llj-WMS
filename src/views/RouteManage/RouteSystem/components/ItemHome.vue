<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
       v-fit-columns
      style="width: 100%"
      :row-key="getRowKeys"
      :data="currentTableData | pagination(pageNum, pageSize)"
      @selection-change="handleSelectionChange"
      @row-dblclick="dblclick"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
          :column-key="item.fColumn"
        >
          <template slot-scope="scope">
            <!-- item.fColumn == 'fPickSort' || -->
            <el-input
              v-if="item.fColumn == 'fSort'"
              type="text"
              v-model="scope.row[item.fColumn]"
            ></el-input>

            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="180">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click.stop="DeleteOne(scope.row, scope.$index)"
              :disabled="userLimit('fDel')"
              >删除</el-button
            >

            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row, scope.$index)"
              :disabled="userLimit('fEdit')"
              >修改</el-button
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
        :total="currentTotal"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, userLimit } from "@/utils/common";
import { compare } from "@/utils/common";
import { getTableHeadData, BathcDeleteData } from "@/api/index";
export default {
  //fTableView:请求列头   isSaveSuccess:是否保存成功
  props: ["fTableView", "isSaveSuccess", "tableData", "total"],
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      tableHeadData: [],
      BatchList: [],
      currentTableData: [],
      fTableViewData: "",
      pageNum: 1,
      pageSize: 10,
      currentTotal: 0,
      //表格拖拽字段
      sortable: null,
      oldList: [],
      newList: [],
      batchDelTableName: [
        {
          Key: "t_Route_System_ShopItem",
          Value: [{ Key: "fID", Value: "fSystemItemID" }]
        }
      ],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  methods: {
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "表头");
      } else {
        this.$message.error(res.Message);
      }
    },

    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },

    //修改
    handleEdit(row, index) {
      this.$emit("openEditDrawer", row, this.tableHeadData);
    },
    //删除
    DeleteOne(row, index) {
      // console.log(row);
      let currentRow = JSON.parse(JSON.stringify(row));
      let resultData = addParams(this.tableHeadData, row);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })

        .then(async () => {
          let res = await BathcDeleteData([
            {
              MstItemKey: this.batchDelTableName,
              MstKeyValue: [[{ Key: "fID", Value: row.fID }]],
              MstTableView: "t_Route_System_Item"
            },
            { userDes: this.userDes, userId: this.userId }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("删除成功!");
            this.$emit("update:isSaveSuccess", res.State);
          } else {
            this.$message.error(res.Message);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },

    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    }
  },

  created() {
    this.getTableHeadData();
    this.currentTotal = this.total;
    this.currentTableData = this.tableData;
  },
  watch: {
    tableData(newVal, oldVal) {
      this.currentTableData = newVal;
      this.currentTotal = this.currentTableData.length;
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
</style>
