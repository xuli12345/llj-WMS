<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_UserGroup_Mst'"
      :isSaveSuccess="isSaveSuccess"
      :batchDelTableName="batchDelTableName"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
    ></HomeTable>

    <!-- 新增 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <addGroup
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_UserGroup_Mst'"
      ></addGroup>
    </el-drawer>
    <!-- 修改 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editGrop
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_UserGroup_Mst'"
        :rowData="editForm"
      ></editGrop>
    </el-drawer>
  </div>
</template>
<script>
import { timeCycle } from "@/utils/updateTime";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { menus, getUserLimitMenu } from "@/api/index";
import { addParams, batchDelete } from "@/utils/common";
import HomeTable from "@/components/HomeTable";
import addGroup from "./components/addGroup";
import editGrop from "./components/editGrop";
export default {
  components: {
    HomeTable,
    addGroup,
    editGrop
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
      //表格内容列表
      tableData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_UserGroup_Mst",
      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_UserGroupLimit_Company",
          Value: [{ Key: "fID", Value: "fGroupID" }]
        },
        {
          Key: "t_GroupLimit_Mod",
          Value: [{ Key: "fID", Value: "fGroupID" }]
        }
      ]
    };
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
<style lang="scss"></style>
