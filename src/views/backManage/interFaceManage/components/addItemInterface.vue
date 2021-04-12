<template>
  <div>
    <div class="btns">
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
      >
        取消</el-button
      >
    </div>
    <el-form
      label-position="right"
      label-width="125px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="flex-wrap form-margin"
      :show-message="false"
    >
      <el-form-item
        v-for="(item, index) in tableHead"
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
        ></el-input>
        <el-checkbox
          v-else-if="item.fDataType == 'bit'"
          v-model="ruleForm[item.fColumn]"
          :disabled="item.fReadOnly == 0 ? false : true"
        ></el-checkbox>

        <el-select
          v-else-if="item.fColumn == 'fDataType'"
          v-model="ruleForm[item.fColumn]"
          placeholder="请选择"
          :disabled="item.fReadOnly == 0 ? false : true"
        >
          <el-option
            v-for="optionItem in selectOptions"
            :key="optionItem.value"
            :label="optionItem.label"
            :value="optionItem.value"
          ></el-option>
        </el-select>
        <el-input
          v-else
          v-model="ruleForm[item.fColumn]"
          :disabled="item.fReadOnly == 0 ? false : true"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { defaultForm, creatRules } from "@/utils/common";
export default {
  name: "addInterface",
  props: ["tableHead", "fTableView"],
  data() {
    return {
      //Columns
      columns: [],
      //表单数据
      ruleForm: {},
      rules: {},
      selectOptions: [
        { label: "字符串", value: "string" },
        { label: "整数", value: "int" },
        { label: "小数", value: "decimal" },
        { label: "布尔值", value: "bit" },
        { label: "数组", value: "bytes" },
        { label: "日期与时间", value: "datetime" }
      ]
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.$message.success("新增成功!");
          this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
          this.ruleForm={};
          this.defaultForm();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$emit("closeBox");
    }
  },
  created() {
    this.rules = creatRules(this.tableHead); 
    this.ruleForm = defaultForm(this.tableHead);
  }
};
</script>
