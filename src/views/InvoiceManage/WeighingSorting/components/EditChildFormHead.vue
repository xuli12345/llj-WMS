<template>
  <div>
    <div class="btns" v-if="addItem">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
        >取消</el-button
      >
    </div>
    <el-form
      :label-position="labelPosition"
      label-width="130px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="flex-wrap form-margin"
      :show-message="false"
    >
      <template v-for="(item, index) in tableHead">
        <el-form-item
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
        >
          <!-- :disabled="item.fReadOnly == 0 ? false : true" -->
          <el-date-picker
            v-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="isDisabled || item.fReadOnly == 0 ? false : true"
          ></el-date-picker>
          <template
            v-else-if="
              selectArr && selectArr.length > 0 && selectFunction(item.fColumn)
            "
          >
            <el-select
              filterable
              v-model="ruleForm[item.fColumn]"
              @change="getVal(ruleForm[item.fColumn], item.fColumn)"
              :disabled="isDisabled || item.fReadOnly == 0 ? false : true"
            >
              <el-pagination
                v-if="totalA(item.fColumn) > pagesize"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="pagesize"
                layout="total, prev, pager, next"
                :total="totalA(item.fColumn)"
              >
              </el-pagination>
              <div
                style="display: flex;margin: 0 20px"
                v-if="isShow(item.fColumn)"
              >
                <el-input
                  style="margin-left: 0px"
                  v-model.trim="asData[item.fColumn]"
                  placeholder="请输入查询的数据"
                ></el-input>
                <el-button
                  style="margin-left:10px"
                  type="primary"
                  size="mini"
                  @click="getSelectData"
                  >查询</el-button
                >
              </div>
              <el-option
                :value="i[selectVal(item.fColumn)]"
                v-for="i in selectData(item.fColumn)"
                :key="i[selectVal(item.fColumn)]"
                :label="i[selectStr(item.fColumn)]"
              ></el-option>
            </el-select>
          </template>

          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            :disabled="isDisabled || item.fReadOnly == 0 ? false : true"
          ></el-checkbox>
          <el-input
            v-else-if="item.fColumn == 'fQty1'"
            v-model.trim="ruleForm[item.fColumn]"
            :placeholder="`请输入${item.fColumnDes}`"
            @focus.stop.prevent="handleFocus('allQty1')"
            :disabled="ruleForm.fType != 1"
          ></el-input>
          <el-input
            v-else-if="item.fColumn == 'fNum'"
            v-model.trim="ruleForm[item.fColumn]"
            :placeholder="`请输入${item.fColumnDes}`"
            @focus.stop.prevent="handleFocus(item.fColumn)"
          ></el-input>

          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="isDisabled || item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-input
            v-else
            v-model="ruleForm[item.fColumn]"
            :disabled="isDisabled || item.fReadOnly == 0 ? false : true"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
    <!-- table -->
    <el-table
      v-if="isShowTable"
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData"
      v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
      style="width: 100%;"
    >
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          :width="item.width"
          sortable
        >
          <template slot-scope="scope">
            <el-date-picker
              v-if="item.fDataType == 'datetime'"
              v-model="scope.row[item.fColumn]"
              type="datetime"
              placeholder="选择日期时间"
            ></el-date-picker>

            <!-- 供应商 -->
            <el-select
              filterable
              @change="changeSupplier(rowData, ruleForm[item.fColumn])"
              v-else-if="item.fColumn == 'fSupplier'"
              v-model="scope.row[item.fColumn]"
              placeholder="请选择"
            >
              <el-option
                v-for="optionItem in selectOpts"
                :key="optionItem.fID"
                :label="optionItem.fSupplier"
                :value="optionItem.fSupplier"
              ></el-option>
            </el-select>
            <!-- 容器号 -->
            <el-select
              filterable
              v-else-if="
                item.fColumn == 'fRongqi1' ||
                  item.fColumn == 'fRongqi2' ||
                  item.fColumn == 'fRongqi3'
              "
              v-model="scope.row[item.fColumn]"
              placeholder="请选择"
              @change="getSelVal(scope.row, item.fColumn)"
            >
              <el-option
                v-for="item in rqOptions"
                :key="item.fID"
                :label="item.fProductName"
                :value="item.fProductCode"
              ></el-option>
            </el-select>
            <!-- <el-input
              v-else-if="item.fColumn == 'fQty'"
              v-model="scope.row[item.fColumn]"
              disabled
            ></el-input> -->
            <el-input
              v-else
              v-model="scope.row[item.fColumn]"
              @focus.stop.prevent="handleFocus(item.fColumn, scope.row)"
              :disabled="isDisabled || item.fReadOnly == 0 ? false : true"
              @change="handleBlur(scope.row, item.fColumn)"
            ></el-input>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <!-- 键盘  :isInteger="true"  :disorder="true"-->
    <number-keyboard
      v-model="isShowKeyboard"
      @confirm="save"
      @keyDown="verInput"
      @delete="handleDelete"
    ></number-keyboard>
  </div>
