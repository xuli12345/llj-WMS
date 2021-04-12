<template>
  <div>
    <HomeTable :fTableView="fTableView"></HomeTable>
  </div>
</template>
<script>
import HomeTable from "./components/HomeTable";

export default {
  components: {
    HomeTable
  },
  data() {
    return {
      fTableView: "t_OutboundOrderReport",
      //是否新增成功
      isSaveSuccess: false
    };
  }
};
</script>
<style lang="scss"></style>
