<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Storage_Mst'"
      :isSaveSuccess="isSaveSuccess"
      :batchDelTableName="batchDelTableName"
      :isItem="true"
      :storage="true"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      @openStorageCode="openStorageCode"
    ></HomeTable>

    <!-- 新增侧滑框   -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <addStorage
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Storage_Mst'"
        :selectArr="selectArr"
      ></addStorage>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editStorage
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Storage_Mst'"
        :rowData="editForm"
        :selectArr="selectArr"
      ></editStorage>
    </el-drawer>
    <!-- 查询导出库位条码 -->
    <el-drawer
      :modal-append-to-body="true"
      :visible.sync="drawerCode"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="CodeDestory"
    >
      <StorageCode></StorageCode>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "@/components/HomeTable";
import addStorage from "./components/addStorage";
import editStorage from "./components/editStorage";
import StorageCode from "./components/StorageCode";
export default {
  components: {
    addStorage,
    editStorage,
    StorageCode,
    HomeTable
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      drawerCode: false,
      newisDestory: false,
      isDestory: false,
      CodeDestory: false,
      direction: "rtl",
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_Storage_Mst",
      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_Storage_Range_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        },
        {
          Key: "t_Storage_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      userDes: this.$store.state.user.userInfo.userDes,
      selectArr: [
        {
          fName: "fWarehouseName",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID",
          fAuto: ["fWarehouseID"],
          fAutoID: ["fWarehouseID"]
        },
        {
          fName: "fTemplateName",
          fUrl: "v_Storage_Template_Mst",
          fDes: "fTemplateName",
          fID: "fID",
          fAuto: ["fTemplateMstID", "fTemplateCode"],
          fAutoID: ["fTemplateMstID"]
          // fEdit: [{ key: "fMstStateName", value: "TypeName" }]
        },
        {
          fName: "fStorageTypeName",
          fUrl: "v_Type_Storage",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fStorageType"],
          fAutoID: ["fStorageType"]
        },
        {
          fName: "fPutOnAreaName",
          fUrl: "v_Area_Item",
          fDes: "fAreaName",
          fID: "fID",
          fAuto: ["fPutOnAreaID"],
          fAutoID: ["fPutOnAreaID"]
        },
        {
          fName: "fAllocationAreaName",
          fUrl: "v_Area_Item",
          fDes: "fAreaName",
          fID: "fID",
          fAuto: ["fAllocationAreaID"],
          fAutoID: ["fAllocationAreaID"]
        },
        {
          fName: "fWorkingAreaName",
          fUrl: "v_Area_Item",
          fDes: "fAreaName",
          fID: "fID",
          fAuto: ["fWorkingAreaID"],
          fAutoID: ["fWorkingAreaID"]
        }
      ]
    };
  },
  computed: {
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      }
    }
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
    drawerCode(newval, oldval) {
      setTimeout(() => {
        this.CodeDestory = newval;
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
    //查询导出库位条码
    openStorageCode() {
      this.drawerCode = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
      this.drawerCode = false;
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
