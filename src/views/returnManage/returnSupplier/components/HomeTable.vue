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
          v-if="!isItem"
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        >
        <el-button
          v-if="isItem"
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchFormsDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        >-->

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
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%"
      :row-key="getRowKeys"
      :data="tableData"
       v-fit-columns
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
          <template slot-scope="scope">
            <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 1 ? true : false"
              disabled
            ></el-checkbox>

            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="220">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              v-if="!isItem"
              type="text"
              size="small"
              @click.stop="handleDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel') || scope.row.fState != 1"
              >删除</el-button
            >
            <el-button
              v-if="isItem"
              type="text"
              size="small"
              @click.stop="haveItemDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel') || scope.row.fState != 1"
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
              :disabled="userLimit('fApp') || scope.row.fState == 2"
              >审核</el-button
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
    <!-- 打印格式内容    -->
    <!-- rowData 选择的表格数据（主表数据） -->
    <div style="width:0;height:0;overflow:hidden">
      <print-table
        v-if="isRender"
        ref="print"
        id="toPrint"
        :dataCode="dataCode"
        :rowData="rowData"
        :ItemTableHeadData="ItemTableHeadData"
        :title="title"
      ></print-table>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import PrintTable from "./PrintTable";
import PrintJS from "print-js";
import {
  addformSaveData,
  ItemTableHeadData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  queryViewData,
  imPortExcel,
  exportData,
  saveOutStockData
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  //printView:打印请求的字段  title:打印的表题 isCheck:已审核
  //   isClose:单据关闭(入库,盘点,出库)
  //isDownLoad:是否下载    OutboundPrint:出库单门店标签打印
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isItem",
    "batchDelTableName",
    "isPrint",
    "printView",
    "title",
    "isCheck",
    "isClose",
    "OutboundPrint"
  ],
  components: {
    PrintTable
  },
  data() {
    return {
      tableHeight: document.body.clientHeight,
      //查询的数据
      searchData: [],
      tableHeadData: [], //表头数据
      //打印主表内容数据
      dataCode: [],
      //打印字表表头数据
      ItemTableHeadData: [],
      isRender: false,
      //搜索条件
      searchWhere: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      //批量
      BatchList: [],
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
      asData: {},
      endData: {},
      startData: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      user: this.$store.state.user.userInfo,
      sqlConn: sessionStorage.getItem("sqlConn"),
      newArr: [],
      rowData: [],
      ItemHeadData: [],
      ItemBackTableData: []
    };
  },
  methods: {
    //根据条件禁用复选框
    selectable(row, index) {
      // console.log(row, index);
      // console.log(this.checkState)
      if (row.fState != 1) {
        return false;
      } else {
        return true;
      }
    },
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

    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
      } else if (item[val] == 1) {
        item[val] = 0;
      }
    },


  
    //查询
    search() {
      this.pageNum=1
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
    async billsFn(status, msg) {
      if (this.BatchList.length == 0) {
        this.$message.warning(`请选择要${msg}的数据!`);
      } else {
        this.BatchList.forEach(item => {
          this.$set(item, "fState", status);
          this.$set(item, "fState", status);
        });
        let result = batchDelete(this.tableHeadData, this.BatchList);
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
      }
    },
    //获取从表表头数据
    async getItemTableHeadData() {
      let addFcolumn = [
        {
          fColumn: "fItemState",
          fColumnDes: "fItemState",
          fDataType: "int",
          fVisible: 0
        },
        {
          fColumn: "fReviewNum",
          fColumnDes: "fReviewNum",
          fDataType: "int",
          fVisible: 0
        },
        {
          fColumn: "fReviewUser",
          fColumnDes: "fReviewUser",
          fDataType: "int",
          fVisible: 0
        },
        {
          fColumn: "fPickUser",
          fColumnDes: "fPickUser",
          fDataType: "int",
          fVisible: 0
        }
      ];
      let res = await getTableHeadData("t_RetSupply_item");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.ItemHeadData = res.lstRet.sort(compare);
        this.ItemHeadData = [...this.ItemHeadData, ...addFcolumn];
        console.log(this.ItemHeadData, "字表表头");
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取退货单从表回显的数据
    async getItemBackTableData(row) {
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: row.fID
        }
      ];
      let res = await getTableBodyData("t_RetSupply_item", searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.ItemBackTableData = JSON.parse(res.Data);
        console.log(this.ItemBackTableData, "eieiie");
      }
    },
    //已审查,
    handleCheck(row, index) {
      this.getItemBackTableData(row);
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      // this.billsFn(this.isCheck[1], "审核");
      setTimeout(async () => {
        this.ItemBackTableData.forEach(item => {
          if (item.fQty == null) {
            this.$set(item, "fQty", 0);
          }
          this.$set(item, "fItemState", 3);
          //接口有问题默认写死数据用于测试
          //fReviewNum 复核数量 fReviewUser 复核人  fPickUser拣货人
          this.$set(item, "fReviewNum", item.fQty);
          this.$set(item, "fReviewUser", userInfo.userId);
          this.$set(item, "fPickUser", userInfo.userId);
        });
        let result = batchDelete(this.ItemHeadData, this.ItemBackTableData);
        let res = await saveOutStockData([
          {
            lstSaveData: [
              {
                TableName: "t_RetSupply_item",
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
        console.log(res);
      }, 500);
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },
    //批量删除
    BatchDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        let result = batchDelete(this.tableHeadData, this.BatchList);
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            let res = await addformSaveData([
              {
                lstSaveData: [
                  {
                    TableName: this.tableName,
                    IdentityColumn: null,
                    InsertRow: null,
                    UpdateRow: null,
                    DeleteRow: result.arr,
                    Columns: result.columns
                  }
                ]
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
    //删除
    handleDelete(row, index) {
      let currentRow = JSON.parse(JSON.stringify(row));
      let resultData = addParams(this.tableHeadData, row);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let res = await addformSaveData([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: null,
                  InsertRow: null,
                  UpdateRow: null,
                  DeleteRow: [resultData.arr],
                  Columns: resultData.columns
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
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
    //有从表数据的删除
    haveItemDelete(row, index) {
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
    //获取打印字表表头的数据
    async getPrintItemHeadData() {
      let res = await getTableHeadData("t_RetSupply_item");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.ItemTableHeadData = res.lstRet.sort(compare);
        // this.ItemTableHeadData.forEach(item => {
        //   if (
        //     item.fColumn == "fbrand" ||
        //     item.fColumn == "fReviewNum" ||
        //     item.fColumn == "fReviewUser" ||
        //     item.fColumn == "fShelfLifeDays" ||
        //     item.fColumn == "fPickCode" ||
        //     item.fColumn == "fPickUser" ||
        //     item.fColumn == "fPickCode" ||
        //     item.fColumn == "fVolumet" ||
        //     item.fColumn == "fVolumetUnitName" ||
        //     item.fColumn == "fReviewCode"
        //   ) {
        //     this.$set(item, "fVisible", 0);
        //   }
        // });
      }
    },
    async printCon() {
      this.dataCode = [];
      if (this.BatchList.length == 0) {
        this.$message.warning("请勾选您要打印的数据!");
      } else {
        let bL = this.BatchList.length;
        for (let i = 0; i < bL; i++) {
          let where = [
            {
              Computer: "=",
              DataFile: "fMstID",
              Value: this.BatchList[i].fID
            }
          ];
          let res = await getTableBodyData("v_RetSupply_item", where);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            let data = JSON.parse(res.Data);
            data = data.map(item => {
              if (item.fProdDate) {
                item.fProdDate = updateTime(item.fProdDate);
              }
              if (item.fExpireDate) {
                item.fExpireDate = updateTime(item.fExpireDate);
              }
              return item;
            });
            this.dataCode.push(data);
          } else {
            this.$message.error(res.Message);
            return;
          }
        }
        this.rowData = this.BatchList;
        this.isRender = true;
        setTimeout(() => {
          PrintJS({
            printable: "toPrint",
            type: "html",
            scanStyles: false,
            style:
              "table td,th {border: 1px #000 solid;font-size: 22px; text-align: center; table-layout: fixed;word-break: break-all; word-wrap:break-word;min-width:130px}; "
          });
        }, 500);
        setTimeout(() => {
          this.isRender = false;
        }, 600);
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
    this.getItemTableHeadData();
    if (this.isPrint) {
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
