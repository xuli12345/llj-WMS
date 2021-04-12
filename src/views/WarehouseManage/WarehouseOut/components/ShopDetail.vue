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
              style="margin-left: 0px"
              v-model.trim="endData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
        </el-row>
        <!-- 需要使用下拉选择框的 -->
        <template
          v-else-if="
            homeSelArr && homeSelArr.length > 0 && selectFunction(item.fColumn)
          "
        >
          <el-select
            filterable
            clearable
            v-model="asData[item.fColumn]"
            @change="getVal(asData[item.fColumn], item.fColumn)"
          >
            <el-option
              :value="i[selectStr(item.fColumn)]"
              v-for="i in selectData(item.fColumn)"
              :key="i[selectVal(item.fColumn)]"
              :label="i[selectStr(item.fColumn)]"
            ></el-option>
          </el-select>
        </template>
        <el-input
          v-else
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
        ></el-input>
      </div>
      <div style="margin-top: 10px">
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
          class="iconfont icon-dayin1"
          @click="printDetail()"
          :disabled="userLimit('fPrint')"
          >打印</el-button
        >
        <!-- <el-button
          type="primary"
          size="mini"
          class="iconfont icon-export"
          @click="handerExport"
          :disabled="userLimit('fExport')"
          >导出</el-button
        > -->
      </div>
    </div>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%"
      :data="tableData | pagination(pageNum, pageSize)"
      :row-key="getRowKeys"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="140"
          sortable
          :column-key="item.fColumn"
        >
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
    <!-- 打印配送明细标签    -->
    <div style="width: 0; height: 0; overflow: hidden">
      <ShopDetail
        v-if="isRender"
        ref="toPrint"
        :dataCode="dataCode"
        :printHeadData="tableHeadData"
        :chayiData="chayiData"
        id="toPrint"
      ></ShopDetail>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import ShopDetail from "./PrintDetail";
