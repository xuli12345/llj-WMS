<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Vehcile_Driver_People'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
    ></HomeTable>

    <!-- 新增侧滑框  -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Vehcile_Driver_People'"
        :selectArr="selectArr"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Vehcile_Driver_People'"
        :rowData="editForm"
        :selectArr="selectArr"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "@/components/NotByHomeTable";
import CreatFrom from "@/components/CreatFrom";
import editCreatFrom from "@/components/editCreatFrom";
import { getTableBodyData } from "@/api/index";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      direction: "rtl",
      //新增销毁创建
      newisDestory: false,
      //修改销毁创建
      isDestory: false,
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_Vehcile_Driver_People",
      //是否新增成功
      isSaveSuccess: false,
      selectArr: [
        {
          fName: "fVehicleNo",
          fUrl: "v_Vehcile_Driver",
          fDes: "fVehicleNo",
          fID: "fID",
          fAuto: ["fMstID", "fLicenseNo"],
          fAutoID: ["fMstID"]
        },
        {
          fName: "fLicenseNo",
          fUrl: "v_Vehcile_Driver",
          fDes: "fLicenseNo",
          fID: "fID",
          fAuto: ["fMstID", "fVehicleNo"],
          fAutoID: ["fMstID"]
        },
        {
          fName: "fHrCode",
          fUrl: "v_Hr_mst",
          fDes: "fHrCode",
          fID: "fID",
          fAuto: ["fHrID", "fHrName"],
          fAutoID: ["fHrID"]
        },
        {
          fName: "fHrName",
          fUrl: "v_Hr_mst",
          fDes: "fHrName",
          fID: "fID",
          fAuto: ["fHrID", "fHrCode"],
          fAutoID: ["fHrID"]
        },
        // {
        //   fName: "fModelName",
        //   fUrl: "v_VehicleModel",
        //   fDes: "fModelName",
        //   fID: "fID",
        //   fAuto: ["fMstID", "fVehicleNo"],
        //   fAutoID: ["fMstID"]
        // }
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
    }
  },
  methods: {
    //新增
    openDrawer(headData) {
      this.tableHeadData = headData;
      this.drawer = true;
      this.isSaveSuccess = false;
    },
    //双击修改弹框
    openEditDrawer(row, headData) {
      this.tableHeadData = headData;
      this.editForm = row;
      this.drawerValue = true;
      this.isSaveSuccess = false;
    },

    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    //关闭修改弹窗
    closeEditBox(val) {
      if (val) {
        this.isSaveSuccess = true;
      }
      this.drawerValue = false;
    },

    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.isSaveSuccess = true;
      }
      this.drawer = false;
    }
  }
};
</script>
<style lang="scss"></style>
