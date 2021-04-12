<template>
  <div>
    <div class="page flex-wrap" style="margin-bottom:0">
      <div style="margin-right:20px">
        <span>拣货单号：</span>
        <el-select
          style="width:250px"
          filterable
          v-model="selectValue"
          @change="getProductList"
          placeholder="请选择"
        >
          <el-option
            v-for="item in outBoundOption"
            :key="item.fID"
            :label="item.fOutboundOrderNo"
            :value="item.fOutboundOrderNo"
          >
          </el-option>
        </el-select>
      </div>
      <div>
        <span>配货作业单号：</span>
        <el-select
          style="width:250px"
          filterable
          v-model="selDisValue"
          @change="changeProduct"
          placeholder="请选择"
        >
          <el-option
            v-for="item in outBoundOption"
            :key="item.fID"
            :label="item.fDistributeNo"
            :value="item.fDistributeNo"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="flex-wrap" style="margin-left:10px">
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
        <template v-else-if="item.fColumn == 'fProductType'">
          <el-select
            style="width:250px"
            filterable
            clearable
            v-model="asData[item.fColumn]"
            placeholder="请选择"
          >
            <el-option
              v-for="item in productTypeOps"
              :key="item.fID"
              :label="item.fType"
              :value="item.fType"
            >
            </el-option>
          </el-select>
        </template>
        <template v-else-if="item.fColumn == 'fMstStateName'">
          <el-select
            style="width:250px"
            filterable
            clearable
            v-model="asData[item.fColumn]"
            placeholder="请选择"
          >
            <el-option
              v-for="item in StateOps"
              :key="item.fID"
              :label="item.stateDes"
              :value="item.stateDes"
            >
            </el-option>
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
          class="iconfont icon-renren1"
          @click="openDailog"
          >任务分配</el-button
        >

        <el-button
          v-if="NoSorting"
          type="primary"
          size="mini"
          class="iconfont icon-dayin1"
          @click="locationWeighingSorting()"
          >跳转到称重分拣</el-button
        >

        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-gengxin"
          @click="reloadPage()"
          >刷新</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="letterSearch"
          >首字母查询</el-button
        >
      </div>
    </div>
    <!-- :data="tableData | pagination(pageNum, pageSize)" -->
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%;margin-top:5px"
      :row-key="getRowKeys"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <!-- :filters="userLimit('fFiler') ? null : screenFuction(item.fColumn)" -->
      <el-table-column type="selection" width="60"></el-table-column>
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
    </el-table>

    <!--dailog 任务分配 -->
    <el-dialog title="任务分配" :visible.sync="dialogFormVisible" width="40%">
      <el-form :model="form">
        <el-form-item label="分拣工号" :label-width="'120px'">
          <el-select
            v-model="form.fHrCode"
            @change="handleChange"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in options"
              :key="item.fID"
              :label="item.fHrCode"
              :value="item.fHrCode"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分拣人" :label-width="'120px'">
          <el-input v-model="form.fHrName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">
          <i class="iconfont icon-quxiao"></i>取消</el-button
        >
        <el-button size="mini" type="primary" @click="dataFormSubmit()">
          <i class="iconfont icon-baocun"></i>确定</el-button
        >
      </span>
    </el-dialog>
    <!-- 键盘 -->
   
    <div
      style="position: fixed;
    top: 100px;
    z-index:11;
    right: 0;background:rgba(0,0,0,.5);
    "
    >
      <div v-if="keyBoardDialog" style="width: 710px; ">
        <div>
          <div style="margin: 10px;color:#fff">
            请键盘录入货品名称首字母:
            <el-input v-model="inputValue" style="width: 260px;"> </el-input>
            <el-button @click="handleCose" type="primary" size="mini"
              >关闭</el-button
            >
          </div>

          <div style="height:250px;margin:10px">
            <keyboard
              ref="keyboard"
              :keyShow="isShowKeyboard"
              @sendText="keyDown"
              @enterFinish="enterFinish"
            ></keyboard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import keyboard from "@/views/keyboard/keyboard";
