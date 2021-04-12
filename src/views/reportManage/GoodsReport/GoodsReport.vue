<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        <p>{{ item.fColumnDes }}:</p>

        <el-checkbox
          v-if="item.fDataType == 'bit'"
          v-model="asData[item.fColumn]"
        ></el-checkbox>

        <el-row
          v-else-if="
            item.fComputer == 'between' && item.fDataType == 'datetime'
          "
        >
          <el-col :span="11">
            <el-date-picker
              v-model="startData[item.fColumn]"
              type="date"
              placeholder="请输入范围值"
            ></el-date-picker>
          </el-col>
          <el-col :span="2">——</el-col>
          <el-col :span="11">
            <el-date-picker
              v-model="endData[item.fColumn]"
              type="date"
              placeholder="请输入范围值"
            ></el-date-picker>
          </el-col>
        </el-row>
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model="asData[item.fColumn]"
          type="date"
          placeholder="选择日期时间"
          min-width="300"
        ></el-date-picker>
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
          class="iconfont icon-export"
          :disabled="userLimit('fExport')"
          @click="handerExport"
          >导出</el-button
        >
      </div>
    </div>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
      style="width: 100%"
      :data="tableData | pagination(pageNum, pageSize)"
      highlight-current-row
      @current-change="handleCurrentRow"
    >
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          :fixed="
            item.fColumn == 'fProductCode' || item.fColumn == 'fProductName'
          "
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
        ></el-table-column>
      </template>

      <el-table-column width="80" label="合计" fixed="right">
        <template slot-scope="scope">{{ addTotal(scope.row) }}</template>
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
import { userLimit, compare } from "@/utils/common";
import {
  getTableHeadData,
  OutboundOrderReport,
  exportTableData
} from "@/api/index";
import { chunk } from "@/utils/index";
export default {
  data() {
    return {
      tableHeadData: [
        { fColumn: "fDate", fColumnDes: "报货日期", fDataType: "string" },
        {
          fColumn: "fProductCode",
          fColumnDes: "货品编码",
          fDataType: "string"
        },
        {
          fColumn: "fProductName",
          fColumnDes: "货品名称",
          fDataType: "string"
        },
        {
          fColumn: "fProductTypeName",
          fColumnDes: "货品类型",
          fDataType: "string"
        }
      ],
      searchData: [], //查询的数据
      searchWhere: [], //搜索条件
      fTableView: "t_OutboundOrderReport3",
      fTableViewData: "v_OutboundOrderReport3",
      currentRow: null, //当前行
      tableData: [], //表格数据
      pageNum: 1, // 当前页数
      pageSize: 10, // 每页条数
      total: 0, // 总条数
      asData: {},
      endData: {
        //-1
        fDate: updateTime(
          new Date(
            new Date(new Date().toLocaleDateString()).getTime() +
              24 * 60 * 60 * 1000
          )
        )
      },
      startData: {
        fDate: updateTime(new Date(new Date().toLocaleDateString()).getTime())
      },
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },

  methods: {
    addTotal(v) {
      let num = 0;
      for (let key in v) {
        if (
          key !== "fChengzhongNo" &&
          key !== "fDate" &&
          key !== "fProductCode" &&
          key !== "fProductName" &&
          key !== "fUnitName" &&
          key !== "fProductTypeName"
        ) {
          num += parseFloat(v[key] || 0);
        }
      }

      return num;
    },

    handleCurrentRow(val) {
      this.currentRow = val;
    },
    //查询
    async search() {
      if (!this.startData.fDate || !this.endData.fDate) {
        this.$message.warning("请选择要查询的分拣日期!");
      } else {
        this.pageNum = 1;
        return this.getTableData();
      }
    },
    //获取table表格内容数据
    async getTableData() {
      this.tableHeadData = [
        { fColumn: "fDate", fColumnDes: "报货日期", fDataType: "string" },
        {
          fColumn: "fProductCode",
          fColumnDes: "货品编码",
          fDataType: "string"
        },
        {
          fColumn: "fProductName",
          fColumnDes: "货品名称",
          fDataType: "string"
        },
        {
          fColumn: "fProductTypeName",
          fColumnDes: "货品类型",
          fDataType: "string"
        }
      ];
      this.searchCommon();
      let res = await await OutboundOrderReport(
        this.fTableViewData,
        this.fTableView,
        this.searchWhere,
        "fShopName",
        "fQty1",
        "sum"
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (!res.State) {
        return this.$message.error(res.Message);
      }
      let data = JSON.parse(res.Data)[0];
      for (let k in data) {
        if (
          k !== "fChengzhongNo" &&
          k !== "fDate" &&
          k !== "fProductCode" &&
          k !== "fProductName" &&
          k !== "fUnitName" &&
          k !== "fProductTypeName"
        ) {
          // let sort = k.slice(-5, -1);
          let sort = Number(k.match(/\d+/g).join(""));

          this.tableHeadData.push({
            fColumn: k,
            fColumnDes: k,
            fSort: sort,
            fDataType: "decimal"
          });
        } else {
          this.tableHeadData.forEach((item, index) => {
            this.$set(item, "fSort", index + 1);
          });
        }
      }

      this.tableHeadData.push({
        fColumn: "fUnitName",
        fColumnDes: "单位",
        fSort: 999999,
        fDataType: "string"
      });
      this.tableHeadData.sort(this.creatCompare("fSort"));
      this.tableData = JSON.parse(res.Data).reverse();
      this.total = this.tableData.length;
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
      let a = userLimit(val);
      return a;
    },

    //EXCEL导出
    async handerExport() {
      let headVal = [];
      let column = [];
      let arr = [];
      this.tableHeadData.forEach(item => {
        for (const key in item) {
          if (key == "fColumnDes") {
            headVal.push(item[key]);
          }
        }
        if (item.fDataType == "int") {
          item.fDataType = "decimal";
        }
        arr.push(item.fDataType);
        column.push(item.fColumn);
      });
      headVal.push("合计");
      arr.push("decimal");
      let NewTabeData = chunk(this.tableData, 1);
      let ItemArr = [];
      let allArr = [];
      let sum = 0;
      NewTabeData.forEach(v => {
        v.forEach(ele => {
          ItemArr = [];
          column.forEach(item => {
            for (const key in ele) {
              if (item == key) {
                ItemArr.push(ele[key]);
              }
            }
          });

          let sum = 0;
          ItemArr.forEach(item => {
            if (typeof item == "number") {
              sum += item;
            }
          });
          sum = sum.toFixed(3);
          ItemArr.push(sum);
          allArr.push(ItemArr);
        });
      });
      allArr.unshift(headVal);
      let res = await exportTableData({
        str: "报货统计表",
        dicData: [{ Key: "Sheet1", Value: allArr }],
        dicType: [{ Key: "Sheet1", Value: arr }]
      });

      if (!res) return;
      var blob = new Blob([res], {
        type: "application/vnd.ms-excel;charset=utf-8"
        //  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
      });
      var downloadElement = document.createElement("a");
      var href = window.URL.createObjectURL(blob); //创建下载的链接

      downloadElement.href = href;
      downloadElement.download = `${this.$route.meta.title}-详情.xlsx`; //下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); //点击下载
      document.body.removeChild(downloadElement); //下载完成移除元素
      window.URL.revokeObjectURL(href); //释放掉blob
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
              result = updateTime(result);
              // console.log(result);
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
          if (
            Ikey == key &&
            this.startData[key] != null &&
            this.endData[Ikey] != null
          ) {
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
          } else {
            startobj = {};
            endobj = {};
          }
        }
      }

      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }
    },
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let HeadData = res.lstRet.sort(compare);

        let searchArr = [];
        searchArr = HeadData.filter(element => {
          return element.fQureyCol == 1;
        });
        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        let arr = [];
        ColumnArr.forEach((element, index) => {
          HeadData.forEach((item, index) => {
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

    creatCompare(propertyName) {
      //根据哪个属性值排序
      return function(obj1, obj2) {
        //对象两两比较
        let value1 = obj1[propertyName];
        let value2 = obj2[propertyName];
        if (value1 < value2) {
          return -1;
        } else if (value1 > value2) {
          return 1;
        } else {
          return 0;
        }
      };
    }
  },
  async created() {
    this.getTableHeadData();
    let where = [
      { Computer: ">=", DataFile: "fDate", Value: this.startData.fDate },
      { Computer: "<=", DataFile: "fDate", Value: this.endData.fDate }
    ];
    let res = await OutboundOrderReport(
      this.fTableViewData,
      this.fTableView,
      where,
      "fShopName",
      "fQty1",
      "sum"
    );
    res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
    if (!res.State) {
      return this.$message.error(res.Message);
    }
    let data = JSON.parse(res.Data)[0];

    for (let k in data) {
      if (
        k !== "fChengzhongNo" &&
        k !== "fDate" &&
        k !== "fProductCode" &&
        k !== "fProductName" &&
        k !== "fUnitName" &&
        k !== "fProductTypeName"
      ) {
        // let sort = k.slice(-5, -1);
        let sort = Number(k.match(/\d+/g).join(""));

        this.tableHeadData.push({
          fColumn: k,
          fColumnDes: k,
          fSort: sort,
          fDataType: "decimal"
        });
      } else {
        this.tableHeadData.forEach((item, index) => {
          this.$set(item, "fSort", index + 1);
        });
      }
    }

    this.tableHeadData.push({
      fColumn: "fUnitName",
      fColumnDes: "单位",
      fSort: 999999,
      fDataType: "string"
    });
    this.tableHeadData.sort(this.creatCompare("fSort"));
    this.tableData = JSON.parse(res.Data).reverse();
    this.total = this.tableData.length;
  }
};
</script>
<style lang="scss" scoped>
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
.search-title {
  white-space: nowrap;
  margin-right: 20px;
  width: 29%;
  margin-top: 10px;
}
</style>
