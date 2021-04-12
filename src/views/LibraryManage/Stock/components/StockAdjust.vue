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
      label-position="right"
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
import { saveStockAdjust } from "@/api/index";
import { creatRules, addParams } from "@/utils/common";

export default {
  data() {
    return {
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
    }
  },
  methods: {
    submitForm(formName) {
      // console.log("保存");
      this.$refs[formName].validate(async valid => {
        if (valid) {
          for (const key in this.ruleForm) {
            if (this.ruleForm[key] == null) {
              this.$set(this.ruleForm, key, 0);
            }
          }
          // console.log(this.ruleForm)
          let result = addParams(this.tableHead, this.ruleForm);
          let res = await saveStockAdjust([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: "fID",
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

          if (res.State) {
            this.$message.success("保存成功!");
            this.$emit("closeBox", res.State);
            this.ruleForm={};
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.ruleForm={};
      this.$emit("closeBox");
    }
  },
  created() {
    this.rules = creatRules(this.tableHead);
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
    this.$set(this.ruleForm, "fOriginalNum", this.ruleForm.fStockNum);
    this.$set(this.ruleForm, "fStockID", this.ruleForm.fID);
    this.$set(this.ruleForm, "fID", 0);
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal));
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.$set(this.ruleForm, "fModifier", userInfo.userId);
      this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
      this.$set(this.ruleForm, "fOriginalNum", this.ruleForm.fStockNum);
      this.$set(this.ruleForm, "fStockID", this.ruleForm.fID);
      this.$set(this.ruleForm, "fID", 0);
      //   this.ruleForm.fModifyDate = new Date();
    }
  },

};
</script>
<style lang="scss" scoped></style>
