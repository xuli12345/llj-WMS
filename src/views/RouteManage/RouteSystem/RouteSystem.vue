<template>
  <div>
    <HomeRoute
      :selectArr="selectArr"
      :fTableView="fTableView"
      v-model="changValue"
      @openVehicle="openVehicle"
      @saveSort="saveSort"
    ></HomeRoute>
    <el-button
      type="primary"
      style="margin-left:10px;margin-bottom:5px"
      size="mini"
      class="iconfont icon-xinzeng"
      @click="addPop"
      >新增线路</el-button
    >

    <ItemHome
      ref="itemHome"
      :fTableView="'t_Route_System_Item'"
      :isSaveSuccess.sync="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :tableData="tableData"
      :total="total"
    ></ItemHome>
    <!-- 新增 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatItemTable
        @closeBox="closeBox"
        :selectArr="selectArr2"
        :fTableViewItem="fTableViewItem"
        :fTableViewHead="fTableViewHead"
      ></CreatItemTable>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <EditItemTable
        @closeBox="closeEditBox"
        :selectArr="selectArr2"
        :fTableViewItem="fTableViewItem"
        :fTableViewHead="fTableViewHead"
        :rowData="editForm"
      ></EditItemTable>
    </el-drawer>
    <!-- 分派车辆        :title="'线路分派车辆'"-->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerVehicle"
      :direction="direction"
      :before-close="handleClose"
      v-if="Destory"
    >
      <RouteVehicleItem
        @closeBox="closeBox"
        :selectArr="selectArr"
        :fTableView="'t_Route_System_Item'"
        :fTableViewHead="fTableViewHeadRoute"
        :fTableViewGenche="fTableViewGenche"
      ></RouteVehicleItem>
    </el-drawer>
  </div>
</template>
<script>
import { getTableBodyData, collectionData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import HomeRoute from "./components/RouteHome";
import ItemHome from "./components/ItemHome";
import CreatItemTable from "./components/CreatItemTable";
import EditItemTable from "./components/EditItemTable";
import RouteVehicleItem from "./components/RouteVehicleItem";

export default {
  components: {
    HomeRoute,
    ItemHome,
    CreatItemTable,
    EditItemTable,
    RouteVehicleItem
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      drawerVehicle: false,
      isDestory: false,
      Destory: false,
      newisDestory: false,
      isSaveSuccess: false,
      direction: "rtl",
      //表格列头数据
      tableHeadData: [],
      tableData: [],
      total: 0,
      editForm: {},
      changValue: "",
      fTableView: "t_Route_System_Mst",
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_Route_System_Item", "fMstID"],
      fTableViewItem: ["t_Route_System_ShopItem", "fSystemItemID"],
      fTableViewHeadRoute: ["t_Route_VehicleItem", "fVehicleID"],
      fTableViewGenche: ["t_genche", "fMstID"],
      userDes: this.$store.state.user.userInfo.userDes,
      selectArr: [
        {
          fName: "fCustomerName",
          fUrl: "v_Consignor",
          fDes: "fConsignorName",
          fID: "fID",
          fAuto: ["fCustomerID"],
          fAutoID: ["fCustomerID"]
        },

        {
          fName: "fLoadGradeName",
          fUrl: "v_Type_LoadGrade",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fLoadGradeID"],
          fAutoID: ["fLoadGradeID"]
        },
        // v_Type_Route_System
        {
          fName: "fRouteTypeName",
          fUrl: "v_Type_Route_System",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fRouteType"],
          fAutoID: ["fRouteType"]
        }
      ],
      selectArr2: [
        {
          fName: "fPickSort",
          fUrl: "v_Type_PickSort",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fPickSortID"],
          fAutoID: ["fPickSortID"]
        }
      ]
    };
  },
  watch: {
    drawerValue(newval, oldval) {
      setTimeout(() => {
        this.isDestory = newval;
      }, 10);
    },

    drawer(newval, oldval) {
      setTimeout(() => {
        this.newisDestory = newval;
      }, 10);
    },
    drawerVehicle(newval, oldval) {
      setTimeout(() => {
        this.Destory = newval;
      }, 10);
    },

    changValue(val) {
      // console.log(val, "val");
      this.getTableData();
    }
  },
  //数据发生变化时
  updated() {
    if (this.isSaveSuccess) {
      this.getTableData();
    }
  },
  methods: {
    async getTableData() {
      let searchWhere = [];
      if (this.$store.state.common.changeValue == "") {
        searchWhere = [];
      } else {
        searchWhere = [
          {
            Computer: "=",
            DataFile: "fMstID",
            Value: this.$store.state.common.changeValue
          }
        ];
      }

      let res = await getTableBodyData("v_Route_System_Item", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.isSaveSuccess = false;
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        this.tableData.forEach(element => {
          for (const key in element) {
            if (
              (key.indexOf("Date") != -1 ||
                key.indexOf("time") != -1 ||
                key.indexOf("Time") != -1) &&
              element[key] != null
            ) {
              element[key] = element[key].replace(/T/, " ");
            }
          }
        });
        console.log(this.tableData, "表体内容");
      }
    },
    async saveSort() {
      let tableData = this.$refs.itemHome.tableData;
      let tableHeadData = this.$refs.itemHome.tableHeadData;
      let res = await collectionData([
        {
          headData: tableHeadData,
          updateData: tableData,
          TableName: "t_Route_System_Item"
        }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.$message.success("保存成功!");
        this.getTableData();
      }
    },
    addPop() {
      if (!this.$store.state.common.changeValue) {
        this.$message.warning("请选择运输线路体系!");
        return;
      }
      this.drawer = true;
    },
    //新增
    openDrawer(headData) {
      this.tableHeadData = headData;
      this.drawer = true;
    },
    //双击修改弹框
    openEditDrawer(row, headData) {
      this.tableHeadData = headData;
      this.editForm = row;
      this.drawerValue = true;
    },
    //分派车辆弹窗
    openVehicle() {
      this.drawerVehicle = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
      this.drawerVehicle = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    //关闭修改弹窗
    closeEditBox(val) {
      if (val) {
        this.getTableData();
      }
      this.drawerValue = false;
    },

    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.getTableData();
      }
      this.drawer = false;
      this.drawerVehicle = false;
    }
  },
  created() {
    this.getTableData();
  }
};
</script>
<style lang="scss" scoped></style>
