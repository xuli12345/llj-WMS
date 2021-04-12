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
            item.fDataType == 'datetime' && item.fComputer == 'between'
          "
        >
          <el-col :span="11">
            <el-date-picker
              v-model.trim="startData[item.fColumn]"
              type="date"
              placeholder="请输入范围值"
              min-width="300"
            ></el-date-picker>
          </el-col>
          <el-col :span="2">——</el-col>
          <el-col :span="11">
            <el-date-picker
              v-model.trim="endData[item.fColumn]"
              type="date"
              placeholder="请输入范围值"
              min-width="300"
            ></el-date-picker>
          </el-col>
        </el-row>
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
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-yishenhe"
          @click="batchCheck"
          :disabled="userLimit('fAdd')"
          >批量审核</el-button
        >
        <el-button
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
          class="iconfont icon-shanchu"
          @click="BatchFormsDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        >
        <el-button
          type="primary"
          class="el-icon-bottom"
          @click="downloadTemp"
          size="mini"
          >下载模板</el-button
        >
        <el-upload
          style="margin-left:15px;float:right"
          ref="upload"
          class="upload"
          action
          :on-change="handleChange"
          :on-remove="handleRemove"
          :auto-upload="false"
          :show-file-list="false"
          accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
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
              type="text"
              size="small"
              @click.stop="haveItemDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel') || scope.row.fState == 1"
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
              :disabled="userLimit('fApp') || scope.row.fState == 1"
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
        :page-sizes="[10, 50, 100, 200, 400]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime1 } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import {
  addformSaveData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  imPortExcel,
  exportData,
  batchOrderNo,
  collectionData
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  //  isCheck:已审核 importExcel:excel导入    homeSelArr:搜索框需要做下拉框的字段
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "batchDelTableName",
    "isCheck",
    "homeSelArr",
    "strType"
  ],

  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      searchData: [], //查询的数据
      tableHeadData: [], //表头数据
      errorHeadData: [],
      searchWhere: [], //搜索条件
      fTableViewData: "", //获取表格内容TableView的值,在获取headData中获取
      BatchList: [], //批量
      tableData: [], //表格数据
      pageNum: 1, // 当前页数
      pageSize: 10, // 每页条数
      total: 0, // 总条数
      asData: {
        fAPNo: updateTime1(new Date())
      },
      endData: {},
      startData: {},
      newArr: [],
      fileTemp: null,
      selectAllData: [],
      ruleForm: {
        fID: 0,
        fOrderNo: "",
        fShopID: "",
        fShopName: "",
        fOrgBillNo: "",
        fReasonID: 1,
        fConsignorID: 1,
        fConsignorName: "招远金都百货有限公司总部",
        fState: 2,
        fStateName: "初始",
        fCreater: this.$store.state.user.userInfo.userId
      },
      noticeMstHeadData: [],
      noticeItemHeadData: [],
      imageFile: null,
      allItemBackData: [], //所有从表回显的数据
      remorkData: {}, //备注下拉框数据
      successNum: 0,
      failNum: 0,
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
          if (
            Ikey == key &&
            this.startData[key] != null &&
            this.endData[key] != null
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
      } else {
        this.$message.error(res.Message);
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
    async billsFn(data, status, msg, successNum, failNum) {
      let tableHeadData = [
        {
          fColumn: "fID",
          fColumnDes: "ID",
          fComputer: "",
          fDataType: "int"
        },
        {
          fColumn: "fState",
          fColumnDes: "状态",
          fComputer: "",
          fDataType: "int"
        }
      ];
      if (data instanceof Array) {
        data.forEach(item => {
          this.$set(item, "fState", status);
        });
      } else {
        this.$set(data, "fState", status);
      }
      let result;
      if (data instanceof Array) {
        result = batchDelete(tableHeadData, data);
      } else {
        result = batchDelete(tableHeadData, [data]);
      }

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
      // console.log(res, "审核");
      if (res.State) {
        this.$message.success(
          `${msg}成功!,成功生成配货通知单${successNum}条,失败${failNum}`
        );
        this.getTableData();
      } else {
        console.log(this.BatchList, "保错IEIE");
        let errorObj = {
          fOrgNo: this.ruleForm.fOrgBillNo,
          fOrderNo: this.ruleForm.fOrderNo,
          fType: "mdchphtzd",
          fDesc: "批量审核生成配货通知单",
          fError: res1.Message,
          fCreateDate: timeCycle(new Date()),
          fCreater: this.userId
        };
        let res2 = await collectionData([
          {
            TableName: "t_Error",
            insertData: [errorObj],
            headData: this.errorHeadData,
            IdentityColumn: "fID"
          }
        ]);
        res2 = JSON.parse(decryptDesCbc(res2, String(this.userDes)));
        if (res2.State) {
        } else {
          this.$message.errstr(res2.Message);
        }
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
      let res = await getTableBodyData("v_Shop_APGoods_Item", searchWhere);
      console.log(res);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let ItemBackData = JSON.parse(res.Data);
        return ItemBackData;
      }
    },
    //获取批量回显的数据
    async getBatchBackData(backID) {
      console.log(backID);
      let searchWhere = [
        {
          Computer: "in",
          DataFile: "fMstID",
          Value: backID
        }
      ];
      let res = await getTableBodyData("v_Shop_APGoods_Item", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res,"su")
      if (res.State) {
        let ItemBackData = JSON.parse(res.Data);
        if (ItemBackData.length > 0) {
          ItemBackData.forEach(item => {
            this.$set(item, "fProductID", item.fGoodsID);
            this.$set(item, "fUnitID", item.fUnit);
          });
        }
        this.allItemBackData = ItemBackData;
      }
    },
    async getHomeData(id) {
      let where = [
        {
          Computer: "in",
          DataFile: "fID",
          Value: id
        }
      ];
      let res = await getTableBodyData("v_Shop_APGoods_Mst", where);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);

        let status = result.every(item => {
          return item.fState == 0;
        });
        console.log(status);
        return status;
      }
    },
    //批量审核生成配货通知单
    async batchCheck() {
      let result = this.BatchList.every(item => {
        return item.fState == 0;
      });
      let arr = [];
      this.BatchList.forEach(item => {
        arr.push(item.fID);
      });
      let allID = arr.join();
      console.log(allID);
      let status = await this.getHomeData(allID);
      console.log(status);
      // 判断门店报货单中是否有为空的数据
      let sult = this.BatchList.every(ele => {
        return ele.fQty != null;
      });

      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要审核的数据!");
      } else if (!result) {
        this.$message.warning("请选择状态为未审核的数据!");
      } else if (!sult) {
        this.$message.warning("请选择合计数量不为空的数据审核!");
      } else if (!status) {
        this.$message.warning(
          "数据中存在已审核的数据,请重新查询数据再进行审核操作!"
        );
      } else {
        let ItemTableData = [];
        let batchOrderNoData = [];
        this.successNum = 0;
        this.failNum = 0;
        let res = await batchOrderNo(
          "t_DistributeNotice_Mst",
          this.BatchList.length
        );

        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        // console.log(res, "批量单号");
        if (res.State) {
          batchOrderNoData = res.lstNo;
          batchOrderNoData.forEach((val, index) => {
            this.BatchList.forEach((item, idx) => {
              if (index == idx) {
                this.$set(item, "OrderNo", val);
              }
            });
          });

          for (let k = 0, j = this.BatchList.length; k < j; k++) {
            ItemTableData = [];
            this.ruleForm.fID = this.BatchList[k].fID;
            this.ruleForm.fRemark = this.BatchList[k].fRemark;
            this.ruleForm.fOrgBillNo = this.BatchList[k].fAPNo;
            this.ruleForm.fShopID = this.BatchList[k].fShopID;
            this.ruleForm.fShopName = this.BatchList[k].fShopName;
            this.ruleForm.fOrderNo = this.BatchList[k].OrderNo;
            this.ruleForm.fCreateDate = new Date();
            this.allItemBackData.forEach(val => {
              if (this.BatchList[k].fID == val.fMstID) {
                ItemTableData.push(val);
              }
            });
            let res1 = await collectionData([
              {
                TableName: "t_DistributeNotice_Mst",
                insertData: [this.ruleForm],
                headData: this.noticeMstHeadData,
                IdentityColumn: "fID"
              },
              {
                TableName: "t_DistributeNotice_Item",
                insertData: ItemTableData,
                headData: this.noticeItemHeadData,
                IdentityColumn: "fMstID"
              }
            ]);
            res1 = JSON.parse(decryptDesCbc(res1, String(this.userDes)));
            // console.log(res1, "res1");
            if (res1.State) {
              this.successNum++;
              let tableHeadData = [
                {
                  fColumn: "fID",
                  fColumnDes: "ID",

                  fDataType: "int"
                },
                {
                  fColumn: "fState",
                  fColumnDes: "状态",

                  fDataType: "int"
                }
              ];
              let copyData = JSON.parse(JSON.stringify(this.ruleForm));
              this.$set(copyData, "fState", 1);
              result = batchDelete(tableHeadData, [copyData]);
              let res2 = await addformSaveData([
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
              res2 = JSON.parse(decryptDesCbc(res2, String(this.userDes)));
              if (res2.State) {
              } else {
                // console.log("失败");
                this.$message.error(res2.Message);
              }
            } else {
              this.failNum++;
              // console.log(
              //   JSON.stringify(this.ruleForm),
              //   JSON.stringify(ItemTableData)
              // );

              this.$message.error(res1.Message);
              let errorObj = {
                fOrgNo: this.ruleForm.fOrgBillNo,
                fOrderNo: this.ruleForm.fOrderNo,
                fType: "mdchphtzd",
                fDesc: "批量审核生成配货通知单",
                fError: res1.Message,
                fCreateDate: timeCycle(new Date()),
                fCreater: this.userId
              };
              let res2 = await collectionData([
                {
                  TableName: "t_Error",
                  insertData: [errorObj],
                  headData: this.errorHeadData,
                  IdentityColumn: "fID"
                }
              ]);
              res2 = JSON.parse(decryptDesCbc(res2, String(this.userDes)));
              if (res2.State) {
              } else {
                this.$message.errstr(res2.Message);
              }
            }
          }
          console.log(this.successNum, this.failNum, "批量审核");
          // this.billsFn(
          //   this.BatchList,
          //   this.isCheck[1],
          //   "审核",
          //   this.successNum,
          //   this.failNum
          // );
          this.getTableData();
        } else {
          this.$message.errstr(res.Message);
        }
      }
    },
    //单条数据审核,
    async handleCheck(row, index) {
      let status = await this.getHomeData(row.fID);

      if (!status) {
        this.$message.warning("数据已审核,请重新查询数据再进行审核操作!");
      } else {
        let ItemBackData = await this.getItemBackData(row);
        if (ItemBackData.length > 0) {
          ItemBackData.forEach(item => {
            this.$set(item, "fProductID", item.fGoodsID);
            this.$set(item, "fUnitID", item.fUnit);
          });
        }
        this.ruleForm.fOrgBillNo = row.fAPNo;
        this.ruleForm.fShopID = row.fShopID;
        this.ruleForm.fShopName = row.fShopName;
        this.ruleForm.fRemark = row.fRemark;
        this.ruleForm.fCreateDate = new Date();
        let res = await batchOrderNo("t_DistributeNotice_Mst", 1);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let result = res.lstNo;
          this.ruleForm.fOrderNo = result[0];
          let res1 = await collectionData([
            {
              TableName: "t_DistributeNotice_Mst",
              insertData: [this.ruleForm],
              headData: this.noticeMstHeadData,
              IdentityColumn: "fID"
            },
            {
              TableName: "t_DistributeNotice_Item",
              insertData: ItemBackData,
              headData: this.noticeItemHeadData,
              IdentityColumn: "fMstID"
            }
          ]);
          res1 = JSON.parse(decryptDesCbc(res1, String(this.userDes)));
          if (res1.State) {
            this.billsFn(row, this.isCheck[1], "审核", 1, 0);
          } else {
            this.$message.error(res1.Message);
          }
        } else {
          this.$message.errstr(res.Message);
        }
      }
    },

    // 手动选中Checkbox
    async handleSelectionChange(val) {
      this.BatchList = val;
      let arr = [];
      this.BatchList.forEach(item => {
        arr.push(item.fID);
      });
      let allId = arr.join();
      if (allId) {
        this.getBatchBackData(allId);
      }
    },

    //删除从表
    async BatchFormsDelete() {
      let result = this.BatchList.every(item => {
        return item.fState == 0;
      });
      let arr = [];
      this.BatchList.forEach(item => {
        arr.push(item.fID);
      });
      let allID = arr.join();
      let status = await this.getHomeData(allID);

      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else if (!result) {
        this.$message.warning("请选择未审核的数据!");
      } else if (!status) {
        this.$message.warning(
          "数据中存在已审核的数据,请重新查询数据再进行删除操作!"
        );
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
    async haveItemDelete(row, index) {
      let RowData = JSON.parse(JSON.stringify(row));
      let status = await this.getHomeData(row.fID);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          if (!status) {
            this.$message.warning("数据已审核,请重新查询数据再进行删除操作!");
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
      arr = [
        {
          data: [
            {
              fID: 1,
              fStateDes: "已审核"
            },
            {
              fID: 0,
              fStateDes: "未审核"
            }
          ],
          fName: "fStateDes"
        }
      ];
      arr.push(this.remorkData);
      this.selectAllData = arr;
      console.log(this.selectAllData);
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
        // console.log(ele.fName, "v", v);
        if (ele.fName == v) {
          arr = ele.data;
        }
      });
      // console.log(arr);
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
    //下载模板
    downloadTemp() {
      if (this.strType.includes("ShopAppGoods")) {
        window.location.href = `${tempUrl}/ImportTempModFile/门店要货导入模板.xlsx`;
      }
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
    async getCargoryType() {
      let res = await getTableBodyData("v_Product_KindType");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        let obj = {
          fType: "导入",
          fStateDes: "导入"
        };
        result.unshift(obj);
        this.remorkData = {
          data: result,
          fName: "fRemark"
        };
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
    }
  },
  async created() {
    this.getTableHeadData();
    this.getCargoryType();
    this.noticeMstHeadData = await this.getNoticeTableData(
      "t_DistributeNotice_Mst"
    );
    this.noticeItemHeadData = await this.getNoticeTableData(
      "t_DistributeNotice_Item"
    );
    // this.errorHeadData = await this.getNoticeTableData("t_Error");
    console.log(this.errorHeadData, "错误信息表头");
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