import "@/assets/js/pinyin_dict_firstletter.js";
import "@/assets/js/pinyinUtil.js";
import {
  addformSaveData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  getOrderNo,
  collectionData,
  saveCollection,
  Fenpaicheck
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存
  props: ["fTableView", "tableName", "isItem"],
  components: {
    keyboard
  },
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      selectValue: "", //拣货作业号
      selDisValue: "", //配货作业号
      searchData: [], //查询的数据
      tableHeadData: [], //表头数据
      searchWhere: [], //搜索条件
      fTableViewData: "", //获取表格内容TableView的值,在获取headData中获取
      BatchList: [], //批量
      tableData: [], //表格数据
      copyTableData: [],
      NoSorting: this.$store.state.common.pickState,

      asData: {},
      endData: {},
      startData: {},
      newArr: [],
      dialogFormVisible: false,
      form: {
        fID: 0,
        fHrCode: "", //分拣工号
        fHrName: "", //分拣人名称
        fWorkID: "", //分拣人
        fChengzhongNo: "", //称重单号
        fMstIsEnd: 0, //是否完成
        fState: 0,
        fCreater: this.$store.state.user.userInfo.userId, //创建人ID
        fCreateDate: new Date()
      },
      options: [],
      outBoundOption: [],
      productTypeOps: [], //货品类别数据
      StateOps: [
        { fID: 1, stateDes: "未分派" },
        { fID: 2, stateDes: "已分派" }
      ], //分配状态
      backData: [],
      OutboundOrderNo: "", //拣货单号
      weightMstHeadData: [], //称重主表表头数据
      weightItemHeadData: [], //称重从表表头数据
      productID: "",
      keyBoardDialog: false,
      isShowKeyboard: true,
      inputValue: "", //键盘输入的内容
      lastTime: 0, //默认上一次点击时间为,
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  methods: {
    locationWeighingSorting() {
      this.$router.push({
        path: "/InvoiceManage/WeighingSorting/WeighingSorting"
      });
    },
    async reloadPage() {
      //获取创建时间为前一周的时间
      var nowdate = new Date();
      var oneweekdate = new Date(nowdate - 7 * 24 * 3600 * 1000);
      var y = oneweekdate.getFullYear();
      var m = oneweekdate.getMonth() + 1;
      var d = oneweekdate.getDate();
      var formatwdate = y + "-" + m + "-" + d;
      let baseWhere = [
        { Computer: "_like_", DataFile: "fOutboundOrdeType", Value: 4 },
        { Computer: ">=", DataFile: "fCreateDate", Value: formatwdate }
      ];
      this.outBoundOption = await this.getOutBoundNo(
        "v_OutboundOrder_Mst",
        baseWhere,
        "order by fCreateDate desc"
      );
      this.selectValue = "";
      this.selDisValue = "";
      this.tableData = [];
      this.asData = {};
    },
    //获取称重分拣的拣货单数据
    async getOutBoundNo(fTableView, where, des) {
      let res = await getTableBodyData(fTableView, where, 0, 0, des);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        return result;
      }
    },
    //根据配货作业号获取货品明细
    async changeProduct(val) {
      console.log(val, "配货作业号");
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fDistributeNo",
          Value: val
        }
      ];
      this.tableData = await this.getOutBoundNo(
        "v_OutBoundorder_fenpai",
        searchWhere,
        "order by replace(fProductName,'秒杀','')"
      );
      this.tableData.forEach(item => {
        if (item.fProductType == null) {
          this.$set(item, "fProductType", "");
        }
        if (item.fDistributeNo == val) {
          this.selectValue = item.fOutboundOrderNo;
        }
      });
      this.copyTableData = JSON.parse(JSON.stringify(this.tableData));
      if (this.tableData.length > 0) {
        this.$set(this.asData, "fMstStateName", "未分派");
        this.search();
      }
    },
    //根据拣货单号获取货品明细
    async getProductList(val) {
      // console.log(val, this.OutboundOrderNo, this.selectValue);
      this.OutboundOrderNo = val;
      console.log(this.OutboundOrderNo, "拣货单");
      this.form.fChengzhongNo = val;
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fOutboundOrderNo",
          Value: this.OutboundOrderNo
        }
      ];

      this.tableData = await this.getOutBoundNo(
        "v_OutBoundorder_fenpai",
        searchWhere,
        "order by replace(fProductName,'秒杀','')"
      );
      this.tableData.forEach(item => {
        if (item.fProductType == null) {
          this.$set(item, "fProductType", "");
        }
        if (item.fOutboundOrderNo == val) {
          this.selDisValue = item.fDistributeNo;
        }
      });
      this.copyTableData = JSON.parse(JSON.stringify(this.tableData));
      if (this.tableData.length > 0) {
        this.$set(this.asData, "fMstStateName", "未分派");
        this.search();
      }
      console.log(this.tableData);
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
      console.log(this.asData);
      for (const key in this.asData) {
        if (this.asData[key] == "") {
          if (key == "fOutboundNum") {
            delete this.asData.fOutboundNum;
          } else if (key == "fProductCode") {
            delete this.asData.fProductCode;
          } else if (key == "fProductName") {
            delete this.asData.fProductName;
          } else if (key == "fProductType") {
            delete this.asData.fProductType;
          } else if (key == "fMstStateName") {
            delete this.asData.fMstStateName;
          }
        }
      }
      if (JSON.stringify(this.asData) == "{}") {
        if (this.selectValue) {
          this.getProductList(this.selectValue);
        } else if (this.selDisValue) {
          this.changeProduct(this.selDisValue);
        }
      } else if (
        this.asData.fProductName &&
        this.asData.fProductType &&
        this.asData.fMstStateName
      ) {
        let data = this.copyTableData.filter(item => {
          return (
            item["fProductName"].indexOf(this.asData["fProductName"]) != -1
          );
        });
        let result = data.filter(item => {
          return (
            item["fProductType"].indexOf(this.asData["fProductType"]) != -1
          );
        });
        this.tableData = result.filter(item => {
          return (
            item["fMstStateName"].indexOf(this.asData["fMstStateName"]) != -1
          );
        });
        // console.log(this.tableData);
      } else if (
        this.asData.fProductCode &&
        this.asData.fMstStateName &&
        this.asData.fProductType
      ) {
        let data = this.copyTableData.filter(item => {
          return (
            item["fProductCode"].indexOf(this.asData["fProductCode"]) != -1
          );
        });
        let result = data.filter(item => {
          return (
            item["fProductType"].indexOf(this.asData["fProductType"]) != -1
          );
        });
        this.tableData = result.filter(item => {
          return (
            item["fMstStateName"].indexOf(this.asData["fMstStateName"]) != -1
          );
        });
      } else if (this.asData.fMstStateName && this.asData.fProductType) {
        let data = this.copyTableData.filter(item => {
          return (
            item["fMstStateName"].indexOf(this.asData["fMstStateName"]) != -1
          );
        });
        this.tableData = data.filter(item => {
          return (
            item["fProductType"].indexOf(this.asData["fProductType"]) != -1
          );
        });
      } else if (this.asData.fProductCode && this.asData.fMstStateName) {
        let data = this.copyTableData.filter(item => {
          return (
            item["fProductCode"].indexOf(this.asData["fProductCode"]) != -1
          );
        });
        this.tableData = data.filter(item => {
          return (
            item["fMstStateName"].indexOf(this.asData["fMstStateName"]) != -1
          );
        });
      } else if (this.asData.fProductName && this.asData.fMstStateName) {
        let data = this.copyTableData.filter(item => {
          return (
            item["fProductName"].indexOf(this.asData["fProductName"]) != -1
          );
        });
        this.tableData = data.filter(item => {
          return (
            item["fMstStateName"].indexOf(this.asData["fMstStateName"]) != -1
          );
        });
      } else {
        for (const key in this.asData) {
          if (
            key == "fProductCode" ||
            key == "fProductName" ||
            key == "fProductType" ||
            key == "fMstStateName"
          ) {
            this.tableData = this.copyTableData.filter(item => {
              // console.log(this.asData[key]);
              return item[key].indexOf(this.asData[key]) != -1;
            });
          } else if (key == "fOutboundNum") {
            this.tableData = this.copyTableData.filter(item => {
              return item.fOutboundNum > this.asData[key];
            });
          }
        }
      }
    },

    //分配人员
    async openDailog() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择货品信息!");
        return;
      }
      let result;
      if (this.BatchList.length != 0) {
        result = this.BatchList.every(item => {
          return item.fOutboundNum != 0;
        });
        if (!result) {
          this.$message.warning("请选择数量不为0的货品!");
        } else {
          let obj = {};
          let arr = [];
          this.BatchList.forEach(item => {
            obj = {
              ChengzhongNo: item.fOutboundOrderNo,
              GoodsID: item.fProductID,
              Qty: item.fOutboundNum,
              Unit: item.fOutboundNumUnit
            };
            arr.push(obj);
          });

          let res = await Fenpaicheck(arr);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            let result1 = res.lstFPC;
            console.log(result1, "result1");
            let resBol = result1.every(item => {
              return item.Qty > 0;
            });
            if (resBol) {
              this.dialogFormVisible = true;
            } else {
              this.$message.warning("当前货品已分配,请刷新数据!");
            }
          } else {
            this.$message.error(res.Message);
          }
        }
      }
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
      let arr = [];
      this.BatchList.forEach(item => {
        arr.push(item.fProductID);
      });
      this.productID = arr.join(",");
      // console.log(this.productID);
    },

    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },

    async getWeightHeadData(fTableView) {
      let res = await getTableHeadData(fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = res.lstRet.sort(compare);
        return result;
      }
    },

    //获取拣货单从表的数据
    async getShopID() {
      let Id;
      this.outBoundOption.forEach(item => {
        if (item.fOutboundOrderNo == this.selectValue) {
          Id = item.fID;
          console.log(Id, "循环的id");
        }
      });

      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: Id
        },
        {
          Computer: "in",
          DataFile: "fProductID",
          Value: this.productID
        }
      ];
      let res = await getTableBodyData("v_OutboundOrder_Item", searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        this.backData = result;
        console.log(this.backData,"backData")
      } else {
        this.$message.error(res.Message);
      }
    },

    async dataFormSubmit() {
      //获取当前时间的时间戳
      let nowTime = new Date().valueOf();
      if (nowTime - this.lastTime > 2000 || this.lastTime == 0) {
        this.lastTime = nowTime;
        console.log("间隔大于2秒，this.lastTime");
        this.form.fChengzhongNo = this.selectValue;
        // console.log(this.selectValue, "拣货单号");
        let ItemTable = [];
        let obj = {};
        this.backData.forEach(item => {
          obj = {
            fItemIsEnd: 0,
            fType: 0,
            fGoodsID: item.fProductID,
            fShopID: item.fShopID,
            fQty: item.fOutboundNum,
            fUnit: item.fOutboundNumUnit
          };
          ItemTable.push(obj);
        });
        // console.log(ItemTable, this.BatchList, "任务分派");
        if (!this.form.fChengzhongNo) {
          this.form.fChengzhongNo = this.BatchList[0].fOutboundOrderNo;
        } else {
          console.log(this.weightItemHeadData,"this.weightItemHeadData")
          let res = await saveCollection([
            {
              TableName: "t_ChengzhongRenWu_Mst",
              insertData: [this.form],
              headData: this.weightMstHeadData,
              IdentityColumn: "fID"
            },
            {
              TableName: "t_ChengzhongRenWu_Item",
              insertData: ItemTable,
              headData: this.weightItemHeadData,
              IdentityColumn: "fMstID"
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("保存成功!");
            this.dialogFormVisible = false;
            this.form.fHrName = "";
            this.form.fHrCode = "";
            this.form.fWorkID="";
            this.form.fCreateDate = new Date();
            if (this.selectValue) {
              this.getProductList(this.selectValue);
            } else if (this.selDisValue) {
              this.changeProduct(this.selDisValue);
            }
          } else {
            this.$message.error(res.Message);
          }
        }
      } else {
        console.log("不触发");
      }
    },

    handleChange() {
      this.getShopID();
      this.options.forEach(item => {
        if (this.form.fHrCode == item.fHrCode) {
          this.form.fHrName = item.fHrName;
          this.form.fWorkID = item.fID;
        }
      });
    },
    //重置
    reset() {
      this.asData = {};
    },
    //首字母查询
    letterSearch() {
      this.keyBoardDialog = true;
    },
    keyDown(v) {
      this.inputValue = v;
    },
    //键盘输入完成
    enterFinish() {
      this.inputValue = this.inputValue.replace(/\s/g, ""); //去除空格
      let str = this.inputValue.toUpperCase();
      this.inputValue = "";
      this.$refs.keyboard.keyboardText = "";
      if (this.tableData.length == 0) {
        this.$message.warning("没有查询的数据!");
      } else {
        this.tableData.forEach(item => {
          this.$set(
            item,
            "firstLetter",
            pinyinUtil.getFirstLetter(item.fProductName)
          );
        });
        this.tableData.forEach(item => {
          if (item.firstLetter.startsWith(str)) {
            this.$set(item, "isCloudes", 1);
          } else {
            this.$set(item, "isCloudes", 0);
          }
        });

        this.tableData = this.tableData.filter(v => {
          return v.isCloudes == 1;
        });
      }

      this.keyBoardDialog = false;
    },
    handleCose() {
      this.inputValue = "";
      this.$refs.keyboard.keyboardText = "";
      this.keyBoardDialog = false;
    }
  },

  async created() {
    this.getTableHeadData();
    this.weightMstHeadData = await this.getWeightHeadData(
      "t_ChengzhongRenWu_Mst"
    );
    this.weightItemHeadData = await this.getWeightHeadData(
      "t_ChengzhongRenWu_Item"
    );
    //获取系统前一周的时间
    var nowdate = new Date();
    var oneweekdate = new Date(nowdate - 7 * 24 * 3600 * 1000);
    var y = oneweekdate.getFullYear();
    var m = oneweekdate.getMonth() + 1;
    var d = oneweekdate.getDate();
    var formatwdate = y + "-" + m + "-" + d;
    let baseWhere = [
      { Computer: "_like_", DataFile: "fOutboundOrdeType", Value: 4 },
      { Computer: ">=", DataFile: "fCreateDate", Value: formatwdate }
    ];

    this.outBoundOption = await this.getOutBoundNo(
      "v_OutboundOrder_Mst",
      baseWhere,
      "order by fCreateDate desc"
    );

    this.productTypeOps = await this.getOutBoundNo(
      "v_Product_KindType",
      [],
      "order by fCreateDate desc"
    );
    let hrBaseWhere = [
      {
        Computer: "=",
        DataFile: "fJobTypeName",
        Value: "拣货员"
      }
    ];
    let res = await getTableBodyData("v_Hr_mst", hrBaseWhere);
    res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
    if (res.State) {
      this.options = JSON.parse(res.Data);
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

.el-form-item {
  width: 50%;
}

/deep/ .el-checkbox__inner {
  width: 20px;
  height: 20px;
}
</style>
