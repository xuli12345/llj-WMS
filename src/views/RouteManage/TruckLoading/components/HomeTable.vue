<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        {{ item.fColumnDes }}:
        <el-checkbox
          v-if="item.fDataType == 'bit'"
          v-model="asData[item.fColumn]"
        ></el-checkbox>
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model.trim="asData[item.fColumn]"
          type="date"
          placeholder="选择日期时间"
          min-width="300"
        ></el-date-picker>
        <el-row v-else-if="item.fComputer == 'between'">
          <el-col :span="11">
            <el-input
              v-model.trim="startData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
          <el-col :span="2">——</el-col>
          <el-col :span="11">
            <el-input
              style="margin-left:0px"
              v-model.trim="endData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
        </el-row>
        <el-input
          v-else
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
        ></el-input>
      </div>
      <div style="margin-top:10px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="search"
          :disabled="userLimit('fQurey')"
          >查询</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="printCon"
          :disabled="userLimit('fPrint')"
          >装车配送明细单打印</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="printSign"
          :disabled="userLimit('fPrint')"
          >打印签收单</el-button
        >
      </div>
    </div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      class="table-wrapper"
      ref="singleTable"
      border
       v-fit-columns
      :max-height="tableHeight"
      style="width: 100%"
      :row-key="getRowKeys"
      :data="tableData"
      @row-dblclick="dblclick"
      @current-change="handleRadioChange"
      highlight-current-row
    >
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
            <el-checkbox
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 1 ? true : false"
              disabled
            ></el-checkbox>

            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click.stop="haveItemDelete(scope.row, scope.$index)"
            :disabled="userLimit('fDel')"
            >删除</el-button
          >
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
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import PrintJS from "print-js";

import {
  ItemTableHeadData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  //printView:打印请求的字段  title:打印的表题 isCheck:已审核
  props: [
    "fTableView",
    "isSaveSuccess",
    "isPrint",
    "printView",
    "title",
    "batchDelTableName"
  ],

  data() {
    return {
      getRowKeys(row) {
        return row.fPaicheNo;
      },
      //查询的数据
      searchData: [],
      tableHeadData: [], //表头数据
      //打印主表表头数据
      printHeadData: [],
      //打印主表内容数据
      dataCode: [],
      //打印字表表头数据
      ItemTableHeadData: [],
      //打印从表回显数据
      ItemBackData: [],
      isRender: false,
      //搜索条件
      searchWhere: [],
      fTableViewData: "",
      BatchList: [],
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      asData: {},
      endData: {},
      startData: {},
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
        console.log(this.tableHeadData, "表头1");

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
      } else {
        this.$message.error(res.Message);
      }
    },

    //查询
    search() {
      this.pageNum = 1;
      this.getTableData();
    },
    searchCommon() {
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];
            if (result instanceof Date) {
              result = timeCycle(result);
            }
            if (result.constructor == Boolean && result == true) {
              result = 1;
            }
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: result
            };
            this.searchWhere.push(obj);
          }
        });
      }
      let startobj = {};
      let endobj = {};
      let arr = [];
      for (const key in this.startData) {
        for (const Ikey in this.endData) {
          if (Ikey == key) {
            startobj = {
              Computer: ">=",
              DataFile: key,
              Value: this.startData[key]
            };
            endobj = {
              Computer: "<=",
              DataFile: key,
              Value: this.endData[Ikey]
            };

            arr.push(startobj);
            arr.push(endobj);
          }
        }
      }
      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }
    },
    //获取table表格内容数据
    async getTableData() {
      this.searchCommon();
      let arr = [
        {
          Computer: "is null",
          DataFile: "fLoading",
          Value: ""
        }
      ];
      this.searchWhere.push(...arr);
      let res = await getTableBodyData(
        this.fTableViewData,
        this.searchWhere,
        this.pageNum,
        this.pageSize,
        "order by fCreateDate desc"
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.tableHeadData.forEach(ele => {
          this.tableData.forEach(child => {
            if (ele.fDataType == "datetime" && child[ele.fColumn]) {
              child[ele.fColumn] = child[ele.fColumn].replace(/T/, " ");
            }
          });
        });
        console.log(this.tableData, "表体内容");
      }
      this.total = res.TTLPage;
    },
    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },

    // 单选
    handleRadioChange(val) {
      this.BatchList = val;
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData();
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getTableData();
    },
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    //获取打印表头的数据
    async getPrintHeadData() {
      let res = await getTableHeadData(this.printView[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.printHeadData = res.lstRet.sort(compare);
        console.log(this.printHeadData, "this.printHeadData");
        this.printHeadData = this.printHeadData.filter(item => {
          return item.fVisible == 1;
        });
        this.printHeadData = this.printHeadData.map(item => {
          return item.fColumnDes;
        });
      }
    },
    //获取打印字表表头的数据
    async getPrintItemHeadData() {
      let res = await getTableHeadData("t_Paiche_ShopItem");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.ItemTableHeadData = res.lstRet.sort(compare);
        // console.log(this.ItemTableHeadData, "打印字表的表头");
      }
    },
    // 获取跟车人员
    getPeople() {
      let _this = this;
      return new Promise(async (resolve, reject) => {
        let where = [
          {
            Computer: "=",
            DataFile: "fPaicheSn",
            Value: _this.BatchList.fPaicheSn
          },
          {
            Computer: "=",
            DataFile: "fPaicheNo",
            Value: _this.BatchList.fPaicheNo
          }
        ];
        let res = await getTableBodyData("v_Paiche_PeopleItem", where);
        res = JSON.parse(decryptDesCbc(res, String(_this.userDes)));
        if (res.State) {
          resolve(res);
        } else {
          reject(res.Message);
        }
      });
    },
    //有从表数据的删除
    haveItemDelete(row, index) {
      console.log(row);
      let RowData = JSON.parse(JSON.stringify(row));
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let objectArr = [];
          let obj = [
            {
              Key: "fPaicheSn",
              Value: RowData.fPaicheSn
            }
          ];
          objectArr.push(obj);

          let res = await BathcDeleteData([
            {
              MstItemKey: this.batchDelTableName,
              MstKeyValue: objectArr,
              MstTableView: this.fTableView
            },
            { userDes: this.userDes, userId: this.userId }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res, "删除");
          if (res.State) {
            this.$message.success("删除成功!");
            this.getTableData();
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
    printCon() {
      this.$emit("openDeliver");
    },
    printSign() {
      this.$emit("openSign");
    }
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.getTableData();
      }
    }
  },
  created() {
    this.getTableHeadData();
    if (this.isPrint) {
      this.getPrintHeadData();
      this.getPrintItemHeadData();
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
// 配置elementui 固定列行向线对不齐
/deep/ .el-table {
  .el-table__fixed,
  .el-table__fixed-right {
    height: 100% !important;
  }

  &.el-table--fluid-height {
    &.el-table--scrollable-y {
      .el-table__fixed-body-wrapper {
        bottom: 1px;
        max-height: none !important;
      }

      &.el-table--scrollable-x {
        .el-table__fixed-body-wrapper {
          bottom: 18.5px; // 这里的高度如果写的比较小 ie会不兼容
          max-height: none !important;
          
        }
      }
    }
  }
}
</style>
