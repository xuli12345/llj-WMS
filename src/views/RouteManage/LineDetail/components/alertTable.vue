<template>
  <div>
    <div class="pan-btns">
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >确定</el-button
      >
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
        >取消</el-button
      >
    </div>
    <div class="page flex-wrap">
      <div
        class="search flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        {{ item.fColumnDes }}:
        <el-input
          v-model="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
          clearable
        ></el-input>
      </div>
      <div style="margin-top:10px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="search"
          >查询</el-button
        >
      </div>
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
      @selection-change="handleSelectionChange"
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
          :column-key="item.fColumn"
        >
          <template slot-scope="scope">
            <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 0 ? false : true"
            ></el-checkbox>

            <el-input
              v-else
              v-model="scope.row[item.fColumn]"
              :maxlength="scope.row[item.fLength]"
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
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
import VueBus from "@/vueBus";
export default {
  props: ["fTableView"],
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      // getRowKeys(row) {
      //   // console.log(row)
      //   return row.fHrID;
      // },
      //查询的数据
      searchData: [],
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //获取表格数据的fTableView
      fTableViewll: "",
      asData: {},
      //传递过去的数据
      sendData: [],
      //权限表修改的数据
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
    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        item[val] = 0;
        this.$set(item, val, 0);
      }
    },

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);

        let searchArr = [];
        searchArr = this.tableHeadData.filter(element => {
          return element.fQureyCol == 1;
        });
        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        let arr = [];
        ColumnArr.forEach((element, index) => {
          this.tableHeadData.forEach((item, index) => {
            // if (item.fColumn.includes(element)) {
            //这里用相等 当勾选的字段名相近时就会把没勾选的值给添加进来
            if (item.fColumn == element) {
              let obj = {
                fColumnDes: item.fColumnDes,
                fColumn: item.fColumn,
                fComputer: item.fComputer,
                fDataType: item.fDataType
              };

              arr.push(obj);
            }
          });
        });

        this.searchData = arr;
        console.log(this.tableHeadData, "dailog表头数据");
      } else {
        this.$message.error(res.Message);
      }
    },
    search() {
      this.getTableData();
    },
    //获取表格内容数据
    async getTableData(searchWhere = []) {
      this.pageNum = 1;
      if (JSON.stringify(this.asData) == "{}") {
        searchWhere = searchWhere;
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let obj = {
              Computer: "=",
              DataFile: element.fColumn,
              Value: this.asData[element.fColumn]
            };
            searchWhere.push(obj);
          }
        });
      }
      let res = await getTableBodyData(this.fTableView, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(JSON.parse(JSON.stringify(res.Data)), this.fTableView, "res");
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        console.log(this.tableData, "表体内容");
      } else {
        this.$message.error(res.Message);
      }
    },

    submitForm() {
      this.$emit("closeBox", JSON.parse(JSON.stringify(this.sendData)));
      this.$refs.singleTable.clearSelection();
    },
    resetForm() {
      this.$emit("closeBox");
    },
    handleSelectionChange(val) {
      this.sendData = val;
    },
    //选择过的随车人员要删除这条数据
    filterCheMst() {
      VueBus.$on("filterCheMst", data => {
        // console.log(data, "filterCheMst");
        data.forEach((val, index) => {
          this.tableData.forEach((item, idx) => {
            // console.log(item);
            if (item.fHrID == val.fHrID) {
              this.tableData.splice(idx, 1);
            }
          });
        });
      });
    },
    getCheAddone() {
      VueBus.$on("CheAddone", val => {
        // console.log(val);
        this.tableData.push(val);
        let hash = {};
        const data = this.tableData.reduce((preVal, curVal) => {
          hash[curVal.fHrID]
            ? ""
            : (hash[curVal.fHrID] = true && preVal.push(curVal));
          return preVal;
        }, []);
        this.tableData = data;
      });
    }
  },
  watch: {
    tableData: function() {
      this.total = this.tableData.length;
    }
  },

  created() {
    let suiCheData = this.$store.state.common.suicheData;
    if (suiCheData.length == 0) {
      this.getTableData();
    } else {
      let searchData = [];
      let obj = {};
      suiCheData.forEach(item => {
        obj = {
          Computer: "!=",
          DataFile: "fHrID",
          Value: item.fHrID
        };
        searchData.push(obj);
      });
      this.getTableData(searchData);
    }
    this.getTableHeadData();
    this.filterCheMst();
    this.getCheAddone();
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
.search {
  white-space: nowrap;
  margin-right: 20px;
  margin-top: 10px;
}
.page {
  margin: 0px 10px 10px 10px;
  width: 100%;
}
</style>
