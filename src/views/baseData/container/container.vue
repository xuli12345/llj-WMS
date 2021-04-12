<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Container'"
      :isSaveSuccess="isSaveSuccess"
      :containerNum="true"
      :containerSearch="true"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      @openContainer="openContainer"
      @searchContainer="searchContainer"
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
        :tableName="'t_Container'"
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
        :tableName="'t_Container'"
        :rowData="editForm"
        :selectArr="selectArr"
      ></editCreatFrom>
    </el-drawer>
    <!-- 生成容器号 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerContainer"
      :direction="direction"
      :before-close="handleClose"
    >
      <ContainerFrom
        @closeBox="closeContainerBox"
        :tableHead="containerData"
        :tableName="'t_ContainerCode_Mst'"
        :selectArr="selectArr"
        :currentRow="currentRow"
      ></ContainerFrom>
    </el-drawer>
    <!-- 容器弹窗 -->
    <el-dialog
      :title="openTitle"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="true"
    >
      <dialog-table
        @closeBox="closeItemBox"
        :fTableView="fTableViewAlert[0]"
        :tableData="fTableData"
      ></dialog-table>
    </el-dialog>
    <!-- 容器号查询打印 -->
    <el-dialog
      title="容器号查询打印"
      :visible.sync="dialogSearchVisible"
      :append-to-body="true"
      :destroy-on-close="false"
    >
      <alert-table
        @closeBox="searchCloseItemBox"
        :fTableView="'t_ContainerCode_Item'"
        :homeSelArr="homeSelArr"
      ></alert-table>
    </el-dialog>
    <!-- 容器号查询打印格式内容   -->
    <div style="width:0;height:0;overflow:hidden">
    <print-container
      ref="Print"
      id="toPrint"
      v-if="isRender"
      :tableData="searchTableData"
    ></print-container>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import HomeTable from "@/components/HomeTable";
import CreatFrom from "@/components/CreatFrom";
import ContainerFrom from "./components/CreatFrom";
import editCreatFrom from "@/components/editCreatFrom";
import { getTableBodyData, getTableHeadData } from "@/api/index";
import DialogTable from "./components/DialogTable";
import { compare } from "@/utils/common";
import alertTable from "./components/alertTable";
import printContainer from "./components/printContainer";
import PrintJS from "print-js";

export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable,
    DialogTable,
    ContainerFrom,
    alertTable,
    printContainer
  },
  data() {
    return {
      isRender: false,
      drawer: false,
      drawerValue: false,
      drawerContainer: false,
      direction: "rtl",
      //新增销毁创建
      newisDestory: false,
      //修改销毁创建
      isDestory: false,
      openTitle: "",
      dialogFormVisible: false,
      dialogSearchVisible: false,
      // 弹出框的ftableview
      fTableViewAlert: ["t_ContainerCode_Item"],
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //生成容器号数据
      containerData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_Container",
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      //弹窗的表格数据
      fTableData: [],
      //当前行数据
      currentRow: {},
      selectArr: [
        {
          fName: "fTypeOneName",
          fUrl: "v_Type_Container",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fContainerTypeOne"],
          fAutoID: ["fContainerTypeOne"],
          pageNum: 1,
          isShowSel: false
        },
        {
          fName: "fTypeTwoName",
          fUrl: "v_Type_Container",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fContainerTypeTwo"],
          fAutoID: ["fContainerTypeTwo"],
          pageNum: 1,
          isShowSel: false
        },
        {
          fName: "fUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fContainerUnit"],
          fAutoID: ["fContainerUnit"],
          isShowSel: true
          // searchWhere: [
          //   {
          //     Computer: "=",
          //     DataFile: "fUnitType",
          //     Value: 5
          //   }
          // ]
        },
        {
          fName: "fVolumetUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fVolumetUnit"],
          fAutoID: ["fVolumetUnit"],
          isShowSel: true
          // searchWhere: [
          //   {
          //     Computer: "=",
          //     DataFile: "fUnitType",
          //     Value: 7
          //   }
          // ]
        },
        {
          fName: "fWeightUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fWeightUnit"],
          fAutoID: ["fWeightUnit"],
          isShowSel: true
          // searchWhere: [
          //   {
          //     Computer: "=",
          //     DataFile: "fUnitType",
          //     Value: 9
          //   }
          // ]
        }
      ],
      homeSelArr: [
        {
          fName: "fTypeOneName",
          fUrl: "v_Type_Container",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fContainerTypeOne"],
          fAutoID: ["fContainerTypeOne"]
        },
        {
          fName: "fTypeTwoName",
          fUrl: "v_Type_Container",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fContainerTypeTwo"],
          fAutoID: ["fContainerTypeTwo"]
        }
        // {
        //   fName: "fStorageCode",
        //   fUrl: "v_Storage_Item",
        //   fDes: "fStorageCode",
        //   fID: "fID"
        //   // fAuto: ["fState"],
        //   // fAutoID: ["fState"]
        // }
      ],
      // 查询容器号打印的内容
      searchTableData: []
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
    mainTabs(e, o) {
      let name = this.$options._parentVnode.data.key.substring(1);
      let n = e.filter(ele => {
        return ele.name == name;
      });
      if (n.length == 0) {
        var key =
          this.$vnode.key == null
            ? this.$vnode.componentOptions.Ctor.cid +
              (this.$vnode.componentOptions.tag
                ? `::${this.$vnode.componentOptions.tag}`
                : "")
            : this.$vnode.key;
        var cache = this.$vnode.parent.componentInstance.cache;
        var keys = this.$vnode.parent.componentInstance.keys;
        if (cache[key]) {
          if (keys.length) {
            var index = keys.indexOf(key);
            if (index > -1) {
              keys.splice(index, 1);
            }
          }
          delete cache[key];
        }
      }
    }
  },
  methods: {
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData("t_ContainerCode_Mst");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.containerData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      this.dialogFormVisible = false;
    },
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

    openContainer(row) {
      // console.log(row, "row");
      this.drawerContainer = true;
      this.currentRow = row;
    },
    searchContainer() {
      this.dialogSearchVisible = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
      this.drawerContainer = false;
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
    },
    //关闭生成容器号弹窗
    closeContainerBox(value, tableData) {
      if ((value, tableData)) {
        this.fTableData = tableData;
        this.dialogFormVisible = true;
      } else {
        this.drawerContainer = false;
      }
    },
    searchCloseItemBox(val) {
      // console.log(val,!val,'123')
      if (val.length == 0) {
        // console.log('12')
        this.$message.warning("请选择打印的容器编码!");
        return;
      }
      this.searchTableData = val;
      this.dialogSearchVisible = false;
      this.isRender = true;
      setTimeout(() => {
        PrintJS({
          printable: "toPrint",
          type: "html",
          scanStyles: false,
          css: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
        });
      }, 500);
      setTimeout(() => {
        this.isRender = false;
      }, 600);
    }
  },
  computed: {
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      }
    }
  },
  created() {
    this.getTableHeadData();
  }
};
</script>
<style lang="scss">
.el-dialog__body {
  padding-top: 0 !important;
}
// .el-dialog{
//   width: 100% !important;
// }
</style>
