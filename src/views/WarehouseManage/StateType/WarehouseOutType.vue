<template>
  <div>
    <home-table
      :fTableView="fTableView"
      :tableName="'t_Type_OutboundState'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isHave="true"
    ></home-table>
   
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="userTableHead"
        :tableName="'t_Type_OutboundState'"
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
        :tableHead="userTableHead"
        :tableName="'t_Type_OutboundState'"
        :rowData="JSON.parse(JSON.stringify(editForm))"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "@/components/HomeTable";
import CreatFrom from "@/components/CreatFrom";
import editCreatFrom from "@/components/editCreatFrom";

export default {
  components: {
    HomeTable,
    CreatFrom,
    editCreatFrom
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      isDestory: false,
      newisDestory: false,
      //控制侧滑框的方向
      direction: "rtl",
      //表格列头数据
      userTableHead: [],
      //当前行的数据
      editForm: "",
      isSaveSuccess: false,
      fTableView: "t_Type_OutboundState"
    };
  },
  methods: {
    //新增
    addPopRight() {
      this.drawer = true;
    },
    //新增
    openDrawer(headData) {
      this.userTableHead = headData;
      this.drawer = true;
      this.isSaveSuccess = false;
    },
    //双击修改弹框
    openEditDrawer(row, headData) {
      this.userTableHead = headData;
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
  },
  watch: {
    drawerValue: function(val, old) {
      // console.log(val)
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
    },
    drawer: function(val, old) {
      // console.log(val)
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
    }
  }
};
</script>
<style lang="scss">
.dialog-form {
  width: 100%;
  .el-form-item {
    width: 90%;
  }
}
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
</style>
