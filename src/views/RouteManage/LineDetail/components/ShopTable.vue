<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
      :row-key="getRowKeys"
      highlight-current-row
      @selection-change="handleSelectionChange"
      style="width: 100%;"
    >
     
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="120px"
        >
      
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
import VueBus from "@/vueBus";
export default {
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "value",
    "isSave",
    "tableData"
  ],
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      //checkbox选中的数据
      BatchList: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      getRowKeys(row) {
        return row.fShopID;
      },
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      //获取表格数据的fTableView
      fTableViewll: ""
    };
  },
  methods: {
    handleSelectionChange(val) {
      // console.log(val, "val");
      this.BatchList = val;
      this.$emit("changeBatchList", val);
    },

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      res = JSON.parse(decryptDesCbc(res, String(userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData, "字表表头数据");
        this.tableHeadData.forEach(item => {
         
          if (item.fColumn == "fPaicheSn" || item.fColumn == "fPaicheNo") {
            this.$set(item, "fVisible", 0);
          }
        });
      } else {
        this.$message.error(res.Message);
      }
    },
    getShopAddone() {
      VueBus.$on("shopAddone", val => {
        // console.log(val);
        this.tableData.push(val);
      });
    },

    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    }
  },
  watch: {
    tableData: function() {
      this.total = this.tableData.length;
    }
  },

  created() {
    this.getTableHeadData();
    this.getShopAddone();
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
