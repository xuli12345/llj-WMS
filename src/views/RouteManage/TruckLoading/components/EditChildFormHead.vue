<template>
  <div>
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
          <el-date-picker
            v-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            disabled
          ></el-date-picker>
          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            disabled
          ></el-checkbox>
          <el-input v-else v-model="ruleForm[item.fColumn]" disabled></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { creatRules, defaultForm, compare } from "@/utils/common";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { getTableHeadData, getTableBodyData } from "@/api/index";
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
    };
  },
  created() {
    this.getTableHeadData();
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }

    if (this.rowData) {
      this.ruleForm = JSON.parse(JSON.stringify(this.rowData));

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
    async getSelectData() {
      let arr = [];
      let searchWhere = [];
      for (let i = 0; i < this.selectArr.length; i++) {
        let res;
        if (this.selectArr[i].searchWhere) {
          searchWhere = this.selectArr[i].searchWhere;
        } else {
          searchWhere = [];
        }
        res = await getTableBodyData(this.selectArr[i].fUrl, searchWhere);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let obj = {
            fName: this.selectArr[i].fName,
            data: JSON.parse(res.Data)
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }
      //   console.log(arr);
      this.selectAllData = arr;
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
    
  }
};
</script>
<style lang="scss" scoped></style>
