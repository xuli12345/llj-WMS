<template>
  <div>
    <div class="flex" style="margin-bottom:10px">
      <!-- <el-button
        type="primary"
        class="iconfont icon-dayin1"
        size="mini"
        v-print="'#toPrint'"
        >打印</el-button
      > -->
      <el-button
        type="primary"
        class="iconfont icon-dayin1"
        size="mini"
        @click="printCon()"
        >打印</el-button
      >
    </div>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData | pagination(pageNum, pageSize)"
        v-fit-columns
      class="table-wrapper"
      ref="singleTable"
       :max-height="tableHeight"
      border
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
          
        >
          <template slot-scope="scope">
            <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 0 ? false : true"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-checkbox>

            <el-input
              v-else
              v-model="scope.row[item.fColumn]"
              :maxlength="scope.row[item.fLength]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input>
          </template>
        </el-table-column>
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
    <!-- 打印格式内容 -->
    <div style="width:0;height:0;overflow:hidden">
    <print-container
      v-if="isRender"
      ref="Print"
      id="toPrint"
      :tableData="tableData"
    ></print-container>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
import printContainer from "./printContainer";
import PrintJS from "print-js";
export default {
  props: ["fTableView", "tableData"],
  components: {
    printContainer
  },
  data() {
    return {
       tableHeight:document.body.clientHeight,
      tableHeadData: [], //表头数据
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //权限表修改的数据
      userDes: this.$store.state.user.userInfo.userDes,
      //获取表格数据的fTableView
      fTableViewll: "",
      isRender: false
    };
  },
  methods: {
    printCon() {
      this.isRender = true;
      setTimeout(() => {
        PrintJS({
          printable: "toPrint",
          type: "html",
          scanStyles: false,
          css: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
        });
      }, 500);
      setTimeout(() => {
        this.isRender = false;
      }, 600);
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        item[val] = 0;
        this.$set(item, val, 0);
      }
    },
    //表格筛选
    filtersF(val, row, column) {
      // console.log(val)
      const property = column["property"];
      return row[property] === val;
    },
    //筛选的条件数组
    screenFuction(val) {
      let copyTable = this.tableData;
      let screenData = [];
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
    async getHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "字表表头数据11");
      } else {
        this.$message.error(res.Message);
      }
    }
  },
  watch: {
    tableData: function() {
      this.total = this.tableData.length;
    }
  },

  created() {
    this.getHeadData();
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