import PrintJS from "print-js";
import {
  getTableBodyData,
  getTableHeadData,
  exportData,
  getchayiData
} from "@/api/index";
import ShopTableVue from '../../../RouteManage/LineDetail/components/ShopTable.vue';
export default {
  //fTableView:请求列头 tableName:保存
  props: ["fTableView", "tableName", "homeSelArr"],
  components: {
    ShopDetail
  },
  data() {
    return {
      getRowKeys(row) {
        return row.fShopCode;
      },
      isRender: false,
      searchData: [],
      tableHeadData: [],
      dataCode: [],
      selectAllData: [],
      searchWhere: [],
      BatchList: [],
      fTableViewData: "",
      tableData: [],
      chayiData: [],
      pageNum: 1,
      pageSize: 10,
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
    handleSelectionChange(val) {
      this.BatchList = val;
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
      let orderBy = "";
      // console.log(this.searchWhere);
      let status = false;
      if (this.searchWhere.length > 0) {
        this.searchWhere.forEach(item => {
          if (item.DataFile == "fJobID") {
            status = true;
          }
        });
      }
      if (this.searchWhere.length == 0) {
        this.$message.warning("请选择要查询的配货作业号!");
      } else if (!status) {
        this.$message.warning("请选择要查询的配货作业号!");
      } else {
        let res = await getTableBodyData(
          this.fTableViewData,
          this.searchWhere,
          0,
          0,
          orderBy,
          "distinct fShopCode,fShopName,fRouteName"
        );
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

        if (res.State) {
          this.tableData = JSON.parse(res.Data);
          console.log(this.tableData, "表体内容");
          this.total = this.tableData.length;
        }
      }

      // this.total = res.TTLPage;
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
    async printDetail() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要打印的门店");
      } else {
        let shopCodeArr = [];
        this.BatchList.forEach(item => {
          shopCodeArr.push(item.fShopCode);
        });
        let str = shopCodeArr.join();
        // console.log(shopCodeArr, str);
        let where = [{ Computer: "in", DataFile: "fShopCode", Value: str }];
        let res = await getTableBodyData(
          this.fTableViewData,
          where,
          0,
          0,
          "order by fProductType,fBoxBar,fOrgBillNo"
        );
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let result = JSON.parse(res.Data);
          let arr = [];
          result.forEach(item => {
            arr.push(item.fOrgBillNo);
          });

          arr = [...new Set(arr)];
          console.log(arr);
          //根据门店分割数组
          let shopCategory = this.chaifenShop(result);
          shopCategory=shopCategory.sort();
          //判断是否存在来源单号
          if (arr.length > 0) {
            let res1 = await this.getChayi(arr);
            console.log(res1);
            if (res1.State) {
              this.chayiData = JSON.parse(res1.Data);
            }
            let allData = [];
            for (let j = 0; j < shopCategory.length; j++) {
              if (shopCategory[j].length >36) {
                chunkArr = chunk(shopCategory[j], 36);
                // console.log(chunkArr);
                for (let j = 0; j < chunkArr.length; j++) {
                  this.$set(chunkArr[j], "areTotal", chunkArr.length);
                  this.$set(chunkArr[j], "areIndex", j + 1);
                }
                allData.push(...chunkArr);
              } else {
                this.$set(shopCategory[j], "areTotal", 1);
                this.$set(shopCategory[j], "areIndex", 1);
                allData.push(shopCategory[j]);
              }
            }
            this.dataCode = allData;
            console.log(this.dataCode);
            this.isRender = true;
            const style =
              "table td,th,tr {border: 1px #000 solid;font-size: 16px; text-align: center;table-layout: fixed;word-break: break-all; word-wrap:break-word;page-break-inside:avoid}; ";
            setTimeout(() => {
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
          } else {
            this.$message.error(res1.Message);
          }
        } else {
          this.$message.error(res.Message);
        }
      }
    },
    chaifenShop(arr) {
      let map = {};
      for (let i = 0; i < arr.length; i++) {
        let ai = arr[i];
        if (!map[ai.fShopCode]) {
          map[ai.fShopCode] = [ai];
        } else {
          map[ai.fShopCode].push(ai);
        }
      }
      let res = [];
      Object.keys(map).forEach(key => {
        res.push(map[key]);
      });

      return res;
    },
    //获取差异数量
    async getChayi(fOrgBillNo) {
      let res = await getchayiData(fOrgBillNo);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      return res;
    },

    //EXCEL导出
    async handerExport() {
      this.searchCommon();
      let res = await exportData(
        this.fTableViewData,
        this.searchWhere,
        this.tableName
      );
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
    //判断当前字段是否需要做下拉框 v表头所有的字段
    selectFunction(v) {
      // console.log(v);
      let cc = false;
      this.homeSelArr.forEach(element => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
    },
    // 获取所有需要下拉选择的内容
    async getSelectData() {
      let arr = [];

      let searchWhere = [];
      for (let i = 0; i < this.homeSelArr.length; i++) {
        let res;
        if (this.homeSelArr[i].searchWhere) {
          searchWhere = this.homeSelArr[i].searchWhere;
          res = await getTableBodyData(this.homeSelArr[i].fUrl, searchWhere);
        } else if (this.homeSelArr[i].fUrl == "v_DistributeJob_Mst") {
          searchWhere = [];
          res = await getTableBodyData(
            this.homeSelArr[i].fUrl,
            searchWhere,
            0,
            0,
            "order by fCreateDate desc"
          );
        } else {
          searchWhere = [];
          res = await getTableBodyData(this.homeSelArr[i].fUrl, searchWhere);
        }
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let obj = {
            fName: this.homeSelArr[i].fName, //当前字段
            data: JSON.parse(res.Data) //当前字段下拉框的值
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }

      this.selectAllData = arr;
    },
    // 下拉选择框选中值后，带出其他需要带出的值
    getVal(val, n) {
      console.log(val, n);
      //当前选择框对应的数据
      let arr = [];
      this.selectAllData.forEach(ele => {
        if (ele.fName == n) {
          arr = ele.data;
        }
      });
      //选中值后对应的单条数据
      let data = {};
      arr.forEach(el => {
        if (el.fID == val) {
          data = el;
        }
      });
    },
    // options下拉选择框的内容
    selectData(v) {
      let arr = [];
      this.selectAllData.forEach(ele => {
        if (ele.fName == v) {
          arr = ele.data;
        }
      });

      return arr;
    },
    //下拉选择框需要显示的label字段
    selectStr(v) {
      let str = "";
      this.homeSelArr.forEach(element => {
        if (element.fName == v) {
          str = element.fDes;
        }
      });
      return str;
    },
    //下拉选择框选择的值
    selectVal(v) {
      let str = "";
      this.homeSelArr.forEach(element => {
        if (element.fName == v) {
          str = element.fID;
        }
      });
      return str;
    }
  },

  created() {
    this.getTableHeadData();
    if (this.homeSelArr && this.homeSelArr.length > 0) {
      this.getSelectData();
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
