<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存
      </el-button>
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>取消
      </el-button>
    </div>
    <el-form
      label-position="right"
      label-width="130px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="flex-wrap form-margin"
    >
      <template v-for="(item, index) in tableHead">
        <el-form-item :key="index" :label="item.fColumnDes" :prop="item.fColumn">
          <el-input v-model="ruleForm[item.fColumn]"></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { saveSupply_tq_zxyt } from "@/api/distributor";
import { decryptDesCbc } from "@/utils/cryptoJs";
export default {
  data() {
    return {
      //表单数据
      ruleForm: {},
      //验证规则
      rules: {
        fSupCode: [
          { required: true, message: "供应商代号不能为空", trigger: "blur" }
        ],
        fHtCode: [
          { required: true, message: "合同号不能为空", trigger: "blur" }
        ]
      },
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
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        let InsertData = [];
        InsertData.push(this.ruleForm);
        let res = await saveSupply_tq_zxyt(InsertData);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        console.log(res);
        if (!res.State) {
          return this.$message.error(res.Message);
        }
        this.$emit("closeBox",true);
        return this.$message.success("保存成功");
      });
      //   console.log(this.ruleForm, "ruleForm");
    },

    resetForm(formName) {
      this.ruleForm = {};
      this.$emit("closeBox");
    }
  },

  created() {},
  mounted() {}
};
</script>
<style lang="scss" scoped></style>
