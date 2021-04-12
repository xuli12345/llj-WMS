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
          >打印</el-button
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
    <!-- 打印格式内容    -->
    <!--  :printHeadData="printHeadData"  :ItemBackData="ItemBackData" -->
    <div style="width:0;height:0;overflow:hidden">
      <print-table
        v-if="isRender"
        ref="print"
        id="toPrint"
        :dataCode="dataCode"
        :rowData="rowData"
        :ItemTableHeadData="ItemTableHeadData"
        :title="title"
        :driver="driver"
      ></print-table>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import PrintTable from "./PrintTable";
import { tempUrl } from "@/utils/tempUrl";
import PrintJS from "print-js";
import { getTableBodyData, getTableHeadData } from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  //printView:打印请求的字段  title:打印的表题 isCheck:已审核

  props: ["fTableView", "isSaveSuccess", "isPrint", "printView", "title"],
  components: {
    PrintTable
  },
  data() {
    return {
      tableHeight: document.body.clientHeight,
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
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      //批量
      BatchList: [],
      getRowKeys(row) {
        return row.fPaicheNo;
      },
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
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      newArr: [],
      rowData: [],
      driver: []
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
          Computer: "is not null",
          DataFile: "fLoading",
          Value: ""
        },
        {
          Computer: "is null",
          DataFile: "fOutDate",
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
        console.log(this.ItemTableHeadData, "IEIE");
        this.ItemTableHeadData.forEach(item => {
          if (item.fColumn == "fShopName" || item.fColumn == "fJobid") {
            this.$set(item, "width", 160);
          } else {
            this.$set(item, "width", 95);
          }
        });
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
    async printCon() {
      this.dataCode = [];
      if (this.BatchList.length == 0) {
        this.$message.warning("请勾选您要打印的数据!");
      } else {
        let where = [
          {
            Computer: "=",
            DataFile: "fPaicheSn",
            Value: this.BatchList.fPaicheSn
          },
          {
            Computer: "=",
            DataFile: "fPaicheNo",
            Value: this.BatchList.fPaicheNo
          }
        ];
        let res = await getTableBodyData("v_Paiche_ShopItem", where);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let data = JSON.parse(res.Data);
          console.log(data);
          data = data.map(item => {
            if (item.fProdDate) {
              item.fProdDate = updateTime(item.fProdDate);
            }
            if (item.fExpireDate) {
              item.fExpireDate = updateTime(item.fExpireDate);
            }
            return item;
          });
          if (data.length < 1) {
            this.$message.warning("当前排车单没有门店信息！");
            return;
          }
          this.dataCode = data;
        } else {
          this.$message.error(res.Message);
          return;
        }
        this.getPeople().then(res => {
          this.driver = JSON.parse(res.Data);
          this.rowData = this.BatchList;
          this.isRender = true;
          setTimeout(() => {
            const style =
              "table td,th,tr {border: 1px #000 solid;font-size: 18px; text-align: center; table-layout: fixed;word-break: break-all; word-wrap:break-word;page-break-inside:avoid}; ";
            PrintJS({
              printable: "toPrint",
              type: "html",
              scanStyles: false,
              style: style
            });
          }, 500);
          setTimeout(() => {
            this.isRender = false;
          }, 600);
        });
      }
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
</style>
