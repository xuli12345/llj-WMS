<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Electronictag_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :batchDelTableName="batchDelTableName"
      :isItem="true"
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
        :selectArr2="selectArr2"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <EditFormTable
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="true"
        :rowData="editForm"
        :formData="formData"
      ></EditFormTable>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "../components/HomeTable";
import CreatFrom from "../components/FormTable";
import EditFormTable from "../components/EditFormTable";
export default {
  components: {
    HomeTable,
    CreatFrom,
    EditFormTable
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
      //新增从表数据
      formData: {},
      fTableView: "t_Electronictag_Mst",
      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_Electronictag_Item",
          Value: [
            { Key: "fIP", Value: "fIP" },
            { Key: "fPort", Value: "fPort" }
          ]
        }
      ],
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_Electronictag_Mst", "fIP"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_Electronictag_Item", "fIP"],

      selectArr: [
        // {
        //   fName: "fStateName",
        //   fUrl: "v_Type_Parts_InState",
        //   fDes: "fTypeName",
        //   fID: "fID",
        //   fAuto: ["fState"],
        //   fAutoID: ["fState"]
        // }
      ],
      selectArr2: [
        {
          fName: "fTypeName",
          fUrl: "v_Type_Electronictag",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fType"],
          fAutoID: ["fType"]
        }
      ]
    };
  },
  watch: {
    drawerValue: function(val, old) {
      // console.log(val)
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
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
    //双击/修改弹框
    openEditDrawer(row, headData) {
      this.tableHeadData = headData;
      this.editForm = row;
      this.formData = {
        fIP: row.fIP,
        fPort: row.fPort
      };
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
<style lang="scss" scoped></style>
