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
      class="flex-wrap"
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
            placeholder="选择日期时间"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-date-picker>
          <!-- 需要使用下拉选择框的 -->
          <template
            v-else-if="
              selectArr && selectArr.length > 0 && selectFunction(item.fColumn)
            "
          >
            <el-select
              filterable
              v-model="ruleForm[item.fColumn]"
              @change="getVal(ruleForm[item.fColumn], item.fColumn)"
              :disabled="item.fReadOnly == 0 ? false : true"
            >
              <el-option
                :value="i[selectVal(item.fColumn)]"
                v-for="i in selectData(item.fColumn)"
                :key="i[selectVal(item.fColumn)]"
                :label="i[selectStr(item.fColumn)]"
              ></el-option>
            </el-select>
          </template>

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
            :disabled="item.fReadOnly == 0 ? false : true"
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
  getOrderNo,
  getTrainsNo
} from "@/api/index";
import VueBus from "@/vueBus";
export default {
  props: ["fTableViewHead", "addItem", "selectArr"],
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
      selectAllData: []
    };
  },
  created() {
    this.getTableHeadData();
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
  },
  mounted() {
    setTimeout(() => {
      this.getOrderNoData();
    }, 100);
  },

  methods: {
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
        this.tableHead.forEach(item => {
          if (
            item.fColumn == "fJobID" ||
            item.fColumn == "fOutmileage" ||
            item.fColumn == "fBackDate" ||
            item.fColumn == "fBackmileage" ||
            item.fColumn == "fLoading" ||
            item.fColumn == "fLoaderCode" ||
            item.fColumn == "fOuterCode" ||
            item.fColumn == "fBackerCode" ||
            item.fColumn == "fShopName" ||
            item.fColumn == "fBoxs" ||
            item.fColumn == "fZBoxs" ||
            item.fColumn == "fCailin"
          ) {
            this.$set(item, "fVisible", 0);
          }
        });
        this.ruleForm = defaultForm(this.tableHead);
        this.$set(this.ruleForm, "fState", 1);
        this.$set(this.ruleForm, "fTypeState", "新增");
        this.rules = creatRules(this.tableHead);
        console.log(this.tableHead, this.rules, "字表表头");
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取车次
    async getTrainsNoData(fPaicheNo) {
      let result = await getTrainsNo(fPaicheNo);
      result = JSON.parse(decryptDesCbc(result, String(this.userDes)));
      // console.log(result);
      if (result.State) {
        this.$emit("chageTrainsNo", result.Data);
      }
    },
    //获取入库单号
    async getOrderNoData() {
      let res = await getOrderNo(this.fTableViewHead);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        for (const key in this.ruleForm) {
          if (key.indexOf("fPaicheNo") != -1) {
            this.ruleForm[key] = res.Data;
          }
        }
        VueBus.$emit("changefPaicheNo", res.Data);
        this.getTrainsNoData(res.Data);
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
    //v表头所有的字段
    selectFunction(v) {
      // console.log(v);
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
    async getVal(val, n) {
      console.log(val, n);
      if (n == "fLicenseNo") {
        this.$emit("changeCarID", val);
        let search = [{ Computer: "=", DataFile: "fMstID", Value: val }];
        let res = await getTableBodyData("v_Vehcile_Driver_People", search);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let resData = JSON.parse(res.Data);
          VueBus.$emit("changeDefaul", resData);
        }
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
      let where = [];
      let searchWhere = [];
      let res;

      for (let i = 0; i < this.selectArr.length; i++) {
        if (this.selectArr[i].searchWhere) {
          searchWhere = this.selectArr[i].searchWhere;
          res = await getTableBodyData(this.selectArr[i].fUrl, searchWhere);
        } else {
          searchWhere = [];
          res = await getTableBodyData(this.selectArr[i].fUrl, searchWhere);
        }
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
  console.log(JSON.parse(res.Data),this.selectArr[i].fUrl)
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
    }
  }
};
</script>
<style lang="scss" scoped>
.el-form-item {
  width: 40%;
}
</style>
