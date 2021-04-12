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
          :default-value="defaultValue"
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
            clearable
            filterable
            v-model="asData[item.fColumn]"
            @change="getVal(asData[item.fColumn], item.fColumn)"
            @focus.stop.prevent="handleFocus(item.fColumn)"
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
          v-else-if="item.fColumn == 'fChengzhongNo'"
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
          @focus.stop.prevent="handleFocus(item.fColumn)"
        ></el-input>
        <el-input
          v-else
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
        ></el-input>
      </div>
      <!--  :disorder="true" -->
      <number-keyboard
        :isInteger="true"
        v-model="isShowKeyboard"
        @confirm="save"
        @keyDown="verInput"
        @delete="handleDelete"
      ></number-keyboard>
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
          v-if="!NoSorting"
          type="primary"
          size="mini"
          class="iconfont icon-dayin1"
          @click="printCon()"
          :disabled="userLimit('fPrint')"
          >打印</el-button
        >
        <el-button
          v-if="NoSorting"
          type="primary"
          size="mini"
          class="iconfont icon-dayin1"
          @click="locationTaskAssign()"
          >跳转到任务分配</el-button
        >
        <!-- 
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchFormsDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        >-->

        <!-- <el-button
          type="primary"
          size="mini"
          class="iconfont icon-export"
          @click="handerExport"
          :disabled="userLimit('fExport')"
          >导出</el-button
        >-->
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
          min-width="160px"
          sortable
          :column-key="item.fColumn"
        >
          <template slot-scope="scope">
            <div v-if="item.fColumn == 'fMstIsEnd'">
              {{ scope.row[item.fColumn] == 1 ? "是" : "否" }}
            </div>
            <div v-else-if="item.fColumn == 'fState'">
              {{ scope.row[item.fColumn] == 1 ? "是" : "否" }}
            </div>
            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="220">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="warning"
              size="mini"
              @click.stop="haveItemDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel') || scope.row.fState == 1"
              >删除</el-button
            >
            <!-- || scope.row.fMstIsEnd == 1 -->
            <el-button
              type="warning"
              size="mini"
              @click="handleEdit(scope.row, scope.$index)"
              :disabled="userLimit('fEdit')"
              >修改</el-button
            >
           
            <el-button
              v-if="!NoSorting"
              type="warning"
              size="mini"
              @click="handleCheck(scope.row, scope.$index)"
              :disabled="userLimit('fApp') || scope.row.fMstIsEnd == 1"
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
    <!-- 打印格式内容   -->
    <div style="width:0;height:0;overflow:hidden">
      <print-table
        ref="print"
        id="toPrint"
        v-if="isRender"
        :dataCode="dataCode"
        :BatchList="BatchList"
      ></print-table>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
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
  exportData,
  getOrderNo,
  collectionData,
  saveCollection
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  //  isCheck:已审核
  //)  importExcel:excel导出    homeSelArr:搜索框需要做下拉框的字段
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "batchDelTableName",
    "isCheck",
    "homeSelArr"
  ],
  components: {
    PrintTable
  },
  data() {
    return {
      defaultValue: updateTime(new Date()),
      //查询的数据
      searchData: [],
      //表头数据
      tableHeadData: [],
      ItemTableHeadData: [],
      Item1HeadData: [],
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
      asData: {
        fCreateDate: updateTime(new Date())
      },
      endData: {},
      startData: {},
      newArr: [],
      //excel
      fileTemp: null,
      selectAllData: [],
      ruleForm: {
        fID: 0,
        fOrderNo: "",
        fShopID: "",
        fShopName: "",
        fOrgBillNo: "",
        fDistributeType: "门店报货单",
        fConsignorID: 1,
        fConsignorName: "招远金都百货有限公司总部",
        fState: 2,
        fStateName: "初始",
        fCreater: this.$store.state.user.userInfo.userId,
        fCreateDate: new Date()
      },
      isShowKeyboard: false, // 是否展示输入验证码的键盘
      code: "",
      column: "",
      hrCode: "",
      isRender: false,
      noticeMstHeadData: [],
      noticeItemHeadData: [],
      tableHeight: document.body.clientHeight,
      NoSorting: this.$store.state.common.pickState,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  methods: {
    locationTaskAssign() {
      this.$router.push({ path: "/InvoiceManage/TaskAssign/TaskAssign" });
    },
    // 确定
    save() {
      this.isShowKeyboard = false;
    },
    // 验证码输入
    verInput(key) {
      console.info(key, "确认...");
      if (this.column == "fChengzhongNo") {
        this.code += key;
        this.$set(this.asData, "fChengzhongNo", this.code);
      } else if (this.column == "fHrCode") {
        this.hrCode += key;
        this.$set(this.asData, "fHrCode", this.hrCode);
      }
    },

    handleDelete() {
      if (this.column == "fChengzhongNo") {
        this.code = this.code.substring(0, this.code.length - 1);
        this.$set(this.asData, "fChengzhongNo", this.code);
      } else if (this.column == "fHrCode") {
        this.hrCode = this.hrCode.substring(0, this.hrCode.length - 1);
        this.$set(this.asData, "fHrCode", this.hrCode);
      }
    },
    handleFocus(column) {
      // console.log(column);
      this.column = column;
      let pickState = this.$store.state.common.pickState;
      if (pickState) {
        this.isShowKeyboard = true;
      } else {
        this.isShowKeyboard = false;
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
        this.tableHeadData.forEach(item => {
          if (item.fColumn == "fIsPass") {
            this.$set(item, "fVisible", 0);
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

    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
      } else if (item[val] == 1) {
        item[val] = 0;
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
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
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

    //已审查,单据关闭,入库完成共用方法
    async billsFn(row, status, msg) {
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
    //获取回显的数据
    async getItemBackData(row) {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: row.fID
        }
      ];
      let res = await getTableBodyData("v_ChengzhongRenWu_Item", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let ItemBackData = JSON.parse(res.Data);
        // console.log(ItemBackData)
        return ItemBackData;
      }
    },
    //获取配货通知单单号

    async getOrderNoData() {
      let res = await getOrderNo("t_DistributeNotice_Mst");

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.ruleForm.fOrderNo = res.Data;
      }
    },
    //审核,
    handleCheck(row, index) {
      this.$confirm("实拣数量是否等于应拣数量?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let ItemTableData = [];
          let obj = {};
          let ItemBackData = await this.getItemBackData(row);
          let noSortingData = ItemBackData.filter(item => {
            return item.fItemIsEnd == 0;
          });
          if (noSortingData.length > 0) {
            noSortingData.forEach(item => {
              if (item.fPizhong == null) {
                this.$set(item, "fPizhong", 0);
                this.$set(item, "fQty1", item.fQty - item.fPizhong);
                this.$set(item, "fQty2", item.fQty - item.fPizhong);
                this.$set(item, "fItemIsEnd", 1);
              }
            });
            // console.log(noSortingData, "未称重的数据");

            noSortingData.forEach(async item => {
              obj = {
                fMstID: item.fID,
                fChengzhong: item.fQty,
                fPizhong: 0,
                fType: 0,
                fCreateDate: new Date(),
                fSupplier: "A",
                fQty1: item.fQty
              };

              ItemTableData.push(obj);
            });
          }

          let res = await saveCollection([
            {
              TableName: "t_ChengzhongRenWu_Item",
              updateData: noSortingData,
              headData: this.ItemTableHeadData
            },
            {
              TableName: "t_ChengzhongRenWu_Item1",
              insertData: ItemTableData,
              headData: this.Item1HeadData
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("审核成功!");
            this.getTableData();
          } else {
            this.$message.error(res.Message);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消审核"
          });
        });
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
          //   console.log(res)
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
    async getNoticeTableData(fTableView) {
      let res = await getTableHeadData(fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = res.lstRet.sort(compare);
        return result;
      }
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
        let MstID = arr.join();
        searchWhere = [
          {
            Computer: "in",
            DataFile: "fMstID",
            Value: MstID
          }
        ];
        let res = await getTableBodyData("v_ChengzhongRenWu_Item", searchWhere);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let result = JSON.parse(res.Data);
          this.dataCode = result;
        }
        this.isRender = true;

        setTimeout(() => {
          const style =
            "table td,th,tr {border: 1px #000 solid;font-size: 22px;min-width:120px; text-align: center;page-break-inside:avoid}; ";
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
    //用户表格列头
    async getItemTableHeadData(fTableView) {
      let res = await getTableHeadData(fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let result = res.lstRet.sort(compare);
        return result;
      } else {
        this.$message.error(res.Message);
      }
    },
    //重置
    reset() {
      this.asData = {};
    }
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.getTableData();
      }
    },
    selectAllData: {
      handler(n, o) {
        let a = this.$store.state.common.staffNo;
        if (!a) {
          return;
        }
        let length = n.length;
        if (length == 0) {
          return;
        }
        let data = [];
        for (let i = 0; i < length; i++) {
          if (n[i].fName == "fHrCode") {
            data = n[i].data;
            break;
          }
        }
        if (data.length == 0) {
          return;
        }
        a = a.replace(/[a-zA-Z]/g, "");
        data.forEach(child => {
          if (a == child.fHrCode) {
            this.$set(this.asData, "fHrCode", child.fHrCode);
          }
        });
      },
      deep: true
    }
  },
  async created() {
    this.getTableHeadData();
    this.getOrderNoData();
    this.ItemTableHeadData = await this.getItemTableHeadData(
      "t_ChengzhongRenWu_Item"
    );
    this.Item1HeadData = await this.getItemTableHeadData(
      "t_ChengzhongRenWu_Item1"
    );

    this.noticeMstHeadData = await this.getNoticeTableData(
      "t_DistributeNotice_Mst"
    );
    this.noticeItemHeadData = await this.getNoticeTableData(
      "t_DistributeNotice_Item"
    );
    // console.log(noticeMstHeadData, noticeItemHeadData);
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

/deep/ .el-checkbox__inner {
  width: 20px;
  height: 20px;
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
