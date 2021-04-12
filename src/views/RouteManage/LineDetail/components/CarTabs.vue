<template>
  <div>
    <div v-for="(item, index) in countData" :key="index">
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item :name="index + 1">
          <template slot="title">
            <div style="margin-left: 10px" class="msg">
              <div>
                <el-button
                  type="primary"
                  size="mini"
                  class="iconfont icon-shanchu"
                  @click="handleDelete(index)"
                  >删除</el-button
                >
              </div>
              <p style="margin-left:20px;color:#0000fd">
                车次<button
                  style="padding:5px 10px;color:#333;border:1px solid #ddd"
                >
                  {{ backTrainsNo(trainsNo, index) }}</button
                >路线
              </p>
            </div>
          </template>
          <el-tabs
            v-model="rgActiveName"
            @tab-click="rgHandleClick"
            style="margin-left:10px"
          >
            <el-tab-pane label="随车信息" name="third">
              <CarMsg
                :fTableViewHead="'t_Paiche_Mst'"
                ref="ruleForm"
                :selectArr="selectArr"
                @chageTrainsNo="chageTrainsNo"
                @changeCarID="changeCarID"
              ></CarMsg>
            </el-tab-pane>
            <el-tab-pane label="随车人员" name="fourth">
              <car-person ref="carTable" :fTableView="'t_Paiche_PeopleItem'">
              </car-person>
            </el-tab-pane>
          </el-tabs>
          <AddCustomer
            ref="AddCustomer"
            :fTableView="'t_Paiche_ShopItem'"
            :ShopBatchList="ShopBatchList"
            @delShopData="delShopData"
          ></AddCustomer>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
import CarMsg from "./CarMsg";
import CarPerson from "./CarPerson";
import AddCustomer from "./AddCustomer";
import VueBus from "@/vueBus";
export default {
  props: ["countData", "ShopBatchList"],
  components: {
    CarMsg,
    CarPerson,
    AddCustomer
  },
  data() {
    return {
      rgActiveName: "third",
      activeNames: [1],
      trainsNo: "",
      selectArr: [
        {
          fName: "fDockName",
          fUrl: "v_Dock",
          fDes: "fDockName",
          fID: "fID",
          fAuto: ["fSubID"],
          fAutoID: ["fSubID"],
          searchWhere: [
            { Computer: "=", DataFile: "fDockTypeName", Value: "出货码头" }
          ]
        },
        {
          fName: "fVehicleNo",
          fUrl: "v_PaicheGetVehcileDriver",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fCarID"],
          fAutoID: ["fCarID"]
        },
        {
          fName: "fOilCardNo",
          fUrl: "v_GasCard",
          fDes: "fCardNo",
          fID: "fID",
          fAuto: ["fOilcard"],
          fAutoID: ["fOilcard"]
        },
        {
          fName: "fRoadblockNo",
          fUrl: "v_PassCard",
          fDes: "fCardNo",
          fID: "fID",
          fAuto: ["fRoadblock"],
          fAutoID: ["fRoadblock"]
        },
        {
          fName: "fLicenseNo",
          fUrl: "v_PaicheGetVehcileDriver ",
          fDes: "fLicenseNo",
          fID: "fID",
          fAuto: ["fCarID"],
          fAutoID: ["fCarID"],
          searchWhere: [
            {
              Computer: "!=",
              DataFile: "fID",
              Value: ""
            },
            {
              Computer: "=",
              DataFile: "fState",
              Value: "空闲"
            }
          ]
        }
      ],
      //用于筛选不要的车辆数据
      carID: "",
      carIDArr: []
    };
  },
  methods: {
    async rgHandleClick(tab, event) {
      if (this.rgActiveName == "fourth") {
        //this.getsuiCheData();
      }
    },
    // getsuiCheData() {
    //   let carTableCom = this.$refs.carTable;
    //   let baseSuicheData = this.$store.state.common.baseSuicheData;
    //   carTableCom.forEach((item, index) => {
    //     // console.log(item);
    //     baseSuicheData.forEach((val, idx) => {
    //       if (index == idx) {
    //         item.tableData = val;
    //         VueBus.$emit("", val);
    //         this.$store.commit("common/updateSuiche", val);
    //       }
    //     });
    //   });
    // },

    handleChange(val) {
      // console.log(val);
    },
    handleDelete(index) {
      this.$emit("deleteOne", index);
    },
    delShopData(data) {
      this.$emit("delShopData", data);
    },
    changeCarID(id) {
      this.carID = id;
      if (this.selectArr[4].searchWhere[0].Value != "") {
        let arr = [];
        arr = this.carIDArr;
        arr.push(id);
        let searchData = [];
        let obj = {};
        arr.forEach((item, index) => {
          obj = {
            Computer: "!=",
            DataFile: "fID",
            Value: item
          };
          searchData.push(obj);
        });
        // console.log(searchData);
        this.selectArr[4].searchWhere = searchData;
        // console.log(this.selectArr[4].searchWhere);
      } else {
        this.selectArr[4].searchWhere[0].Value = id;
      }
    },
    backTrainsNo(val, index) {
      let str = val.substr(3, 1);
      let trainsStr = val.substr(0, 3);
      str = Number(str) + index;
      // console.log(str);
      if (Number(str) < 10) {
        trainsStr += str;
      } else {
        str = 0;
        let shiS = trainsStr.substr(2, 1);
        shiS = Number(shiS) + 1;
        let firstNum = trainsStr.substr(0, 2);
        trainsStr = firstNum + shiS + str;
      }
      return trainsStr;
    },
    chageTrainsNo(val) {
      this.trainsNo = val;
    }
  },
  watch: {
    carID(newVal, oldVal) {
      // console.log(newVal, oldVal);
      this.carIDArr.push(newVal);
      this.carIDArr = [...new Set(this.carIDArr)];
      // this.getsuiCheData();
    }
  }
};
</script>
<style lang="scss" scoped>
.msg {
  display: flex;
}
</style>
