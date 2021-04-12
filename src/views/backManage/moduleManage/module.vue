<template>
  <div>
    <moduleHome
      :fTableView="fTableView"
      :tableName="'t_Mod_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      @delSuccess="delSuccess"
    ></moduleHome>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Mod_Mst'"
        :fColumn="fColumn"
        :selData="selData"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Mod_Mst'"
        :rowData="editForm"
        :fColumn="fColumn"
        :selData="selData"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import moduleHome from "./moduleHome";
import CreatFrom from "./CreatFrom";
import editCreatFrom from "./editCreatFrom";
import { menus, getTableBodyData, getItemMenus } from "@/api/index";
export default {
  components: {
    moduleHome,
    CreatFrom,
    editCreatFrom
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      direction: "rtl",
      //表格列头数据
      tableHeadData: [],
      //表格内容列表
      tableData: [],
      //当前行的数据
      editForm: {},
      fTableView: '["t_Mod_Mst"]',
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      //是否新增成功
      isSaveSuccess: false,
      fColumn: ["fType", "fPID"],
      selData: [
        {
          name: "fType",
          data: [
            { fType: 0, fColumnDes: "模块程序" },
            { fType: 1, fColumnDes: "模块分类" }
          ]
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
      }
      this.drawerValue = false;
    },
    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.isSaveSuccess = true;
        this.getMenus();
      }

      this.drawer = false;
    },
    delSuccess(val) {
      if (val) {
        this.getMenus();
      }
    },
    //新增/修改成功重新调用主菜单
    async getMenus() {
      let user = this.$store.state.user.userInfo;
      let res = await menus(user);
      res = JSON.parse(decryptDesCbc(res, String(user.userDes)));
      if (res.State) {
        this.$store.commit("common/updateMenuList", res.Menuurl.Child);
      }
    },
    //获取菜单
    async getMenuList() {
      let res = await getItemMenus([
        ["1"],
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let menus = [];
        let result = res.Menuurl.Child;
        let data = result.map((item, index) => {
          return {
            fType: item.MenuID,
            fColumnDes: item.MenuName
          };
        });
        let object = {
          name: "fPID",
          data: data
        };
        let obj = {
          fType: 0,
          fColumnDes: "顶级模块"
        };
        data.unshift(obj);
        menus.push(object);
        this.selData = [...this.selData, ...menus];
      }
    },
    //下拉框数据
    async getSelData() {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fType",
          Value: 1
        }
      ];
      let res = await getTableBodyData("t_Mod_Mst", searchWhere);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res)
      if (res.State) {
        let result = JSON.parse(res.Data);
        let menus = [];
        let data = result.map((item, index) => {
          return {
            fType: item.fID,
            fColumnDes: item.fModName
          };
        });
        let object = {
          name: "fPID",
          data: data
        };
        let obj = {
          fType: 0,
          fColumnDes: "顶级模块"
        };
        data.unshift(obj);
        menus.push(object);
        this.selData = [...this.selData, ...menus];
      }
    }
  },
  created() {
    this.getMenuList();
    this.getSelData();
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
</style>
