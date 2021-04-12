<template>
  <div>
    <home-table
      :fTableView="fTableView"
      :tableName="'t_UserLimit_Mst'"
      :isSaveSuccess="isSaveSuccess"
      :searchParams="searchParams"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
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
        :tableName="'t_UserLimit_Mst'"
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
        :tableName="'t_UserLimit_Mst'"
        :rowData="JSON.parse(JSON.stringify(editForm))"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { menus, getUserLimitMenu } from "@/api/index";
import HomeTable from "@/components/HomeTable";
import CreatFrom from "./components/addUserLimit";
import editCreatFrom from "./components/editUserLimit";
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
      //控制侧滑框的方向
      direction: "rtl",
      //表格列头数据
      userTableHead: [],
      //当前行的数据
      editForm: "",
      isSaveSuccess: false,
      searchParams: ["fUserCode", "fUserName"],
      fTableView: "t_UserLimit_Mst",
      isDestory: false,
      newisDestory: false
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
       this.userTableHead.forEach(item => {
        if (item.fColumn == "fUserName") {
          this.$set(item, "fReadOnly", 1);
        }
      });
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
        this.getMenus();
        this.getUserLimit();
      }
      this.drawerValue = false;
    },
    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.isSaveSuccess = true;
        this.getMenus();
        this.getUserLimit();
      }
      this.drawer = false;
    },
    //重新获取菜单
    async getMenus() {
      let user = this.$store.state.user.userInfo;
      let res = await menus(user);
      res = JSON.parse(decryptDesCbc(res, String(user.userDes)));

      if (res.State) {
        this.$store.commit("common/updateMenuList", res.Menuurl.Child);
      }
    },
    async getUserLimit() {
      let fCompanyId = JSON.parse(sessionStorage.getItem("fCompanyId"));
      let userId = JSON.parse(sessionStorage.getItem("user")).userId;
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      let res1 = await getUserLimitMenu([fCompanyId, userId]);
      res1 = JSON.parse(decryptDesCbc(res1, String(userDes)));
      sessionStorage.setItem("userLimit", res1.Data);
    }
  },
  watch: {
    drawerValue: function(val, old) {
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
