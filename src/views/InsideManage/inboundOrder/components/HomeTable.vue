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
        <!-- 
        <el-button   
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
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-export"
          @click="handerExport"
          :disabled="userLimit('fExport')"
          >导出</el-button
        >
        <!-- <el-button
          v-if="isCheck"
          type="primary"
          size="mini"
          class="iconfont icon-yishenhe"
          @click="handleCheck"
          :disabled="userLimit('fApp')"
          >审核</el-button
        > -->
        <!-- <el-button
          v-if="isClose"
          type="primary"
          size="mini"
          class="el-icon-circle-close"
          @click="colseOrder"
          :disabled="userLimit('fClose')"
          >关闭</el-button
        > -->
        <!-- <el-button
          v-if="putawayData"
          type="primary"
          size="mini"
          class="el-icon-s-claim"
          @click="handleInboundFinsh"
          :disabled="userLimit('fApp')"
          >入库完成</el-button
        > -->
      </div>
    </div>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
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
          :width="item.width"
          sortable
          :column-key="item.fColumn"
        >
        </el-table-column>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="180">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
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
    <!-- 打印格式内容   -->
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
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import PrintTable from "./PrintTable";
import { tempUrl } from "@/utils/tempUrl";
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
  //printView:打印请求的字段  title:打印的表题  isCheck:已审核  strType:导入excel类型字段
  //putawayData:是否已上架完成   isClose:单据关闭(入库,盘点,出库)
  //"isCheck","isClose", 暂时隐藏
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isItem",
    "batchDelTableName",
    "isPrint",
    "printView",
    "title",
    "strType",
    "putawayData"
  ],
  components: {
    PrintTable
  },
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
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
      isShopRender: false,
      //搜索条件
      searchWhere: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      //批量
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
        this.tableHeadData.forEach(item => {
          if (
            item.fColumn == "fRelatedOrderNo" ||
            item.fColumn == "fCustomerName"
          ) {
            this.$set(item, "width", 240);
          } else if (item.fColumn == "fSupplierName") {
            this.$set(item, "width", 280);
          } else {
            this.$set(item, "width", 140);
          }
        });
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
      let res = await getTableBodyData(
        this.fTableViewData,
        this.searchWhere,
        this.pageNum,
        this.pageSize,
        "order by fCreateDate desc"
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res);
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
    //货品条码绑定
    handleBarCode() {
      this.$emit("openBarCode");
    },
    //装箱信息
    handleCarton() {
      this.$emit("openCarton");
    },
    //生成容器号
    handleContainer() {
      this.$emit("openContainer");
    },
    //上架拣货设置
    handleSeq() {
      this.$emit("openSeq");
    },
    //查询导出库位条码
    handleStorage() {
      this.$emit("openStorageCode");
    },

    //已审查,单据关闭,入库完成共用方法
    async billsFn(status, msg) {
      if (this.BatchList.length == 0) {
        this.$message.warning(`请选择要${msg}的数据!`);
      } else {
        this.BatchList.forEach(item => {
          this.$set(item, "fMstState", status);
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
    //已审查,
    handleCheck() {
      //this.billsFn(this.isCheck[1], "审核");
    },
    //单据关闭
    colseOrder() {
      // this.billsFn(this.isClose[1], "关闭");
    },
    //入库完成
    // async handleInboundFinsh() {
    //   this.billsFn(this.putawayData[1], "入库");
    // },

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
        // console.log(this.ItemTableHeadData, "打印字表的表头");
        this.ItemTableHeadData.forEach(item => {
          if (
            item.fColumn == "fbrand" ||
            item.fColumn == "fProductionDate" ||
            item.fColumn == "fPutonNum" ||
            item.fColumn == "fShelfLifeDays" ||
            item.fColumn == "fVolumet" ||
            item.fColumn == "fVolumetUnitName" ||
            item.fColumn == "fWeight" ||
            item.fColumn == "fWeightUnitName" ||
            item.fColumn == "fExpirationDate" ||
            item.fColumn == "fQpcstr" ||
            item.fColumn == "fRealAmt" ||
            item.fColumn == "fRemark" ||
            item.fColumn == "fAmount" ||
            item.fColumn == "fPrice"
          ) {
            this.$set(item, "fVisible", 0);
          }

          if (
            item.fColumn == "fProductName" ||
            item.fColumn == "fProductBarCode"
          ) {
            this.$set(item, "width", 180);
          } else if (
            item.fColumn == "fProductCode" ||
            item.fColumn == "fBatchNo"
          ) {
            this.$set(item, "width", 120);
          } else {
            this.$set(item, "width", 100);
          }
        });
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

        if (res.State) {
          this.dataCode = JSON.parse(res.Data);
        }
        this.isRender = true;
        setTimeout(() => {
          const style =
            "table td,th,tr {border: 1px #000 solid;font-size: 22px; text-align: center;page-break-inside:avoid; };";
          PrintJS({
            printable: "toPrint",
            type: "html",
            scanStyles: false,
            style: style
          });
        }, 300);
        setTimeout(() => {
          this.isRender = false;
        }, 400);
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
        // console.log(this.ItemBackData, "打印从表回显tableData内容");
        return data;
      }
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
  //缓存组件 钩子被激活
  // activated() {
  //   this.getTableData();
  // }
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
