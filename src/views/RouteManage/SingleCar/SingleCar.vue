<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :isSaveSuccess="isSaveSuccess"
    ></HomeTable>
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
      fTableView: "t_Paiche_Mst",
      //是否新增成功
      isSaveSuccess: false
    };
  }
};
</script>
<style lang="scss"></style>
