<template>
  <div class="sorting">
    <div
      style=" position:absolute;
      top:15px"
    >
      <el-button
        type="primary"
        style="margin-right: 20px"
        size="mini"
        @click="Submitconfirm"
        >确认</el-button
      >
      <el-button
        type="primary"
        style="margin-right: 20px"
        size="mini"
        @click="plus"
        >累加</el-button
      >
      <el-button
        type="warning"
        style="margin-right: 20px"
        size="mini"
        @click="sizeSorting"
        >规格分拣</el-button
      >
      <el-button size="mini" @click="cancle">取消</el-button>
    </div>
    <el-button
      @click="handleCose"
      type="primary"
      size="mini"
      style="position: absolute; top: 10px; right: 30px"
      >关闭</el-button
    >
    <!-- <button @click="del">删除</button> -->
    <div style="display: flex; justify-content: center">
      <img
        v-if="!rowData.fImageFile"
        style="width: 120px; height: 100px"
        src=""
        alt=""
      />
      <!-- <img
          v-else
          style="width:120px;height:100px"
          :src="
            require(`../../../../../../wmsWebapi/ImageTempFile/GoodsImageFile/${rowData.fImageFile}`)
          "
          alt=""
        /> -->
      <img v-else style="width: 120px; height: 100px" :src="imgUrl" alt="" />
      <div class="right">
        <el-button type="success"
          >商品名称:{{ rowData.fProductName }}</el-button
        >
        <el-button type="success">门店:{{ rowData.fShopName }}</el-button>
      </div>
    </div>

    <el-form
      :label-position="labelPosition"
      label-width="100px"
      :model="allForm"
      :rules="rules"
      ref="allForm"
      class="flex-wrap"
      :show-message="false"
    >
      <template v-for="(item, index) in tableHeadData">
        <el-form-item
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
        >
          <el-input
            v-if="item.fDataType == 'int'"
            v-model.number="allForm[item.fColumn]"
            :disabled="
              item.fReadOnly == 0 ? false : true || rowData.fItemIsEnd == 1
            "
          ></el-input>
          <el-input
            v-else-if="item.fColumn == 'fQty1'"
            v-model.trim="allForm[item.fColumn]"
            :placeholder="`请输入${item.fColumnDes}`"
            @focus.stop.prevent="handleFocus(item.fColumn)"
            :disabled="rowData.fItemIsEnd == 1"
            @blur="handleBlur(allForm[item.fColumn])"
          ></el-input>
          <el-input
            v-else-if="item.fColumn == 'fNum'"
            v-model.trim="allForm[item.fColumn]"
            :placeholder="`请输入${item.fColumnDes}`"
            @focus.stop.prevent="handleFocus(item.fColumn)"
            :disabled="rowData.fItemIsEnd == 1"
          ></el-input>
          <el-input
            v-else
            v-model="allForm[item.fColumn]"
            :disabled="
              item.fReadOnly == 0 ? false : true || rowData.fItemIsEnd == 1
            "
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
    <el-form
      :label-position="labelPosition"
      label-width="100px"
      :model="ruleForm"
      :rules="singRules"
      ref="singForm"
      class="flex-wrap"
      :show-message="false"
    >
      <template v-for="(item, index) in singleHeadData">
        <el-form-item
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
        >
          <el-date-picker
            v-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="rowData.fItemIsEnd == 1"
          ></el-date-picker>
          <!-- item.fColumn == 'fRongqi' || -->
          <template
            v-else-if="
              item.fColumn == 'fRongqi1' ||
                item.fColumn == 'fRongqi2' ||
                item.fColumn == 'fRongqi3'
            "
          >
            <el-select
              v-model="ruleForm[item.fColumn]"
              clearable
              placeholder="请选择"
              :disabled="rowData.fItemIsEnd == 1"
              @change="getSelVal(ruleForm[item.fColumn], item.fColumn)"
            >
              <el-option
                v-for="item in rqOptions"
                :key="item.fID"
                :label="item.fProductName"
                :value="item.fProductName"
              >
              </el-option>
            </el-select>
          </template>
          <template v-else-if="item.fColumn == 'fSupplier'">
            <el-select
              v-model="ruleForm[item.fColumn]"
              clearable
              placeholder="请选择"
              :disabled="rowData.fItemIsEnd == 1"
              @change="changeSupplier(rowData, ruleForm[item.fColumn])"
            >
              <el-option
                v-for="item in supplierOptions"
                :key="item.fID"
                :label="item.fSupplier"
                :value="item.fSupplier"
              >
              </el-option>
            </el-select>
          </template>
          <el-input
            v-else-if="item.fColumn == 'fPizhong'"
            v-model.trim="ruleForm[item.fColumn]"
            :placeholder="`请输入${item.fColumnDes}`"
            @focus.stop.prevent="handleFocus(item.fColumn)"
            :disabled="rowData.fItemIsEnd == 1"
          ></el-input>
          <!--  && item.fDataType == 'int' -->
          <el-input
            v-else-if="
              item.fColumn == 'fQtyR1' ||
                item.fColumn == 'fQtyR2' ||
                item.fColumn == 'fQtyR3'
            "
            v-model.trim="ruleForm[item.fColumn]"
            :placeholder="`请输入${item.fColumnDes}`"
            @focus.stop.prevent="handleFocus(item.fColumn)"
            :disabled="rowData.fItemIsEnd == 1"
          ></el-input>
          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="
              item.fReadOnly == 0 ? false : true || rowData.fItemIsEnd == 1
            "
          ></el-input>
          <el-input
            v-else
            v-model="ruleForm[item.fColumn]"
            :disabled="
              item.fReadOnly == 0 ? false : true || rowData.fItemIsEnd == 1
            "
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
    <!-- 键盘  :isInteger="true" :disorder="true"-->
    <number-keyboard
      v-model="isShowKeyboard"
      @confirm="save"
      @keyDown="verInput"
      @delete="handleDelete"
    ></number-keyboard>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData | pagination(pageNum, pageSize)"
      v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      border
      style="width: 100%"
      :row-key="getRowKeys"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="60"></el-table-column>
      <template v-for="(item, index) in singleHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="120px"
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
        prev-text="上一页"
        next-text="下一页"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { creatRules, defaultForm, compare } from "@/utils/common";