</template>
<script>
import { creatRules, defaultForm, compare } from "@/utils/common";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  getTableHeadData,
  getTableBodyData,
  getTableSelData,
  collectionData,
  saveCollection
} from "@/api/index";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: [
    "fTableViewHead",
    "addItem",
    "selectArr",
    "rowData",
    "fState",
    "isShowTable",
    "rqOptions"
  ],
  data() {
    return {
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      tableHead: [],
      tableData: [], //表格数据
      tableHeadData: [], //表格头部数据
      //需要下拉选择的所有数据
      selectAllData: [],
      //是否禁用(根据状态已审核为禁用状态)
      isDisabled: false,
      //分页
      currentPage: 1,
      pagesize: 100,
      column: "", //获取焦点的字段
      asData: {},
      isShowKeyboard: false,
      Qty1: "", //实拣数量
      Chengzhong: "", //总称重
      Pizhong: "", //总皮重
      Qty2: "", //实称重量
      fNum: "", //单位换算
      allQty: "", //从表1实拣数量
      Type: "", //称重类型
      currentRow: {}, //当前行数据
      QtyR1: "", //1 键盘录入容器数量
      QtyR2: "", //1 键盘录入容器数量
      QtyR3: "", //1 键盘录入容器数量
      selectOpts: [
        { fID: 1, fSupplier: "A" },
        { fID: 2, fSupplier: "B" },
        { fID: 3, fSupplier: "C" },
        { fID: 4, fSupplier: "D" }
      ],
      isSorting: this.$store.state.common.pickState,
      tableHeight: document.body.clientHeight,
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  async created() {
    this.tableHead = await this.getTableHeadData("t_ChengzhongRenWu_Item");
    this.tableHeadData = await this.getTableHeadData("t_ChengzhongRenWu_Item1");
    this.getTableData(this.rowData);
    this.tableHead.forEach(item => {
      if (item.fColumn == "fNum") {
        this.$set(item, "fReadOnly", 0);
      } else {
        item.fReadOnly = 1;
        this.$set(item, "fReadOnly", 1);
      }
    });
    this.tableHeadData.forEach(item => {
      if (item.fColumn == "fCreateDate") {
        this.$set(item, "width", 240);
      } else {
        this.$set(item, "width", 140);
      }
    });
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData(true);
    }
    if (this.rowData) {
      this.ruleForm = JSON.parse(JSON.stringify(this.rowData));

      if (this.rowData.fState && this.rowData.fState != this.fState) {
        this.isDisabled = true;
      }
      this.ruleForm.fModifyDate = new Date();
      for (const key in this.ruleForm) {
        if (JSON.stringify(this.ruleForm[key]).indexOf("/Date") != -1) {
          this.ruleForm[key] = timeCycle(this.ruleForm[key]);
        }
      }
    } else {
      this.ruleForm = defaultForm(this.tableHead);
    }

    if (this.ruleForm.fType == 1) {
      this.tableHeadData.forEach(item => {
        if (
          item.fColumn == "fPizhong" ||
          item.fColumn == "fChengzhong" ||
          item.fColumn == "fQty1"
        ) {
          this.$set(item, "fReadOnly", 1);
        }
      });
    } else if (this.ruleForm.fType == 2) {
      this.tableHeadData.forEach(item => {
        if (item.fColumn == "fPizhong" || item.fColumn == "fChengzhong") {
          this.$set(item, "fReadOnly", 1);
        }
      });
    } else if (this.ruleForm.fType == 0) {
      this.tableHeadData.forEach(item => {
        if (
          item.fColumn == "fPizhong" ||
          item.fColumn == "fChengzhong" ||
          item.fColumn == "fQty1"
        ) {
          this.$set(item, "fReadOnly", 0);
        }
      });
    }
  },
  methods: {
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
        this.tableData.forEach(item => {
          if (item.fPizhong == null) {
            this.$set(item, "fPizhong", 0);
          }
        });
        // this.total = this.tableData.length;
      }
    },
    //容器
    getSelVal(val, column) {
      if (val) {
        if (column == "fRongqi1") {
          this.$set(val, "fQtyR1", 1);
        } else if (column == "fRongqi2") {
          this.$set(val, "fQtyR2", 1);
        } else if (column == "fRongqi3") {
          this.$set(val, "fQtyR3", 1);
        }
        let sum = 0;
        sum = Number(val.fQtyR1) + Number(val.fQtyR2) + Number(val.fQtyR3);
        this.$set(val, "fQty", sum);
      }
    },
    //获取选中的供应商
    changeSupplier(row, val) {
      let obj = {
        productID: row.fGoodsID,
        supplier: val
      };
      window.localStorage.setItem("supplier", JSON.stringify(obj));
    },

    //pc
    handleBlur(row, fColumn) {
      if (!this.isSorting) {
        if (this.ruleForm.fType == 0) {
          if (fColumn === "fPizhong") {
            //根据皮重计算实拣数量
            let sj = Number(row.fChengzhong) - Number(row.fPizhong);
            sj = sj.toFixed(2);
            this.$set(row, "fQty1", sj);
          } else if (fColumn === "fChengzhong") {
            //根据称重计算实拣数量
            let str = Number(row.fChengzhong) - Number(row.fPizhong);
            str = str.toFixed(2);
            this.$set(row, "fQty1", str);
          } else if (fColumn === "fQty1") {
            //根据实际数量计算称重数量
            let cz = Number(row.fQty1) + Number(row.fPizhong);
            cz = cz.toFixed(2);
            this.$set(row, "fChengzhong", cz);
          }
        }
        let sum = 0;
        sum = Number(row.fQtyR1) + Number(row.fQtyR2) + Number(row.fQtyR3);
        this.$set(row, "fQty", sum);
      }
    },
    // 确定
    save() {
      this.isShowKeyboard = false;
      if (this.isSorting) {
        if (this.ruleForm.fType != 2) {
          if (this.column === "fPizhong") {
            //根据皮重计算实拣数量
            let sj =
              Number(this.currentRow.fChengzhong) -
              Number(this.currentRow.fPizhong);
            sj = sj.toFixed(2);
            this.currentRow.fQty1 = sj;
          } else if (this.column === "fChengzhong") {
            //根据称重计算实拣数量
            let str =
              Number(this.currentRow.fChengzhong) -
              Number(this.currentRow.fPizhong);
            str = str.toFixed(2);
            this.currentRow.fQty1 = str;
          } else if (this.column === "fQty1") {
            //根据实际数量计算称重数量
            let cz =
              Number(this.currentRow.fQty1) + Number(this.currentRow.fPizhong);
            cz = cz.toFixed(2);
            this.currentRow.fChengzhong = cz;
          }
        }
        if (
          this.column == "fQtyR1" ||
          this.column == "fQtyR2" ||
          this.column == "fQtyR3"
        ) {
          // console.log(this.ruleForm, "ieie");
          let sum = 0;
          sum =
            Number(this.currentRow.fQtyR1) +
            Number(this.currentRow.fQtyR2) +
            Number(this.currentRow.fQtyR3);
          this.currentRow.fQty = sum;
        }
      }
    },
    // 验证码输入
    verInput(key) {
      if (this.isSorting) {
        if (this.column === "fPizhong") {
          this.Pizhong += key;
          this.$set(this.currentRow, "fPizhong", this.Pizhong);
        } else if (this.column === "fChengzhong") {
          this.Chengzhong += key;
          this.$set(this.currentRow, "fChengzhong", this.Chengzhong);
        } else if (this.column === "fQty1") {
          this.Qty1 += key;
          this.$set(this.currentRow, "fQty1", this.Qty1);
        } else if (this.column === "fQtyR1") {
          this.QtyR1 += key;
          this.$set(this.currentRow, "fQtyR1", this.QtyR1);
        } else if (this.column === "fQtyR2") {
          this.QtyR2 += key;
          this.$set(this.currentRow, "fQtyR2", this.QtyR2);
        } else if (this.column === "fQtyR3") {
          this.QtyR3 += key;
          this.$set(this.currentRow, "fQtyR3", this.QtyR3);
        } else if (this.column === "fNum") {
          this.fNum += key;
          this.$set(this.ruleForm, "fNum", this.fNum);
        } else if (this.column === "allQty1") {
          this.allQty += key;
          this.$set(this.ruleForm, "fQty1", this.allQty);
        }
      }
      // console.info(key, "确认...");
    },

    handleDelete() {
      if (this.isSorting) {
        if (this.column === "fPizhong") {
          this.Pizhong = this.Pizhong.substring(0, this.Pizhong.length - 1);
          this.$set(this.currentRow, "fPizhong", this.Pizhong);
        } else if (this.column === "fQty1") {
          this.Qty1 = this.Qty1.substring(0, this.Qty1.length - 1);
          this.$set(this.currentRow, "fQty1", this.Qty1);
        } else if (this.column === "fChengzhong") {
          this.Chengzhong = this.Chengzhong.substring(
            0,
            this.Chengzhong.length - 1
          );
          this.$set(this.currentRow, "fChengzhong", this.Chengzhong);
        } else if (this.column === "fQtyR1") {
          this.QtyR1 = this.QtyR1.substring(0, this.QtyR1.length - 1);
          this.$set(this.currentRow, "fQtyR1", this.QtyR1);

          let sum = 0;
          sum =
            Number(this.currentRow.fQtyR1) +
            Number(this.currentRow.fQtyR2) +
            Number(this.currentRow.fQtyR3);
          this.$set(this.currentRow, "fQty", sum);
        } else if (this.column === "fQtyR2") {
          this.QtyR2 = this.QtyR2.substring(0, this.QtyR2.length - 1);
          this.$set(this.currentRow, "fQtyR2", this.QtyR2);
          let sum = 0;
          sum =
            Number(this.currentRow.fQtyR1) +
            Number(this.currentRow.fQtyR2) +
            Number(this.currentRow.fQtyR3);
          this.$set(this.currentRow, "fQty", sum);
        } else if (this.column === "fQtyR3") {
          this.QtyR3 = this.QtyR3.substring(0, this.QtyR3.length - 1);
          this.$set(this.currentRow, "fQtyR3", this.QtyR3);
          let sum = 0;
          sum =
            Number(this.currentRow.fQtyR1) +
            Number(this.currentRow.fQtyR2) +
            Number(this.currentRow.fQtyR3);
          this.$set(this.currentRow, "fQty", sum);
        } else if (this.column === "fNum") {
          this.fNum = this.fNum.substring(0, this.fNum.length - 1);
          this.$set(this.ruleForm, "fNum", this.fNum);
        } else if (this.column === "allQty1") {
          this.allQty = this.allQty.substring(0, this.allQty.length - 1);
          this.$set(this.ruleForm, "fQty1", this.allQty);
        }
      }
    },
    handleFocus(column, row) {
      // console.log(row);
      this.column = column;
      let pickState = this.$store.state.common.pickState;
      if (row) {
        this.currentRow = row;
      }

      if (pickState) {
        this.isShowKeyboard = true;
      } else {
        this.isShowKeyboard = false;
      }
    },

    //获取form表单数据
    async getTableHeadData(fTableView) {
      let res = await getTableHeadData(fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.rules = creatRules(this.tableHead);
        let result = res.lstRet.sort(compare);
        return result;
      } else {
        this.$message.error(res.Message);
      }
    },
    //新增子项,提交
    submitForm(formName) {
      let allChengzhong = 0; //总称重
      let allPizhong = 0; //总皮重
      let allfQty = 0; //实拣数量和实称重量
      this.tableData.forEach(item => {
        if (item.fRongqi) {
          //容器数量
          this.$set(item, "fQty", 1);
          this.rqOptions.forEach(val => {
            if (val.fProductName == item.fRongqi) {
              this.$set(item, "fRongqi", val.fProductCode);
            }
          });
        }
        if (item.fChengzhong == null) {
          this.$set(item, "fChengzhong", 0);
        }
        if (item.fPizhong == null) {
          this.$set(item, "fPizhong", 0);
        }
        if (item.fQty1 == null || item.fQty1 == "") {
          this.$set(item, "fQty1", 0);
        }
        if (this.isSorting) {
          //规格分拣
          if (item.fType == 1) {
            this.$set(this.ruleForm, "fQty1", this.allQty);
            this.$set(this.tableData[0], "fQty1", this.allQty);
          }
          //按包分拣
          if (item.fType == 2) {
            this.$set(this.ruleForm, "fQty1", this.currentRow.fQty1);
            this.$set(this.ruleForm, "fQty2", this.currentRow.fQty1);
            this.ruleForm.fNum = 0;
          }
          //普通分拣
          if (item.fType == 0) {
            allfQty += Number(item.fQty1);
            allChengzhong += Number(item.fChengzhong);
            allPizhong += Number(item.fPizhong);
          }
        } else {
          //规格分拣
          if (item.fType == 1) {
            this.$set(this.ruleForm, "fQty1", this.ruleForm.fQty1);
            this.$set(this.ruleForm, "fQty2", this.ruleForm.fQty1);
            this.$set(this.tableData[0], "fQty1", this.ruleForm.fQty1);
          }
          //按包分拣
          if (item.fType == 2) {
            this.$set(this.ruleForm, "fQty1", this.tableData[0].fQty1);
            this.$set(this.ruleForm, "fQty2", this.tableData[0].fQty1);
            this.ruleForm.fNum = 0;
          }
          //普通分拣
          if (item.fType == 0) {
            allfQty += Number(item.fQty1);
            allChengzhong += Number(item.fChengzhong);
            allPizhong += Number(item.fPizhong);
          }
        }
      });
      if (this.ruleForm.fType == 0) {
        console.log(allfQty);
        allChengzhong = allChengzhong.toFixed(2);
        allPizhong = allPizhong.toFixed(1);
        allfQty = allfQty.toFixed(2);
        this.ruleForm.fQty1 = allfQty;
        this.ruleForm.fQty2 = allfQty;
        this.ruleForm.fChengzhong = allChengzhong;
        this.ruleForm.fPizhong = allPizhong;
        this.ruleForm.fNum = 0;
      }
      if (this.ruleForm.fType == 1) {
        if (this.ruleForm.fQpcstr == null && this.ruleForm.fNum == null) {
          this.$message.warning("当前货品规格为空,请在单位换算率中输入数量!");
          return;
        }
      }

      this.$refs[formName].validate(async valid => {
        if (valid) {
          let res = await saveCollection([
            {
              TableName: "t_ChengzhongRenWu_Item",
              updateData: [this.ruleForm],
              headData: this.tableHead
            },
            {
              TableName: "t_ChengzhongRenWu_Item1",
              updateData: this.tableData,
              headData: this.tableHeadData
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("修改成功");
            this.$emit("closeBox", res.State);
          } else {
            this.$message.warning(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    //取消
    resetForm(formName) {
      // this.ruleForm = {};
      this.$emit("closeBox");
    },

    //判断当前字段是否需要做下拉框
    selectFunction(v) {
      let cc = false;
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
    },
    // 下拉选择框的内容
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
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          str = element.fDes;
        }
      });
      return str;
    },
    //下拉选择框选择的值
    selectVal(v) {
      let str = "";
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          str = element.fID;
        }
      });
      return str;
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

      this.selectArr.forEach(ele => {
        if (ele.fName == n && ele.fAuto) {
          ele.fAuto.forEach(item => {
            let i = false;
            if (ele.fAutoID) {
              i = ele.fAutoID.includes(item);
            }
            if (i) {
              this.ruleForm[item] = data.fID;
              this.ruleForm[n] = data[ele.fDes];
            } else {
              this.ruleForm[item] = data[item];
            }
            if (ele.fEdit && ele.fEdit.length > 0) {
              ele.fEdit.forEach(itemVal => {
                if (itemVal.key == item) {
                  this.ruleForm[item] = data[itemVal.value];
                }
              });
            }
          });
        }
      });
    },
    // 获取所有需要下拉选择的内容
    async getSelectData(loading) {
      // console.log(this.asData,"asData")
      let arr = [];
      let searchWhere = [];
      let pageNumber = 1;
      let obj = {};
      let searchColumn = "";
      let searchValue = "";
      if (JSON.stringify(this.asData) != "{}") {
        for (const key in this.asData) {
          for (let i = 0; i < this.selectArr.length; i++) {
            if (this.selectArr[i].fName == key) {
              searchColumn = this.selectArr[i].fDes;
              searchValue = this.asData[key];
            }
          }
        }
      }

      obj = {
        Computer: "_like_",
        DataFile: searchColumn,
        Value: searchValue
      };
      console.log(obj);
      for (let i = 0; i < this.selectArr.length; i++) {
        if (this.selectArr[i].pageNum) {
          pageNumber = this.selectArr[i].pageNum;
        } else {
          let totalNum = this.pagesize * this.currentPage;
          if (this.totalA(this.selectArr[i].fName) <= totalNum) {
            pageNumber = 1;
          } else {
            pageNumber = this.currentPage;
          }
        }

        if (this.selectArr[i].searchWhere) {
          if (this.selectArr[i].searchWhere.length == 1) {
            searchWhere = this.selectArr[i].searchWhere;
          } else {
            this.selectArr[i].searchWhere.pop();
          }
          // console.log(this.selectArr[i].searchWhere, "searchW");
        } else {
          searchWhere = [];
        }

        if (searchColumn != "" && this.selectArr[i].fDes == searchColumn) {
          pageNumber = 1;
          searchWhere.push(obj);
        } else {
        }

        let res = await getTableSelData(
          this.selectArr[i].fUrl,
          searchWhere,
          pageNumber,
          this.pagesize,
          loading
        );
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        // console.log(res);
        if (res.State) {
          this.asData = {};
          let obj = {
            fName: this.selectArr[i].fName, //当前字段
            data: JSON.parse(res.Data), //当前字段下拉框的值
            total: res.TTLPage, //当前字段下拉的总页数
            isShowSel: this.selectArr[i].isShowSel //当前下拉框是否显示搜索框
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }

      this.selectAllData = arr;
    },
    isShow(fColumn) {
      let isShow = false;
      this.selectAllData.forEach(ele => {
        if (ele.fName == fColumn) {
          isShow = ele.isShowSel;
        }
      });
      return isShow;
    },
    totalA(fColumn) {
      // console.log(fColumn);
      let num = 0;
      this.selectAllData.forEach(ele => {
        if (ele.fName == fColumn) {
          num = ele.total;
        }
      });
      return num;
    },
    handleSizeChange(val) {
      this.pagesize = val;
      this.getSelectData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getSelectData();
    }
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = newVal;
      this.getTableData(newVal);
      if (this.ruleForm.fType == 1) {
        this.tableHeadData.forEach(item => {
          if (
            item.fColumn == "fPizhong" ||
            item.fColumn == "fChengzhong" ||
            item.fColumn == "fQty1"
          ) {
            this.$set(item, "fReadOnly", 1);
          }
        });
      } else if (this.ruleForm.fType == 2) {
        this.tableHeadData.forEach(item => {
          if (item.fColumn == "fPizhong" || item.fColumn == "fChengzhong") {
            this.$set(item, "fReadOnly", 1);
          }
        });
      } else if (this.ruleForm.fType == 0) {
        this.tableHeadData.forEach(item => {
          if (
            item.fColumn == "fPizhong" ||
            item.fColumn == "fChengzhong" ||
            item.fColumn == "fQty1"
          ) {
            this.$set(item, "fReadOnly", 0);
          }
        });
      }
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
