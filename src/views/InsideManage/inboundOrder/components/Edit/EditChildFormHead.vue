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
      label-width="120px"
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
            :disabled="isDisabled"
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
          <!-- 从表入库金额 -->
          <el-input
            v-else-if="
              (item.fColumn == 'fInboundNum' && item.fDataType == 'decimal') ||
                (item.fColumn == 'fPrice' && item.fDataType == 'decimal')
            "
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
            @change="getPartsValue"
          ></el-input>
          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-checkbox>
          <el-input
            v-else
            v-model="ruleForm[item.fColumn]"
            :disabled="isDisabled"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { creatRules, defaultForm, compare } from "@/utils/common";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  getTableHeadData,
  getTableBodyData,
  getTableSelData
} from "@/api/index";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: [
    "fTableViewHead",
    "addItem",
    "selectArr",
    "rowData",
    "Amount",
    "Qtystr",
    "Num",
    "fCustomerID"
  ],
  data() {
    return {
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      tableHead: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      //需要下拉选择的所有数据
      selectAllData: [],
      //是否禁用(根据状态已审核为禁用状态)
      isDisabled: false,
      //分页
      currentPage: 1,
      pagesize: 100,
      asData: {},
      CustomerID: this.fCustomerID
    };
  },
  created() {
    this.getTableHeadData();
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData(true);
    }

    if (this.rowData) {
      this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
      // if (this.ruleForm.fQtystr == null) {
      //   this.$set(this.ruleForm, "fQtystr", 0);
      // }
      if (this.ruleForm.fMstState && this.ruleForm.fMstState != 1) {
        this.isDisabled = true;
      }
      this.ruleForm.fModifyDate = new Date();
    } else {
      this.ruleForm = defaultForm(this.tableHead);
    }
  },
  methods: {
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
        this.rules = creatRules(this.tableHead);
      } else {
        this.$message.error(res.Message);
      }
    },
    //新增子项,提交
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // this.$message.success("添加成功!");
          this.$notify({
            title: "新增",
            message: "新增成功",
            type: "success"
          });
          this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
          this.ruleForm = {};
        } else {
          return false;
        }
      });
    },
    //取消
    resetForm(formName) {
      this.ruleForm = {};
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
      // console.log(this.selectArr)
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
      // console.log(data);
      this.selectArr.forEach(ele => {
        if (ele.fName == n && ele.fAuto) {
          ele.fAuto.forEach(item => {
            // console.log(ele, item, "ite");
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
      let arr = [];
      let pageNumber = 1;
      let where = [];
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

      if (this.fCustomerID) {
        where = [
          {
            Computer: "=",
            DataFile: "fCustomerID",
            Value: this.CustomerID
          }
        ];
      }
      let searchWhere = [];
      let res;
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
        if (
          this.selectArr[i].fName == "fProductName" ||
          this.selectArr[i].fName == "fProductCode"
        ) {
          if (
            searchColumn == "fProductName" &&
            this.selectArr[i].fDes == searchColumn
          ) {
            console.log(1, obj);
            pageNumber = 1;
            where.push(obj);
          } else if (
            searchColumn == "fProductCode" &&
            this.selectArr[i].fDes == searchColumn
          ) {
            console.log(2);
            pageNumber = 1;
            where.push(obj);
          } else {
          }

          res = await getTableSelData(
            this.selectArr[i].fUrl,
            where,
            pageNumber,
            this.pagesize,
            loading
          );
        } else if (this.selectArr[i].searchWhere) {
          if (this.selectArr[i].searchWhere.length == 1) {
            searchWhere = this.selectArr[i].searchWhere;
          } else {
            this.selectArr[i].searchWhere.pop();
          }

          res = await getTableSelData(
            this.selectArr[i].fUrl,
            searchWhere,
            pageNumber,
            this.pagesize,
            loading
          );
        } else {
          searchWhere = [];
          if (searchColumn != "" && this.selectArr[i].fDes == searchColumn) {
            pageNumber = 1;
            searchWhere.push(obj);
          }
          res = await getTableSelData(
            this.selectArr[i].fUrl,
            searchWhere,
            pageNumber,
            this.pagesize,
            loading
          );
        }

        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        console.log(res, "where3");
        if (res.State) {
          this.asData = {};
          let obj = {
            fName: this.selectArr[i].fName, //当前字段
            data: JSON.parse(res.Data), //当前字段下拉框的值
            total: res.TTLPage,
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
    },
    //计算总金额
    getPartsValue() {
      let fPrice = 0,
        fInboundNum = 0;
      if (this.ruleForm.fPrice) {
        fPrice = this.ruleForm.fPrice;
      }
      if (this.ruleForm.fInboundNum) {
        fInboundNum = this.ruleForm.fInboundNum;
      }
      let value = Number(fPrice) * parseInt(fInboundNum);
      this.$set(this.ruleForm, "fAmount", value);
    }
  },
  watch: {
    Qtystr(newVal, oldVal) {
      this.$set(this.ruleForm, "fQtystr", newVal);
    },
    Num(newVal, oldVal) {
      this.$set(this.ruleForm, "fTotalNum", newVal);
    },
    Amount(newVal, oldVal) {
      this.$set(this.ruleForm, "fTotalAmount", newVal);
    },
    fCustomerID(newVal, oldVal) {
      this.CustomerID = newVal;
      this.getSelectData();
    }
  }
};
</script>
<style lang="scss" scoped></style>
