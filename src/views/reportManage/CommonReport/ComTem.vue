<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :isSaveSuccess="isSaveSuccess"
      :Desc="desc"
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
    //   t_Rpt_StorageAge
    return {
      fTableView: "",
      //是否新增成功
      isSaveSuccess: false,
      desc: ""
    };
  },
  created() {
    let curretUrl = this.$route.path;
    let strArr = curretUrl.split("/");
    console.log(strArr);
    this.fTableView = strArr[3];
    if (strArr.length == 5) {
      this.desc = "order by fCreateDate desc";
    } else if (strArr.length == 4) {
      this.desc = "";
    }
  }
};
</script>
<style lang="scss"></style>
