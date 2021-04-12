<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData | pagination(pageNum, pageSize)"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      id="table-wrapper"
      :max-height="tableHeight"
      border
      :row-key="getRowKeys"
      style="width: 100%;"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="120"
        >
          <template slot-scope="scope">
            <el-input
              v-if="item.fColumn == 'fSort'"
              v-model="scope.row[item.fColumn]"
              :disabled="isDisabled"
            ></el-input>
            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              :disabled="isDisabled"
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
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
import Sortable from "sortablejs";
export default {
  props: ["fTableView", "insertData", "fID", "changeData", "isDisabled"],
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      fTableViewll: "",
      backData: [],
      selectOptions: [],
      selData: [],
      tableData: [],
      tableHeadData: [],
      //表格拖拽字段
      sortable: null,
      oldList: [],
      newList: [],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes
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

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        // this.tableHeadData.forEach(item => {
        //   if (item.fColumn == "fSort") {
        //     this.$set(item, "width", 80);
        //   } else {
        //     this.$set(item, "width", 300);
        //   }
        // });
        this.getTableData();
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表格内容数据
    async getTableData() {
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: this.fTableView[1],
          Value: this.fID
        }
      ];
      let res = await getTableBodyData(this.fTableViewll, searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.tableData = this.tableData.sort(compare);
        this.tableData.forEach((element, index) => {
          this.$set(element, "fSort", index + 1);
        });

        this.backData = JSON.parse(JSON.stringify(this.tableData));
        console.log(this.backData, "回显的数据");
        this.total = this.tableData.length;
        this.oldList = this.tableData.map(v => v.fID);
        this.newList = this.oldList.slice();
        this.$nextTick(() => {
          //   this.setSort();
        });
      } else {
        this.$message.error(res.Message);
      }
    },

    setSort() {
      let el = document.getElementById("table-wrapper");

      el = el.children[2].children[0].children[1];

      this.sortable = Sortable.create(el, {
        onEnd: evt => {
          //   console.log(evt);
          const targetRow = this.tableData.splice(evt.oldIndex, 1)[0];

          this.tableData.splice(evt.newIndex, 0, targetRow);

          // for show the changes, you can delete in you code
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0];
          this.newList.splice(evt.newIndex, 0, tempIndex);
        }
      });
    },

    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    }
  },
  watch: {
    insertData(n, o) {
      if (Array.isArray(this.insertData)) {
        let iData = JSON.parse(JSON.stringify(this.insertData));
        iData.forEach((item, index) => {
          this.$set(item, "fSort", this.tableData.length + index + 1);
          this.$set(item, this.fTableView[1], this.fID);
        });
        // console.log(iData);
        if (this.tableData.length == 0) {
          this.tableData = iData;
        } else {
          let res = this.tableData.every(item => {
            return item.fShopID != iData[0].fShopID;
          });
          if (res) {
            this.tableData = [...this.tableData, ...iData];
          } else {
            this.$message.warning("此门店已存在!");
          }
        }
      } else {
        this.insertData[this.fTableView[1]] = this.fID;
        this.tableData = this.tableData.concat(
          JSON.parse(JSON.stringify(this.insertData))
        );
      }
      this.total = this.tableData.length;
    }
  },

  created() {
    this.getTableHeadData();
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
