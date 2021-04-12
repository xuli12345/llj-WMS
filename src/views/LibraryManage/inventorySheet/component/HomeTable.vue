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
          class="iconfont icon-xinzeng"
          @click="addPopRight"
          :disabled="userLimit('fAdd')"
          >新增</el-button
        >

        <!-- <el-button
          v-if="isItem"
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchFormsDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        > -->

        <el-button
          v-if="isPrint"
          type="primary"
          size="mini"
          class="iconfont icon-dayin1"
          @click="printCon()"
          :disabled="userLimit('fPrint')"
          >打印</el-button
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
      :row-key="getRowKeys"
      :data="tableData"
      @selection-change="handleSelectionChange"
      @row-dblclick="dblclick"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>

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
        </el-table-column>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="220">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              v-if="isItem"
              type="text"
              size="small"
              @click.stop="haveItemDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel') || scope.row.fMstState != 1"
              >删除</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row, scope.$index)"
              :disabled="userLimit('fEdit')"
              >修改</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="handleCheck(scope.row, scope.$index)"
              :disabled="userLimit('fApp') || scope.row.fMstState != 1"
              >审核</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="colseOrder(scope.row, scope.$index)"
              :disabled="userLimit('fClose') || scope.row.fMstState == 6"
              >关闭</el-button
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
    <!-- 打印格式内容  -->
    <div style="width:0;height:0;overflow:hidden">
      <print-table
        ref="print"
        id="toPrint"
        v-if="isRender"
        :dataCode="dataCode"
        :printHeadData="printHeadData"
        :ItemTableHeadData="ItemTableHeadData"
        :ItemBackData="ItemBackData"
        :title="title"
      ></print-table>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit } from "@/utils/common";
