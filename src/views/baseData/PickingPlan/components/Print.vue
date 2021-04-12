<template>
  <div ref="toPrint">
    <div style="display: flex">
      <div
        v-for="(val, index) in tableData"
        :key="index"
        style="
          width: 25%;
          padding: 10px;
          border: 1px solid gold;
          margin: 0 10px 10px 0;
        "
      >
        <div>货位:{{ val.fStorageCode }}</div>
        <div>( {{ val.fProductCode }} ) {{ val.fProductName }}</div>
        <div>
          {{ val.fProductBarCode }}
        </div>
        <div>
          <span>单位:{{ val.fUnitName }}</span>
          <span style="display: inline-block; margn-left: 30px"
            >规格:{{ val.fQpcstr }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["dataCode"],
  data() {
    return {
      tableData: [],
      dataTime: new Date()
    };
  },

  mounted() {
    this.tableData = this.dataCode;
  },
  watch: {
    dataCode(newVal, oldVal) {
      this.tableData = newVal;
    }
  }
};
</script>

<style>
.input-box /deep/.el-input__inner {
  border: none !important;
}
#svg {
  width: 100% !important;
}
</style>
