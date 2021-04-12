<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :isSaveSuccess="isSaveSuccess"
      :Desc="desc"
      :homeSelArr="homeSelArr"
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
      fTableView: "v_DistributeJob_NofPickingPlace",
      //是否新增成功
      isSaveSuccess: false,
      desc: "",
      homeSelArr: [
        {
          fName: "PlanName",
          fUrl: "v_PickingPlan_Mst",
          fDes: "fPlanName",
          fID: "fID",
          fAuto: ["PlanID"],
          fAutoID: ["PlanID"],
          isShowSel: false
        }
      ]
    };
  }
};
</script>
<style lang="scss"></style>