import { updateTime, timeCycle } from "@/utils/updateTime";
import {
  getTableBodyData,
  saveNoLoad,
  exportImge,
  collectionData
} from "@/api/index";

export default {
  props: [
    "rowData",
    "fTableView",
    "tableHeadData",
    "singleHeadData",
    "rqOptions"
  ],
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      }, //批量
      labelPosition: "right", //表单域标签的位置
      supplierOptions: [
        { fID: 1, fSupplier: "A" },
        { fID: 2, fSupplier: "B" },
        { fID: 3, fSupplier: "C" },
        { fID: 4, fSupplier: "D" }
      ],
      BatchList: [],
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      imgUrl: "", //下载图片的路径
      timeID: null, //定时器ID
      delayTimeID: null,
      isShowKeyboard: false,
      rules: {},
      singRules: {},
      column: "", //获取焦点的字段
      //从表数据
      allForm: {
        fPizhong: 0
      },
      fNum: "", //单位换算
      fQty1: "", //实拣数量
      pcfqty1: "", //pc端实拣数量
      //从表1
      ruleForm: {
        fPizhong: null,
        fSupplier: "A",
        fCreateDate: timeCycle(new Date()),
        fQty: 0, //容器数量
        fQtyR1: 0,
        fQtyR2: 0,
        fQtyR3: 0
      },
      changeForm: {}, //需要转换容器的数据
      allrq: [], //所有的容器
      Qty: "", //1 键盘录入容器数量
      code: "", //1 键盘录入皮
      QtyR1: "", //1 键盘录入容器数量
      QtyR2: "", //1 键盘录入容器数量
      QtyR3: "", //1 键盘录入容器数量
      isSorting: this.$store.state.common.pickState,
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    handleBlur(val) {
      // console.log(val);
      this.pcfqty1 = val;
    },
    getSelVal(val, column) {
      // console.log(val, column);
      if (val) {
        this.allrq.forEach((item, index) => {
          if (item.key == column) {
            this.allrq.splice(index, 1);
          }
        });
        let obj = {
          key: column,
          val: val
        };
        this.allrq.push(obj);
        this.rqOptions.forEach(item => {
          this.allrq.forEach(ele => {
            if (item.fProductName == ele.val && ele.key == column) {
              this.changeForm[column] = item.fProductCode;
            }
          });
        });
        this.allrq.forEach(val => {
          if (val.key == "fRongqi1") {
            this.ruleForm.fQtyR1 = 1;
          } else if (val.key == "fRongqi2") {
            this.ruleForm.fQtyR2 = 1;
          } else if (val.key == "fRongqi3") {
            this.ruleForm.fQtyR3 = 1;
          }
        });
        let sum = 0;
        sum =
          Number(this.ruleForm.fQtyR1) +
          Number(this.ruleForm.fQtyR2) +
          Number(this.ruleForm.fQtyR3);
        this.ruleForm.fQty = sum;
      } else {
        for (const key in this.changeForm) {
          if (key == column && column == "fRongqi1") {
            this.ruleForm.fQtyR1 = 0;
            delete this.changeForm.fRongqi1;
          } else if (key == column && column == "fRongqi2") {
            this.ruleForm.fQtyR2 = 0;
            delete this.changeForm.fRongqi2;
          } else if (key == column && column == "fRongqi3") {
            this.ruleForm.fQtyR3 = 0;
            delete this.changeForm.fRongqi3;
          }
        }
      }
      // console.log(this.changeForm, "ieiee");
    },
    //获取选中的供应商
    changeSupplier(row, val) {
      let obj = {
        productID: row.fGoodsID,
        supplier: val
      };
      window.localStorage.setItem("supplier", JSON.stringify(obj));
    },
    // 确定
    save() {
      this.isShowKeyboard = false;
      if (
        this.ruleForm.fChengzhong == null ||
        this.ruleForm.fChengzhong == ""
      ) {
        this.$set(this.ruleForm, "fChengzhong", 0);
      }
      if (this.column == "fPizhong") {
        if (this.tableData.length > 0) {
          let sum = 0;
          this.tableData.forEach(item => {
            if (item.fQty1) {
              sum += Number(item.fQty1);
            }
          });
          let talbeSum = sum.toFixed(2);
          //总重量
          let allZhongNum =
            Number(this.ruleForm.fChengzhong) - Number(this.ruleForm.fPizhong);
          let allQty = Number(talbeSum) + Number(allZhongNum);
          let qtyNum = allQty.toFixed(2);
          this.$set(this.allForm, "fQty1", qtyNum);
        } else {
          //总重量
          let allZhongNum =
            Number(this.ruleForm.fChengzhong) - Number(this.ruleForm.fPizhong);
          //实拣数量
          let qtyNum = allZhongNum.toFixed(2);
          if (qtyNum < 0) {
            this.$message.warning("实拣数量不能小于零!");
          } else {
            this.$set(this.allForm, "fQty1", qtyNum);
            this.$set(this.ruleForm, "fQty1", qtyNum);
          }
        }
      } else {
        this.$set(this.allForm, "fQty1", this.allForm.fQty1);
      }
      if (
        this.column == "fQtyR1" ||
        this.column == "fQtyR2" ||
        this.column == "fQtyR3"
      ) {
        // console.log(this.ruleForm, "ieie");
        let sum = 0;
        sum =
          Number(this.ruleForm.fQtyR1) +
          Number(this.ruleForm.fQtyR2) +
          Number(this.ruleForm.fQtyR3);

        this.ruleForm.fQty = sum;
      }
    },
    // 验证码输入
    verInput(key) {
      // console.info(key, "确认...");
      if (this.column == "fPizhong") {
        this.code += key;
        this.$set(this.ruleForm, "fPizhong", this.code);
      } else if (this.column == "fQtyR1") {
        this.QtyR1 += key;
        this.$set(this.ruleForm, "fQtyR1", this.QtyR1);
      } else if (this.column == "fQtyR2") {
        this.QtyR2 += key;
        this.$set(this.ruleForm, "fQtyR2", this.QtyR2);
      } else if (this.column == "fQtyR3") {
        this.QtyR3 += key;
        this.$set(this.ruleForm, "fQtyR3", this.QtyR3);
      } else if (this.column === "fQty1") {
        this.fQty1 += key;
        this.$set(this.allForm, "fQty1", this.fQty1);
      } else if (this.column === "fNum") {
        this.fNum += key;
        this.$set(this.allForm, "fNum", this.fNum);
      }
    },

    handleDelete() {
      if (this.column == "fPizhong") {
        this.code = this.code.substring(0, this.code.length - 1);
        this.$set(this.ruleForm, "fPizhong", this.code);
      } else if (this.column == "fQtyR1") {
        this.QtyR1 = this.QtyR1.substring(0, this.QtyR1.length - 1);
        this.$set(this.ruleForm, "fQtyR1", this.QtyR1);
      } else if (this.column == "fQtyR2") {
        this.QtyR2 = this.QtyR2.substring(0, this.QtyR2.length - 1);
        this.$set(this.ruleForm, "fQtyR2", this.QtyR2);
      } else if (this.column == "fQtyR3") {
        this.QtyR3 = this.QtyR3.substring(0, this.QtyR3.length - 1);
        this.$set(this.ruleForm, "fQtyR3", this.QtyR3);
      } else if (this.column == "fQty1") {
        this.fQty1 = this.fQty1.substring(0, this.fQty1.length - 1);
        this.$set(this.allForm, "fQty1", this.fQty1);
      } else if (this.column == "fNum") {
        this.fNum = this.fNum.substring(0, this.fNum.length - 1);
        this.$set(this.allForm, "fNum", this.fNum);
      }
    },
    handleFocus(column) {
      console.log(column);
      this.column = column;
      let pickState = this.$store.state.common.pickState;
      if (pickState) {
        this.isShowKeyboard = true;
      } else {
        this.isShowKeyboard = false;
      }
    },

    //累加
    plus() {
      this.$confirm("是否确定累加?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          //从表的实拣数量
          let itemQty =
            Number(this.ruleForm.fChengzhong) - Number(this.ruleForm.fPizhong);
          itemQty = itemQty.toFixed(2);
          if (itemQty < 0) {
            this.$message.warning("实称重量不能小于零!");
          } else {
            this.$set(this.ruleForm, "fQty1", itemQty);
            this.ruleForm.fCreateDate = timeCycle(new Date());
            let mergeForm = Object.assign({}, this.ruleForm, this.changeForm);
            // console.log(mergeForm, "ruleForm");
            let rowTableData = [mergeForm];
            rowTableData = JSON.parse(JSON.stringify(rowTableData));
            this.tableData = [...this.tableData, ...rowTableData];
            this.total = this.tableData.length;
            let sum = 0;
            this.tableData.forEach(item => {
              sum +=
                Number(item.fQtyR1) + Number(item.fQtyR2) + Number(item.fQtyR3);
            });
            this.ruleForm.fQty = sum;
            //总重量
            let allZhongNum =
              Number(this.allForm.fChengzhong) +
              Number(this.ruleForm.fChengzhong);
            let allPZ =
              Number(this.allForm.fPizhong) + Number(this.ruleForm.fPizhong);
            allPZ = allPZ.toFixed(2);
            //实拣数量
            let qtyNum = (allZhongNum - allPZ).toFixed(2);
            this.$set(this.allForm, "fChengzhong", allZhongNum);
            this.$set(this.allForm, "fPizhong", allPZ);
            this.$set(this.allForm, "fQty1", qtyNum);
            this.$set(this.allForm, "fQty2", qtyNum);
            this.$set(this.allForm, "fType", 0);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消累加"
          });
        });
    },
    debounce(fn, delay) {
      //函数防抖
      if (this.delayTimeID) {
        return;
      }
      fn();
      this.delayTimeID = setTimeout(() => {
        // console.log("5");
        clearTimeout(this.delayTimeID);
      }, delay);
    },
    async Submitconfirm() {
      let _this = this;
      this.debounce(async function() {
        _this.tableData.forEach(item => {
          //多条数据,累加表格数据处理
          _this.$set(item, "fMstID", _this.allForm.fID);
          _this.$set(item, "fType", 0);
        });

        if (_this.allForm.fChengzhong == "" && _this.allForm.fPizhong == "") {
          //单条数据提交

          if (_this.ruleForm.fChengzhong == null) {
            _this.$set(_this.ruleForm, "fChengzhong", 0);
          }
          if (_this.ruleForm.fPizhong == null) {
            _this.$set(_this.ruleForm, "fPizhong", 0);
          }
          _this.$set(_this.allForm, "fChengzhong", _this.ruleForm.fChengzhong);
          _this.$set(_this.allForm, "fPizhong", _this.ruleForm.fPizhong);
          _this.$set(_this.allForm, "fType", 0);
          let qtyNum = (
            _this.ruleForm.fChengzhong - _this.ruleForm.fPizhong
          ).toFixed(2);

          if (qtyNum < 0) {
            _this.$message.warning("实拣数量不能小于零!");
          } else {
            _this.$set(_this.allForm, "fQty2", qtyNum);
            _this.$set(_this.ruleForm, "fQty1", qtyNum);
            let mergeForm = Object.assign({}, _this.ruleForm, _this.changeForm);
            _this.tableData = [mergeForm];
            _this.tableData.forEach(item => {
              _this.$set(item, "fMstID", _this.allForm.fID);
              _this.$set(item, "fType", 0);
            });
          }
        }
        //电子称
        if (_this.isSorting) {
          if (_this.fQty1 == "") {
            //allForm的实拣数量
            console.log(_this.fQty1, "allForm的实拣数量");
            if (_this.tableData.length > 1) {
              console.log(_this.tableData,"累加")
              //为累加
            } else {
              //单个称重保存
              let qtyNum = (
                _this.ruleForm.fChengzhong - _this.ruleForm.fPizhong
              ).toFixed(2);
              _this.$set(_this.allForm, "fQty1", qtyNum);
              _this.$set(_this.tableData[0], "fQty1", qtyNum);
              console.log("单个称重")
            }
          } else {
            //直接输入从表实际数量为为按包称重
            _this.$set(_this.allForm, "fQty1", _this.fQty1);
            _this.$set(_this.allForm, "fType", 2);
            _this.$set(_this.tableData[0], "fType", 2);
            _this.$set(_this.tableData[0], "fQty1", _this.fQty1);
            console.log("按包称重")
          }
        } else {
          //pc端
          if (_this.tableData.length == 1) {
            if (_this.pcfqty1) {
              _this.$set(_this.allForm, "fType", 2);
              _this.$set(_this.tableData[0], "fType", 2);
              _this.$set(_this.ruleForm, "fQty1", _this.pcfqty1);
            }
          }
        }

        if (_this.allForm.fQty1 < 0) {
          _this.$message.warning("实拣数量不能小于零");
          console.log(2);
        } else {
          let res = await saveNoLoad([
            {
              TableName: _this.fTableView,
              updateData: [_this.allForm],
              headData: _this.tableHeadData
            },
            {
              TableName: "t_ChengzhongRenWu_Item1",
              insertData: _this.tableData,
              headData: _this.singleHeadData
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(_this.userDes)));
          // console.log(res);
          if (res.State) {
            _this.$message.success("保存成功");
            _this.$emit("closeBox", res.State);
          } else {
            _this.$message.error(res.Message);
          }
        }
      }, 3000);
    },
    //规格分拣
    async sizeSorting() {
      let that = this;
      this.debounce(async function() {
        if (that.allForm.fQpcstr == null && that.allForm.fNum == null) {
          that.$message.warning("当前货品规格为空,请在单位换算率中输入数量!");
        } else {
          if (that.ruleForm.fChengzhong == null) {
            that.$set(that.ruleForm, "fChengzhong", 0);
          }
          if (that.ruleForm.fPizhong == null) {
            that.$set(that.ruleForm, "fPizhong", 0);
          }
          if (that.allForm.fChengzhong == "" && that.allForm.fPizhong == "") {
            that.$set(that.allForm, "fChengzhong", 0);
            that.$set(that.allForm, "fPizhong", 0);
            that.$set(that.allForm, "fType", 1);
            let qtyNum = (
              that.ruleForm.fChengzhong - that.ruleForm.fPizhong
            ).toFixed(2);

            that.$set(that.allForm, "fQty2", qtyNum);
     
            that.tableData = [that.ruleForm];
          }
          that.tableData.forEach(item => {
            that.$set(item, "fMstID", that.allForm.fID);
            that.$set(item, "fType", 1);
            if (item.fPizhong == null || item.fPizhong == "") {
              that.$set(item, "fPizhong", 0);
            }
          });

          if (that.allForm.fQpcstr == null) {
          } else {
            that.$set(that.allForm, "fNum", parseFloat(that.allForm.fQpcstr));
          }
          if (that.allForm.fQty1 == 0) {
            that.$set(that.allForm, "fQty1", that.allForm.fQty);
          }
          if (that.allForm.fPizhong == "") {
            that.$set(that.allForm, "fPizhong", 0);
          }
          that.$set(that.ruleForm, "fQty1", that.allForm.fQty1);

          let res = await saveNoLoad([
            {
              TableName: that.fTableView,
              updateData: [that.allForm],
              headData: that.tableHeadData
            },
            {
              TableName: "t_ChengzhongRenWu_Item1",
              insertData: that.tableData,
              headData: that.singleHeadData
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(that.userDes)));
          if (res.State) {
            that.$message.success("保存成功");
            that.$emit("closeBox", res.State);
          } else {
            that.$message.error(res.Message);
          }
        }
      }, 4000);
    },
    handleCose() {
      this.$emit("closeBox");
    },
    cancle() {
      this.$emit("closeBox");
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    async getImage() {
      let res = await exportImge({
        strType: "GoodsImageFile",
        strFileName: this.rowData.fImageFile
      });

      if (!res) return;
      var blob = new Blob([res], {});
      var href = window.URL.createObjectURL(blob); //创建下载的链接

      this.imgUrl = href;
    },

    //获取table回显的数据
    async getTableData(row) {
      // console.log(row);
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: row.fID
        }
      ];

      let res = await getTableBodyData(
        "v_ChengzhongRenWu_Item1",
        searchWhereObj
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        console.log(this.tableData, "回显的数据");
        this.total = this.tableData.length;
      }
    }, // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },
    async del() {
      let res = await collectionData(
        //insert新建，update修改，delete删除
        [
          {
            TableName: "t_ChengzhongRenWu_Item1",
            insertData: null,
            deleteData: this.BatchList,
            headData: this.singleHeadData
          }
        ]
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res.State, "State");
    }
  },

  mounted() {
    this.timeID = setInterval(() => {
      let num = window.localStorage.getItem("num");
      this.$set(this.ruleForm, "fChengzhong", num);
      // console.log(num, "mounted");
    }, 200);
  },
  async created() {
    if (this.rowData.fImageFile) {
      this.getImage();
    }

    if (this.rowData) {
      this.allForm = JSON.parse(JSON.stringify(this.rowData));
    } else {
      this.allForm = defaultForm(this.tableHeadData);
    }
    this.allForm.fItemIsEnd = 1;
    for (const key in this.allForm) {
      if (
        this.allForm[key] == null &&
        key != "fUnitName" &&
        key != "fQpcstr" &&
        key != "fNum"
      ) {
        this.$set(this.allForm, key, 0);
      }
    }
    this.getTableData(this.rowData); //获取table回显的数据
    let supplierObj = JSON.parse(window.localStorage.getItem("supplier"));

    if (
      supplierObj &&
      supplierObj.supplier != "A" &&
      supplierObj.productID == this.rowData.fGoodsID
    ) {
      this.$set(this.ruleForm, "fSupplier", supplierObj.supplier);
    }
  },

  beforeDestroy() {
    clearInterval(this.timeID);
    this.timeID = null;
  }
};
</script>
<style lang="scss" scoped>
.sorting {
  width: 85%;
  margin-left: 15%;
}
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
.el-form-item {
  width: 25%;
  margin-bottom: 0px !important;
}
.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 50px;
}

/deep/ .el-input.is-disabled .el-input__inner {
  background-color: #cbcbcb !important;
}
</style>
