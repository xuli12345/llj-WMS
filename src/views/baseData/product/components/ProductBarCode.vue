<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Product_BarCode_Item'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      isPrint="true"
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
    <el-drawer
      :modal="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Product_BarCode_Item'"
        :selectArr="selectArr"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Product_BarCode_Item'"
        :rowData="editForm"
        :selectArr="selectArr"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "./BarCodeHomeTable";
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
      fTableView: "t_Product_BarCode_Item",
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      selectArr: [
        {
          fName: "fProductCode",
          fUrl: "v_Product",
          fDes: "fProductCode",
          fID: "fID",
          fAuto: ["fProductName","fProductID"],
          fAutoID: ["fProductName","fProductID"],
           isShowSel:true,
        },
        {
          fName: "fProductName",
          fUrl: "v_Product",
          fDes: "fProductName",
          fID: "fID",
          fAuto: ["fProductCode","fProductID"],
          fAutoID: ["fProductCode","fProductID"],
           isShowSel:true,
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
<style lang="scss">

</style>
