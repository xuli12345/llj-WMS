<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存
      </el-button>
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>
        取消
      </el-button>
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
          <template v-if="fColumn.length > 0 && fColumn.includes(item.fColumn)">
            <el-select
             filterable
              v-model="ruleForm[item.fColumn]"
              @change="getName(ruleForm[item.fColumn], item.fColumn)"
            >
              <el-option
                :value="i.fType"
                v-for="i in sData(item.fColumn)"
                :key="i.fType"
                :label="i.fColumnDes"
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
import { decryptDesCbc, encryptDesCbc } from "@/utils/cryptoJs.js";
import { addformSaveData, collectionData } from "@/api/index";
import { addParams, creatRules } from "@/utils/common";

export default {
  data() {
    return {
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId
    };
  },
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    rowData: {
      type: Object,
      default: () => {}
    },
    tableName: {
      type: String,
      default: () => ""
    },
    fColumn: {
      type: Array,
      default: () => []
    },
    selData: {
      type: Array,
      default: () => []
    },
    switchArr: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$message.success("新增成功!");
          this.$emit("closeBox", this.ruleForm);
       
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.ruleForm={};
      this.$emit("closeBox");
    },

    sData(v) {
      let arr = [];
      this.selData.forEach(element => {
        if (element.name == v) {
          arr = element.data;
        }
      });
      return arr;
    },
    getName(data, i) {
      // console.log(data, i);
      let arr = this.sData(i);
      this.switchArr.forEach(v => {
        if (v.fColumn == i) {
          this.ruleForm[v.sfColumn] = data;
        }
      });
    }
  },

  created() {
    this.rules = creatRules(this.tableHead);
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
    this.ruleForm.fModifyDate = new Date();

    // console.log(this.ruleForm);
    this.tableHead.forEach(element => {
      if (element.fDataType == "bit" && this.ruleForm[element.fColumn] == 1) {
        this.$set(this.ruleForm, element.fColumn, true);
      } else if (
        element.fDataType == "bit" &&
        this.ruleForm[element.fColumn] == 0
      ) {
        this.$set(this.ruleForm, element.fColumn, false);
      }
    });
    // console.log(this.tableHead);
    if (this.ruleForm.fType) {
      if (this.ruleForm.fType.includes("模块分类")) {
        this.$set(this.ruleForm, "fType", 1);
      } else if (this.ruleForm.fType.includes("模块程序")) {
        this.$set(this.ruleForm, "fType", 0);
      }
    }
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal));

      if (this.ruleForm.fType) {
        if (this.ruleForm.fType.includes("模块分类")) {
          this.$set(this.ruleForm, "fType", 1);
        } else if (this.ruleForm.fType.includes("模块程序")) {
          this.$set(this.ruleForm, "fType", 0);
        }
      }
      this.tableHead.forEach(element => {
        if (element.fDataType == "bit" && this.ruleForm[element.fColumn] == 1) {
          this.$set(this.ruleForm, element.fColumn, true);
        } else if (
          element.fDataType == "bit" &&
          this.ruleForm[element.fColumn] == 0
        ) {
          this.$set(this.ruleForm, element.fColumn, false);
        }
      });
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.$set(this.ruleForm, "fModifier", userInfo.userId);
      this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
      this.ruleForm.fModifyDate = new Date();
    }
  }
};
</script>
<style lang="scss" scoped></style>
