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
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model.trim="asData[item.fColumn]"
          type="date"
          placeholder="选择日期时间"
          min-width="300"
        ></el-date-picker>
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
          class="el-icon-setting"
          @click="reset"
          >重置</el-button
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
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchFormsDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        > -->

        <el-button
          v-if="importExcel"
          type="primary"
          size="mini"
          class="iconfont icon-export"
          @click="handerExport"
          :disabled="userLimit('fExport')"
          >导出</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-dayin1"
          @click="printCon()"
          :disabled="userLimit('fPrint')"
          >打印</el-button
        >
        <el-button
          v-if="isDownLoad"
          type="primary"
          class="el-icon-bottom"
          @click="downloadTemp"
          size="mini"
          >下载模板</el-button
        >
        <el-upload
          v-if="isDownLoad"
          style="margin-left: 15px; float: right"
          ref="upload"
          class="upload"
          action=""
          :on-change="handleChange"
          :on-remove="handleRemove"
          :auto-upload="false"
          :show-file-list="false"
          accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        >
          <el-button
            type="primary"
            class="iconfont icon-excel"
            size="mini"
            :disabled="userLimit('fInport')"
            >导入excel</el-button
          >
        </el-upload>
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

      <el-table-column fixed="right" label="操作" align="center" width="220">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              v-if="isItem"
              type="text"
              size="small"
              @click.stop="haveItemDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel') || scope.row.fState != checkState"
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
              @click="handerInvalid(scope.row, scope.$index)"
              :disabled="scope.row.fState != checkState"
              >作废</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 统计 -->
    <div class="page flex-justify-start" style="color:#333">
      <p style="width:25%">总数量:{{ allNum }}</p>
      <p style="width:25%">总金额:{{ allAmount }}</p>
    </div>
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
    <!--  :ItemTableHeadData="ItemTableHeadData" -->
    <div style="width: 0; height: 0; overflow: hidden">
      <print-table
        v-if="isRender"
        ref="print"
        id="toPrint"
        :dataCode="dataCode"
        :printHeadData="printHeadData"
        :title="title"
      ></print-table>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { chunk } from "@/utils/index"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import PrintTable from "./PrintTable";
