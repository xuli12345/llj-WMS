<template>
  <div class="flex-align-center">
    <span>货品类型:</span>
    <!-- @change="selectGetData" -->
    <el-select
      v-model="typeValue"
      clearable
      placeholder="请选择"
      style="width:300px"
      @input="$emit('input', typeValue)"
    >
      <el-option
        v-for="item in options"
        :key="item.fID"
        :label="item.fType"
        :value="item.fID"
      >
      </el-option>
    </el-select>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { getTableHeadData, getTableBodyData } from "@/api/index";
export default {
  data() {
    return {
      typeValue: "",
      options: [],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    async getType(tableView, searchWhere) {
      let res = await getTableBodyData(tableView, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let result = JSON.parse(res.Data);
        return result;
      }
    }
  },

  async created() {
    this.options = await this.getType("v_Product_KindType");
  }
};
</script>
<style lang="scss" scoped></style>
