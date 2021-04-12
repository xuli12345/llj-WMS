<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存</el-button
      >
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>取消</el-button
      >
    </div>

    <el-form
      label-position="right"
      label-width="100px"
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
          <template
            v-if="
              selectArr && selectArr.length > 0 && selectFunction(item.fColumn)
            "
          >
            <el-select
              filterable
              v-model="ruleForm[item.fColumn]"
              @change="getName(ruleForm[item.fColumn], item.fColumn)"
            >
              <el-option
                :value="i[selectVal(item.fColumn)]"
                v-for="i in selectData(item.fColumn)"
                :key="i[selectVal(item.fColumn)]"
                :label="i[selectStr(item.fColumn)]"
              ></el-option>
            </el-select>
          </template>

          <el-date-picker
            v-else-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-date-picker>

          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-input
            v-else-if="item.fDataType == 'decimal'"
            v-model="ruleForm[item.fColumn]"
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
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
    <!-- <child-table
      ref="childTable"
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
    ></child-table> -->
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  collectionData,
  getTableBodyData,
  saveStockTransferData
} from "@/api/index";
import { creatRules, defaultForm, addParams } from "@/utils/common";
export default {
  data() {
    return {
      //表单数据
      ruleForm: {},
      //验证规则
      rules: {},
      //需要下拉选择的所有数据
      selectAllData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId
    };
  },
  props: {
    //表头数据
    tableHead: {
      type: Array,
      default: () => []
    },
    //保存的tableName字段
    tableName: {
      type: String,
      default: () => ""
    },
    //需要做下拉框的数据
    selectArr: {
      type: Array,
      default: () => []
    },
    rowData: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    handleChange(value) {
      console.log(value);
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (Number(this.ruleForm.fTransferNum) > this.rowData.fUsableNum) {
            this.$message.warning("移库数量不能大于可用数量");
            return;
          }
          this.$set(
            this.ruleForm,
            "fTargetStorageID",
            this.ruleForm.fTargetBarCode
          );
          let result = addParams(this.tableHead, this.ruleForm);
          let res = await saveStockTransferData([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: null,
                  InsertRow: [result.arr],
                  UpdateRow: null,
                  DeleteRow: null,
                  Columns: result.columns
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          console.log(res, "res");
          if (res.State) {
            this.$message.success("移库成功!");
            this.$emit("closeBox", res.State, res.Identity);
            this.ruleForm = {};
            this.ruleForm = defaultForm(this.tableHead);
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },

    resetForm(formName) {
      // this.ruleForm = {};
      this.$emit("closeBox");
    },

    // 获取所有需要下拉选择的内容
    async getSelectData() {
      let arr = [];
      let searchWhere = [];
      for (let i = 0; i < this.selectArr.length; i++) {
        if (this.selectArr[i].searchWhere) {
          searchWhere = this.selectArr[i].searchWhere;
        } else {
          searchWhere = [];
        }
        let res = await getTableBodyData(this.selectArr[i].fUrl, searchWhere);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        // console.log(JSON.parse(res.Data));
        if (res.State) {
          let obj = {
            fName: this.selectArr[i].fName, //当前字段
            data: JSON.parse(res.Data) //当前字段下拉框的值
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }
      this.selectAllData = arr;
    },
    //判断当前字段是否需要做下拉框
    //v表头所有的字段
    selectFunction(v) {
      let cc = false;
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
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
    getName(val, n) {
      console.log(val, n);
      if (n == "fOriginBarCode") {
      }
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
    }
  },

  created() {
    this.ruleForm = defaultForm(this.tableHead);
    this.rules = creatRules(this.tableHead);
    console.log(this.tableHead);
    this.$set(this.ruleForm, "fOriginStorageID", this.rowData.fStorageID);
    this.$set(this.ruleForm, "fOriginBarCode", this.rowData.fStorageCode);
    this.$set(this.ruleForm, "fBatchNo", this.rowData.fBatchNo);
    this.$set(this.ruleForm, "fGoodsID", this.rowData.fProductID);
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.$set(this.ruleForm, "fCreater", userInfo.userId);
    this.$set(this.ruleForm, "fCreaterCode", userInfo.usercode);
    if (this.rowData.fUsableNum == 0) {
      this.$set(this.ruleForm, "fTransferNum", 0);
    } else {
      this.$set(this.ruleForm, "fTransferNum", this.rowData.fUsableNum);
    }

    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
  },
  watch: {
    rowData(newVal, oldVal) {
      console.log(newVal, oldVal);
      this.$set(this.ruleForm, "fOriginStorageID", newVal.fStorageID);
      this.$set(this.ruleForm, "fOriginBarCode", newVal.fStorageCode);
      this.$set(this.ruleForm, "fBatchNo", newVal.fBatchNo);
      this.$set(this.ruleForm, "fGoodsID", newVal.fProductID);
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.$set(this.ruleForm, "fCreater", userInfo.userId);
      this.$set(this.ruleForm, "fCreaterCode", userInfo.usercode);
      if (newVal.fUsableNum == 0) {
        this.$set(this.ruleForm, "fTransferNum", 0);
      } else {
        this.$set(this.ruleForm, "fTransferNum", newVal.fUsableNum);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
// /deep/ .el-input__inner {
//   height: 40px !important;
// }
/deep/ .el-input-number__decrease {
  border: 1px solid #dcdfe6 !important;
}
</style>
