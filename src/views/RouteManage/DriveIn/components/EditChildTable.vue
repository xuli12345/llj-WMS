<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="门店信息" name="shop">
        <el-table
          :header-cell-style="{ background: '#eef1f6' }"
          :data="tableData | pagination(pageNum, pageSize)"
           v-fit-columns
          class="table-wrapper"
          ref="singleTable"
          :max-height="tableHeight"
          border
          :row-key="getRowKeys"
          style="width: 100%;"
        >
            <!-- :filters="screenFuction(item.fColumn)"
              :filter-method="filtersF" -->
          <el-table-column type="index" width="50"></el-table-column>
          <template v-for="(item, index) in tableHeadData">
            <el-table-column
              v-if="item.fVisible == 1 ? true : false"
              :key="index"
              :label="item.fColumnDes"
              :prop="item.fColumn"
              sortable
              min-width="120px"
          
            ></el-table-column>
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
export default {
  props: ["fTableView", "insertData", "rowData", "changeData", "isDisabled"],
  data() {
    return {
      activeName: "shop",
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      //获取表格内容TableView的值,在获取headData中获取
      getRowKeys(row) {
        return row.fID;
      },
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      userDes: this.$store.state.user.userInfo.userDes,
      //获取表格数据的fTableView
      fTableViewll: ""
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
    //表格筛选
    filtersF(val, row, column) {
      const property = column["property"];
      return row[property] === val;
    },
    //筛选的条件数组
    screenFuction(val) {
      // console.log(val); 表格中传递过来表格的的字段
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
    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData("t_Paiche_ShopItem");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      //   console.log(res);
      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
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
          DataFile: "fPaicheSn",
          Value: this.rowData.fPaicheSn
        },
        {
          Computer: "=",
          DataFile: "fPaicheNo",
          Value: this.rowData.fPaicheNo
        }
      ];
      let res = await getTableBodyData(this.fTableViewll, searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
      } else {
        this.$message.error(res.Message);
      }
    }
  },

  async created() {
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
