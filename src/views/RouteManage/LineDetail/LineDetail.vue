<template>
  <div>
    <div class="page flex-wrap">
      <div class="search-title">
        <span>排车序号：</span>
        <el-select
          filterable
          v-model="value"
          @change="changeJobid"
          placeholder="请选择"
        >
          <el-option
            v-for="item in options"
            :key="item.fPaicheSn"
            :label="item.fJobid"
            :value="item.fJobid"
          >
          </el-option>
        </el-select>
      </div>
      <div style="margin:10px 0 0 80px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="search"
          :disabled="userLimit('fQurey')"
          >查询</el-button
        >
      </div>
    </div>

    <div class="content">
      <div class="left">
        <el-tabs
          v-model="activeName"
          @tab-click="handleClick"
          style="margin-left:10px"
        >
          <el-tab-pane label="待排客户" name="first">
            <shop-table
              ref="childTable"
              :fTableView="'t_Paiche_ShopItem'"
              :tableData="tableData"
              @changeBatchList="changeBatchList"
            ></shop-table>
          </el-tab-pane>
          <el-tab-pane label="待排车辆" name="second">
            <car-table
              ref="carTable"
              :fTableView="'v_PaicheGetVehcileDriver'"
              :tableData="carData"
            >
            </car-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="right">
        <div
          style="margin-left:10px; border-bottom:2px solid #ddd;height:40px;line-height: 40px;"
        >
          <el-button
            type="primary"
            size="mini"
            class="iconfont icon-xinzeng"
            @click="addPopRight"
            :disabled="userLimit('fAdd')"
            >新增</el-button
          ><el-button
            type="primary"
            size="mini"
            class="iconfont icon-baocun"
            @click="save('ruleForm')"
            >保存</el-button
          >
          <!-- <el-button
            type="primary"
            size="mini"
            class="iconfont icon-yishenhe"
            @click="handleCheck"
            :disabled="userLimit('fApp')"
            >批准排车单</el-button
          > -->
        </div>
        <car-tabs
          ref="carTabls"
          v-show="isAddCar"
          :countData="countData"
          @deleteOne="deleteOne"
          :ShopBatchList="ShopBatchList"
          @delShopData="delShopData"
        ></car-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import {
  addParams,
  batchDelete,
  userLimit,
  compare,
  handleLineShopID,
  handleLineCarID,
  handleVehData
} from "@/utils/common";
import {
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  collectionData
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import ShopTable from "./components/ShopTable";
import CarTable from "./components/CarTable";
import CarTabs from "./components/CarTabs";
import VueBus from "@/vueBus";
export default {
  components: {
    ShopTable,
    CarTable,
    CarTabs
  },
  data() {
    return {
      activeName: "first",
      rgActiveName: "third",
      tableData: [],
      carData: [],
      options: [],
      value: "",
      isAddCar: false,
      countData: [],
      count: 0,
      //门店资料选中的数据
      ShopBatchList: [],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    deleteOne(index) {
      this.countData.splice(index, 1);
    },
    changeBatchList(data) {
      this.ShopBatchList = data;
    },
    delShopData(data) {
      data.forEach((val, index) => {
        this.tableData.forEach((item, idx) => {
          if (item.fShopID == val.fShopID) {
            this.tableData.splice(idx, 1);
          }
        });
      });
    },

    //left中的Tabs
    async handleClick(tab, event) {
      if (this.activeName == "second") {
        this.carData = await this.getGetHeliuMst("v_PaicheGetVehcileDriver");
      }
    },

    //查询
    async search() {
      if (this.value == "") {
        this.$message.warning("请选择排车序号");
      } else {
        this.changeJobid(this.value);
        this.carData = await this.getGetHeliuMst("v_PaicheGetVehcileDriver");
        this.$refs.carTabls.selectArr[4].searchWhere[0].Value = [];
      }
    },
    //新增
    addPopRight() {
      if (this.value == "") {
        this.$message.warning("请选择排车序号");
      } else {
        this.isAddCar = true;
        this.count++;
        this.countData.push(this.count);
      }
    },
    //批准排车单,
    handleCheck() {
      //   this.billsFn(this.isCheck[1], "批准排车单");
    },
    //获取回显的数据
    async getBackData() {
      let fPaicheSn = this.$store.state.common.PaicheSn;
      let mstComponentArr = this.$refs.carTabls.$refs.ruleForm;
      let fPaicheNo;
      mstComponentArr.forEach(item => {
        fPaicheNo = item.ruleForm.fPaicheNo;
      });
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: "fPaicheSn",
          Value: fPaicheSn
        },
        {
          Computer: "=",
          DataFile: "fPaicheNo",
          Value: fPaicheNo
        }
      ];
      let res = await getTableBodyData("v_Paiche_ShopItem", searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let backData = JSON.parse(res.Data);
        return backData;
      } else {
        this.$message.error(res.Message);
      }
    },
    //保存
    async save() {
      if (this.isAddCar == false) {
        this.$message.warning("没有要保存的数据");
      } else {
        let backData = await this.getBackData();
        let MstTableHead = this.$refs.carTabls.$refs.ruleForm[0].tableHead;
        let PerTableHead = this.$refs.carTabls.$refs.carTable[0].tableHeadData;
        let CustomerTableHead = this.$refs.carTabls.$refs.AddCustomer[0]
          .tableHeadData;
        if (backData.length > 0) {
          //修改
          let fPaicheSn = this.$store.state.common.PaicheSn;
          //随车信息(主表)
          let mstComponentArr = this.$refs.carTabls.$refs.ruleForm;
          let allData = [];
          let mstData = JSON.parse(window.localStorage.getItem("mstData"));
          // console.log(mstData, "mstData");
          mstComponentArr.forEach((item, i) => {
            let MstArr = [];
            MstArr.push(item.ruleForm);
            allData = [...allData, ...MstArr];
            console.log(allData, "allData");
          });
          let wantData = handleLineCarID(mstData, allData); //处理数据，获取修改的，新增的，删除的数据
          let updateArr = wantData[0];
          let insertArr = wantData[1];
          let deletedArr = wantData[2];
          if (insertArr != null) {
            insertArr.forEach(element => {
              this.$set(element, "fPaicheSn", fPaicheSn);
            });
          }
          if (updateArr != null) {
            updateArr.forEach(element => {
              this.$set(element, "fState", 2);
              this.$set(element, "fTypeState", "修改");
            });
          }
          console.log(updateArr, insertArr, deletedArr, "mst");
          //随车人员
          let perComponentArr = this.$refs.carTabls.$refs.carTable;
          let PerData = JSON.parse(window.localStorage.getItem("PerData"));
          console.log(PerData, "PerData");
          let allPerData = [];
          perComponentArr.forEach(item => {
            let perArr = item.tableData;
            allPerData = [...allPerData, ...perArr];
          });
          //去重
          let hash = {};
          const data = allPerData.reduce((preVal, curVal) => {
            hash[curVal.fPeople]
              ? ""
              : (hash[curVal.fPeople] = true && preVal.push(curVal));
            return preVal;
          }, []);
          allPerData = data;
          console.log(allPerData, "allPerData");
          let fPerData = handleVehData(PerData, allPerData); //处理数据，获取修改的，新增的，删除的数据
          let updateArr1 = fPerData[0];
          let insertArr1 = fPerData[1];
          let deletedArr1 = fPerData[2];
          if (insertArr1 != null) {
            insertArr1.forEach(element => {
              this.$set(element, "fPaicheSn", fPaicheSn);
            });
          }
          if (updateArr1 != null) {
            updateArr1.forEach(element => {
              this.$set(element, "fPaicheSn", fPaicheSn);
            });
          }
          console.log(updateArr1, insertArr1, deletedArr1, "fPerData");
          //添加客户
          let CustomerComponentArr = this.$refs.carTabls.$refs.AddCustomer;
          let CustomerData = JSON.parse(
            window.localStorage.getItem("CustomerData")
          );

          let allCustomerData = [];
          CustomerComponentArr.forEach(item => {
            let CustomerArr = item.tableData;
            allCustomerData = [...allCustomerData, ...CustomerArr];
          });
          let fCustomerData = handleLineShopID(CustomerData, allCustomerData); //处理数据，获取修改的，新增的，删除的数据
          let updateArr2 = fCustomerData[0];
          let insertArr2 = fCustomerData[1];
          let deletedArr2 = fCustomerData[2];
          if (insertArr2 != null) {
            insertArr2.forEach(element => {
              this.$set(element, "fPaicheSn", fPaicheSn);
              this.$set(element, "fMstID", fPaicheSn);
            });
          }
          if (updateArr2 != null) {
            updateArr2.forEach(element => {
              this.$set(element, "fPaicheSn", fPaicheSn);
              this.$set(element, "fMstID", fPaicheSn);
            });
          }
          console.log(updateArr2, insertArr2, insertArr2, "cus");
          if (allCustomerData.length == 0) {
            this.$message.warning("没有排车客户");
            return;
          }

          if (allPerData.length == 0) {
            this.$message.warning("没有随车人员");
            return;
          }
          // let JobTypeName = allPerData.some(function(item, index) {
          //   return item.fJobTypeName == "司机";
          // });
          // if (JobTypeName == false) {
          //   this.$message.warning("随车人员至少的有一个司机");
          //   return;
          // }
          // let JobName = allPerData.some(function(item, index) {
          //   return item.fJobTypeName == "装车员";
          // });
          // if (JobName == false) {
          //   this.$message.warning("随车人员至少的有一个装车员");
          //   return;
          // }
          let result = allData.every(function(item, index) {
            return item.fCarID != 0;
          });
          if (result) {
          } else {
            this.$message.warning("车辆不能为空");
            return;
          }

          let res = await collectionData([
            {
              TableName: "t_Paiche_Mst",
              updateData: updateArr,
              insertData: insertArr,
              deleteData: deletedArr,
              headData: MstTableHead
            },
            {
              TableName: "t_Paiche_PeopleItem",
              updateData: updateArr1,
              insertData: insertArr1,
              deleteData: deletedArr1,
              headData: PerTableHead
            },
            {
              TableName: "t_Paiche_ShopItem",
              updateData: updateArr2,
              insertData: insertArr2,
              deleteData: deletedArr2,
              headData: CustomerTableHead
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
          if (res.State) {
            this.$message.success("修改成功!");
            window.localStorage.setItem("mstData", JSON.stringify(allData));
            window.localStorage.setItem("PerData", JSON.stringify(allPerData));
            window.localStorage.setItem(
              "CustomerData",
              JSON.stringify(allCustomerData)
            );
          } else {
            this.$message.error(res.Message);
          }
        } else {
          let fPaicheSn = this.$store.state.common.PaicheSn;
          //随车信息(主表)
          let mstComponentArr = this.$refs.carTabls.$refs.ruleForm;
          let allData = [];
          mstComponentArr.forEach((item, i) => {
            // console.log(item, "item");
            this.$set(item.ruleForm, "fPaicheSn", fPaicheSn);
            this.$set(item.ruleForm, "ftrains", "A00" + (1 + i));
            let MstArr = [];
            MstArr.push(item.ruleForm);
            allData = [...allData, ...MstArr];
            // console.log(allData, "allData");
          });

          //随车人员
          let perComponentArr = this.$refs.carTabls.$refs.carTable;
          console.log(perComponentArr, "perComponentArr");
          let allPerData = [];
          perComponentArr.forEach(item => {
            console.log(item, "随车人员");
            item.tableData.forEach(child => {
              this.$set(child, "fPaicheSn", fPaicheSn);
            });
            let perArr = item.tableData;
            allPerData = [...allPerData, ...perArr];
            console.log(allPerData, "allPerData");
          });
          //去重
          let hash = {};
          const data = allPerData.reduce((preVal, curVal) => {
            hash[curVal.fPeople]
              ? ""
              : (hash[curVal.fPeople] = true && preVal.push(curVal));
            return preVal;
          }, []);
          allPerData = data;
          //添加客户
          let CustomerComponentArr = this.$refs.carTabls.$refs.AddCustomer;
          let allCustomerData = [];
          CustomerComponentArr.forEach(item => {
            item.tableData.forEach(child => {
              this.$set(child, "fPaicheSn", fPaicheSn);
              this.$set(child, "fMstID", fPaicheSn);
            });
            let CustomerArr = item.tableData;
            allCustomerData = [...allCustomerData, ...CustomerArr];
            // console.log(allCustomerData, "allCustomerData");
          });
          if (allCustomerData.length == 0) {
            this.$message.warning("没有排车客户");
            return;
          }
          if (allPerData.length == 0) {
            this.$message.warning("没有随车人员");
            return;
          }

          // let JobTypeName = allPerData.some(function(item, index) {
          //   return item.fJobTypeName == "司机";
          // });
          // if (JobTypeName == false) {
          //   this.$message.warning("随车人员至少的有一个司机");
          //   return;
          // }
          // let JobName = allPerData.some(function(item, index) {
          //   return item.fJobTypeName == "装车员";
          // });
          // if (JobName == false) {
          //   this.$message.warning("随车人员至少的有一个装车员");
          //   return;
          // }
          let result = allData.every(function(item, index) {
            return item.fCarID != 0;
          });
          if (result) {
          } else {
            this.$message.warning("车辆不能为空");
            return;
          }

          let res = await collectionData([
            {
              TableName: "t_Paiche_Mst",
              insertData: allData,
              headData: MstTableHead,
              IdentityColumn: "fID"
            },
            {
              TableName: "t_Paiche_PeopleItem",
              insertData: allPerData,
              headData: PerTableHead
            },
            {
              TableName: "t_Paiche_ShopItem",
              insertData: allCustomerData,
              headData: CustomerTableHead
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
          if (res.State) {
            this.$message.success("保存成功!");
            window.localStorage.setItem("mstData", JSON.stringify(allData));
            window.localStorage.setItem("PerData", JSON.stringify(allPerData));
            window.localStorage.setItem(
              "CustomerData",
              JSON.stringify(allCustomerData)
            );
          } else {
            this.$message.error(res.Message);
          }
        }
      }
    },

    // 获取合流或未合流的配货作业
    async getGetHeliuMst(fTableView, searchWhere = []) {
      let res;
      if (fTableView == "v_GetHeliu_Mst") {
        res = await getTableBodyData(
          fTableView,
          searchWhere,
          0,
          0,
          "order by fJobid desc"
        );
      } else {
        res = await getTableBodyData(fTableView, searchWhere);
      }
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        return result;
      }
    },
    async changeJobid(val) {
      this.countData = [];
      this.$store.commit("common/updateJobid", val);
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fJobid",
          Value: val
        }
      ];
      let res = await this.getGetHeliuMst(
        "v_GetDistributeJob_Shop",
        searchWhere
      );
      this.tableData = res;
      let fPaicheSn = await this.getGetHeliuMst("v_GetHeliu_Mst", searchWhere);
      this.$store.commit("common/updatefPaicheSn", fPaicheSn[0].fPaicheSn);
      this.carData = await this.getGetHeliuMst("v_PaicheGetVehcileDriver");

      this.$refs.carTabls.selectArr[4].searchWhere[0].Value = [];
    },
    changeDefaul() {
      VueBus.$on("changeDefaul", val => {
        console.log(val, "changeDefaul");
        VueBus.$emit("filterCheMst", val);
        this.$store.commit("common/updateSuiche", val);
        //随车信息(主表)
        let mstComponentArr = this.$refs.carTabls.$refs.ruleForm;
        //随车人员
        let perComponentArr = this.$refs.carTabls.$refs.carTable;
        mstComponentArr.forEach((item, index) => {
          perComponentArr.forEach((ele, idx) => {
            // console.log(item.ruleForm.fPaicheNo,ele.fPaicheNo)
            if (item.ruleForm.fPaicheNo == ele.fPaicheNo && index == idx) {
              val.forEach(item => {
                this.$set(item, "fPaicheNo", ele.fPaicheNo);
                this.$set(item, "fPeople", item.fHrID);
              });
              ele.tableData = val;
            }
          });
        });
      });
    }
  },
  async created() {
    this.options = await this.getGetHeliuMst("v_GetHeliu_Mst");
    this.changeDefaul();
  },
  watch: {
    ShopBatchList(newVal, oldVal) {
      // console.log(newVal, oldVal);
    }
  }
};
</script>
<style lang="scss" scoped>
.content {
  width: 100%;
  display: flex;
  height: auto;
  min-height: 100vh;
  .left {
    width: 50%;
    margin-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    resize: horizontal;
    min-width: 10%;
    max-width: 90%;
    border: 1px solid #dddddd;
  }
  .right {
    flex: 1;
    max-width: 50%;
    border: 1px solid #dddddd;
  }
}
</style>