import PrintTable from "./PrintTable";
import { compare } from "@/utils/common";
import PrintJS from "print-js";
import {
  addformSaveData,
  ItemTableHeadData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  queryViewData,
  exportData
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  //printView:打印请求的字段  title:打印的表题 isCheck:已审核
  //putawayData:是否已上架完成   isClose:单据关闭(入库,盘点,出库)
  // openExcelDrawer:配送通知单(从excel导入窗口) OutboundPrint:出库单门店标签打印
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isItem",
    "batchDelTableName",
    "isPrint",
    "product",
    "containerNum",
    "printView",
    "title",
    "storage",
    "isCheck",
    "strType",
    "isClose",
    "putawayData",
    "OutboundPrint"
  ],
  components: {
    PrintTable
  },
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      searchData: [],
      tableHeadData: [],
      tableData: [],
      printHeadData: [],
      dataCode: [],
      ItemTableHeadData: [],
      searchWhere: [],
      ItemBackData: [],
      BatchList: [],
      isRender: false,
      isShopRender: false,
      fTableViewData: "",
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
        // console.log(ColumnArr, "搜索的字段");
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
    //获取table表格内容数据
    async getTableData() {
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];
            if (result instanceof Date) {
              result = timeCycle(result);
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
        console.log(this.tableData, "表体内容");
      }
      this.total = res.TTLPage;
    },
    //新增
    addPopRight() {
      this.$emit("openDrawer", this.tableHeadData);
    },
    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },

    //已审查,单据关闭,入库完成共用方法
    async billsFn(status, msg, rowData) {
      this.$set(rowData, "fMstState", status);
      this.$set(rowData, "fState", status);
      let result = batchDelete(this.tableHeadData, [rowData]);
      let res = await addformSaveData([
        {
          lstSaveData: [
            {
              TableName: this.tableName,
              IdentityColumn: null,
              InsertRow: null,
              UpdateRow: result.arr,
              DeleteRow: null,
              Columns: result.columns
            }
          ]
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.$message.success(`${msg}成功!`);
        this.getTableData();
      } else {
        this.$message.error(res.Message);
      }
    },
    //已审查,
    async handleCheck(row, index) {
      let backData = await this.getHomeData(row.fID);
      if (backData[0].fMstState == 7) {
        this.$message.warning("此数据已审核,请重新查询数据!");
      } else {
        this.billsFn(this.isCheck[1], "审核", row);
      }
    },
    //单据关闭
    async colseOrder(row, index) {
      let backData = await this.getHomeData(row.fID);
      if (backData[0].fMstState == 6) {
        this.$message.warning("此数据已关闭,请重新查询数据!");
      } else {
        this.billsFn(this.isClose[1], "关闭", row);
      }
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },

    //删除从表
    BatchFormsDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            let objectArr = [];
            this.BatchList.forEach(item => {
              let obj = [
                {
                  Key: "fID",
                  Value: item.fID
                }
              ];
              objectArr.push(obj);
            });

            let res = await BathcDeleteData([
              {
                MstItemKey: this.batchDelTableName,
                MstKeyValue: objectArr,
                MstTableView: this.fTableView
              },
              { userDes: this.userDes, userId: this.userId }
            ]);

            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("删除成功!");
              this.getTableData();
            } else {
              this.$message.error(res.errstr);
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },
    //修改
    handleEdit(row, index) {
      this.$emit("openEditDrawer", row, this.tableHeadData);
    },
    async getHomeData(id) {
      let where = [
        {
          Computer: "in",
          DataFile: "fID",
          Value: id
        }
      ];
      let res = await getTableBodyData(this.fTableViewData, where);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        return result;
      }
    },
    //有从表数据的删除
    async haveItemDelete(row, index) {
      let RowData = JSON.parse(JSON.stringify(row));
      let backData = await this.getHomeData(RowData.fID);
      let status = backData.every(item => {
        return item.fMstState == 1;
      });
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          if (!status) {
            this.$message.warning(
              "此数据不能进行删除操作,请重新查询数据选择状态为初始的数据!"
            );
          } else {
            let objectArr = [];
            let obj = [
              {
                Key: "fID",
                Value: RowData.fID
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

            if (res.State) {
              this.$message.success("删除成功!");
              this.getTableData();
            } else {
              this.$message.error(res.errstr);
            }
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
      let res = await getTableHeadData(this.printView[3]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.ItemTableHeadData = res.lstRet.sort(compare);
        this.ItemTableHeadData.forEach(item => {
          if (item.fColumn == "fItemStateName" || item.fColumn == "fRemark") {
            this.$set(item, "fVisible", 0);
          }
          if (
            item.fColumn == "fProductName" ||
            item.fColumn == "fBatchNo" ||
            item.fColumn == "fProductBarCode" ||
            item.fColumn == "fStorageCode"
          ) {
            this.$set(item, "width", 180);
          } else {
            this.$set(item, "width", 120);
          }
        });
        // console.log(this.ItemTableHeadData, "打印字表的表头");
      }
    },
    async printCon() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请勾选您要打印的数据!");
      } else {
        let searchWhere = [];
        for (let i = 0; i < this.BatchList.length; i++) {
          let vData = this.BatchList[i];
          let getdata = await this.getSearchItemData(vData.fID);
          this.ItemBackData.push(getdata);

          let obj = {
            Computer: "=",
            DataFile: "fID",
            Value: vData.fID
          };
          searchWhere.push(obj);
        }
        let res = await queryViewData(this.printView[1], searchWhere);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        // console.log(res);
        if (res.State) {
          this.dataCode = JSON.parse(res.Data);
        }
        this.isRender = true;
        setTimeout(() => {
          const style =
            "table td,th,tr {border: 1px #000 solid;font-size: 22px; text-align: center;page-break-inside:avoid}; ";
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
      }
    },

    //获取从表回显的数据
    async getSearchItemData(fID) {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: fID
        }
      ];
      let res = await getTableBodyData(this.printView[2], searchWhere);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let data = JSON.parse(res.Data);
        data.forEach((item, index) => {
          for (const key in item) {
            if (JSON.stringify(item[key]).indexOf("/Date") != -1) {
              item[key] = updateTime(item[key]);
            }
          }
        });
        // console.log(this.ItemBackData, "打印从表回显tableData内容");
        return data;
      }
    }
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      // console.log(newVal, oldVal);
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