import PrintJS from "print-js";
import {
  addformSaveData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  imPortExcel,
  exportData
} from "@/api/index";
export default {
  components: {
    PrintTable
  },
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  // isCheck:已审核  strType:导入excel类型字段 checkState:主表状态
  //  importExcel:excel导出    Invalid:作废  isDownLoad:是否下载
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isItem",
    "batchDelTableName",
    "isCheck",
    "strType",
    "importExcel",
    "Invalid",
    "isDownLoad",
    "checkState",
    "homeSelArr"
  ],

  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      isRender: false,
      fTableViewData: "",
      pageNum: 1,
      pageSize: 10,
      total: 0,
      endData: {},
      startData: {},
      //excel
      fileTemp: null,
      selectAllData: [],
      BatchList: [],
      searchData: [],
      tableHeadData: [],
      searchWhere: [],
      tableData: [],
      dataCode: [],
      printHeadData: [],
      allNum: 0,
      allAmount: 0,
      title: "老邻居配送中心发货单",
      asData: { fOrderNo: new Date().getFullYear() },
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
          if (item.fColumn == "fOrgBillNo") {
            this.$set(item, "width", 240);
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
        this.pageSize
        // "order by fCreateDate desc"
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        console.log(this.tableData, "表体内容");
        let num = 0;
        let amount = 0;
        this.tableData.forEach(item => {
          if (item.fQty == null) {
            this.$set(item, "fQty", 0);
          }
          if (item.fAmount == null) {
            this.$set(item, "fAmount", 0);
          }
          num += Number(item.fQty);
          amount += Number(item.fAmount);
        });

        this.allNum = num.toFixed(4);
        this.allAmount = amount.toFixed(4);
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

    //作废方法
    async billsFn(status, msg, row) {
      this.$set(row, "fMstState", status);
      this.$set(row, "fState", status);
      let result = batchDelete(this.tableHeadData, [row]);
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

    //作废
    async handerInvalid(row, index) {
      let backData = await this.getHomeData(row.fID);
      if (backData[0].fState == this.isCheck[2]) {
        this.$message.warning("此数据已作废,请重新查询数据!");
      } else {
        this.billsFn(this.isCheck[2], "作废", row);
      }
    },
    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },

    //批量删除
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
    // excel导入
    handleChange(file, fileList) {
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        if (
          this.fileTemp.type ==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          this.fileTemp.type == "application/vnd.ms-excel"
        ) {
          this.importFile(this.strType, this.fileTemp);
        } else {
          this.$message({
            type: "warning",
            message: "附件格式错误，请删除后重新上传！"
          });
        }
      } else {
        this.$message({
          type: "warning",
          message: "请上传附件！"
        });
      }
    },

    handleRemove(file, fileList) {
      this.fileTemp = null;
    },
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Goods")) {
        window.location.href = `${tempUrl}/ImportTempModFile/货品导入模板.xlsx`;
      } else if (this.strType.includes("PGAlcntc")) {
        window.location.href = `${tempUrl}/ImportTempModFile/配货通知单导入模板.xlsx`;
      }
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });

      if (res.state) {
        this.$message.success("导入成功!");
        this.getTableData();
      } else {
        this.$message.error(res.message);
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
    },
    chaifenArr(arr) {
      let map = {};

      for (let i = 0; i < arr.length; i++) {
        let ai = arr[i];
        if (!map[ai.fID]) {
          map[ai.fID] = [ai];
        } else {
          map[ai.fID].push(ai);
        }
      }
      let res = [];
      Object.keys(map).forEach(key => {
        res.push(map[key]);
      });

      return res;
    },
    chaifenAare(arr) {
      let map = {};
      for (let i = 0; i < arr.length; i++) {
        let ai = arr[i];
        if (!map[ai.fAreaName]) {
          map[ai.fAreaName] = [ai];
        } else {
          map[ai.fAreaName].push(ai);
        }
      }
      let res = [];
      Object.keys(map).forEach(key => {
        res.push(map[key]);
      });

      return res;
    },
    async printCon() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请勾选您要打印的数据!");
      } else {
        let searchWhere = [];
        let arr = [];
        this.BatchList.forEach(item => {
          arr.push(item.fID);
        });
        let selID = arr.join();
        let obj = {
          Computer: "in",
          DataFile: "fID",
          Value: selID
        };
        searchWhere.push(obj);
        //获取打印的表头信息
        let res = await getTableBodyData(
          "v_DistributeNotice_print",
          searchWhere,
          0,
          0,
          "order by f1,f2,f3,f4"
        );
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

        if (res.State) {
          let result = JSON.parse(res.Data);
          let storageIsNull = result.filter(item => {
            return item.fStorageCode == null;
          });
          let storageIsNotNull = result.filter(item => {
            return item.fStorageCode != null;
          });
          let mergeData = [...storageIsNotNull, ...storageIsNull];
          this.dataCode = this.chaifenArr(mergeData);
          console.log(this.dataCode, "分单");

          let arrData = [];
          let chunkArr = [];

          for (let i = 0; i < this.dataCode.length; i++) {
            let onesData = this.chaifenAare(this.dataCode[i]);

            arrData.push(...onesData);
          }

          console.log(arrData,"根据区域分单");
          let allData = [];

          for (let j = 0; j < arrData.length; j++) {
            if (arrData[j].length > 36) {
              chunkArr = chunk(arrData[j], 36);
              // console.log(chunkArr);
              for (let j = 0; j < chunkArr.length; j++) {
                this.$set(chunkArr[j], "areTotal", chunkArr.length);
                this.$set(chunkArr[j], "areIndex", j + 1);
              }
              allData.push(...chunkArr);
            } else {
              this.$set(arrData[j], "areTotal", 1);
              this.$set(arrData[j], "areIndex", 1);
              allData.push(arrData[j]);
            }
          }
          // console.log(allData);

          this.dataCode = allData;

          this.isRender = true;
          const style =
            "table td,th,tr {border: 1px #000 solid;font-size: 20px; text-align: center;table-layout: fixed;word-break: break-all; word-wrap:break-word;page-break-inside:avoid}; ";
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
          this.$message.errstr(res.Message);
        }
      }
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
    },
    reset() {
      this.asData = {};
    },
    //获取打印表头的数据
    async getPrintHeadData() {
      let res = await getTableHeadData("t_DistributeNotice_print");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.printHeadData = res.lstRet.sort(compare);
        // console.log(this.printHeadData, "this.printHeadData");
        // || item.fColumn == "fProductCode"
        this.printHeadData.forEach(item => {
          if (item.fColumn == "fProductBarcode") {
            this.$set(item, "width", 180);
          } else if (item.fColumn == "fProductName") {
            this.$set(item, "width", 375);
          } else if (item.fColumn == "fStorageCode") {
            this.$set(item, "width", 140);
          } else if (
            item.fColumn == "fAreaName" ||
            item.fColumn == "fPackQty" ||
            item.fColumn == "fQty"
          ) {
            this.$set(item, "width", 65);
          } else if (item.fColumn == "fRealQty") {
            this.$set(item, "width", 75);
          } else if (item.fColumn == "fUnitName") {
            this.$set(item, "width", 50);
          } else {
            this.$set(item, "width", 100);
          }
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
    this.getPrintHeadData();
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
