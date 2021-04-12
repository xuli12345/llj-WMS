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
import { getTableHeadData } from "@/api/index";
export default {
  props: ["fTableViewHead", "rowData"],
  data() {
    return {
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      tableHead: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  created() {
    this.getTableHeadData();
    if (this.rowData) {
      this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    }
  },
  methods: {
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
