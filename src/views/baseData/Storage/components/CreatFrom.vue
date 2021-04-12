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
            placeholder="选择日期时间"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-date-picker>

          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
            @change="getColumn(item.fColumn, ruleForm[item.fColumn])"
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
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { creatRules, defaultForm } from "@/utils/common";

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
    }
  },

  methods: {
    submitForm(formName) {
      // console.log(this.ruleForm,"this.ruleForm",this.ruleForm.fDimensionFrom.length,this.ruleForm.fDimensionTo.length)

      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (
            this.ruleForm.fDimensionFrom.length !=
            this.ruleForm.fDimensionTo.length
          ) {
            this.$message.warning("维度开始和维度结束输入的位数需一致!");
          } else {
            this.$message.success("新增成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
            this.ruleForm = {};
            this.ruleForm = defaultForm(this.tableHead);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      // this.ruleForm={};
      this.$emit("closeBox");
    },
    getColumn(column, data) {
      if (column == "fIncrement" && data == 0) {
        this.$message.warning("请输入增量大于0的数!");
        this.ruleForm.fIncrement = "";
      }
    }
  },
  created() {
    this.ruleForm = defaultForm(this.tableHead);
    this.rules = creatRules(this.tableHead);
  }
};
</script>
<style lang="scss" scoped></style>
