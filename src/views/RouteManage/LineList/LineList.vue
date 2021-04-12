<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Heliu_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openEditDrawer="openEditDrawer"
      @openDrawer="openDrawer"
    ></HomeTable>

    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="true"
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
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="true"
        :rowData="editForm"
        :tableHeadData="tableHeadData"
        :selectArr="selectArr"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "./components/HomeTable";
import EditFormTable from "./components/EditFormTable";
import CreatFrom from "./components/FormTable";
import { getTableBodyData } from "@/api/index";
export default {
  components: {
    EditFormTable,
    HomeTable,
    CreatFrom
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
      fTableView: "t_Heliu_Mst",
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_Heliu_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_Heliu_Item", "fMstID"],
      //是否新增成功
      isSaveSuccess: false,
      selectArr: [
        {
          fName: "fJobid",
          fUrl: "v_Getheliu_DistributeJob",
          fDes: "fJobid",
          fID: "fID",
          fEdit: [{ key: "fID", value: "fMstID" }],
          // fAuto: ["fMstState"],
          // fAutoID: ["fMstState"]
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
    drawer: function(val, old) {
      // console.log(val)
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
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
