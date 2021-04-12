<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Storage_Template_Mst'"
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
      <addStorageTemplate
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Storage_Template_Mst'"
        :selectArr="selectArr"
      ></addStorageTemplate>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editStorageTemplate
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Storage_Template_Mst'"
        :rowData="editForm"
        :selectArr="selectArr"
      ></editStorageTemplate>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "@/components/HomeTable";
import addStorageTemplate from "./components/addStorageTemplate";
import editStorageTemplate from "./components/editStorageTemplate";
export default {
  components: {
    HomeTable,
    addStorageTemplate,
    editStorageTemplate
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
      fTableView: "t_Storage_Template_Mst",
      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_CodeRules_Template_Item",
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
          fAuto: ["fWarehouseID","fWarehouseCode"],
          fAutoID: ["fWarehouseID"]
        },
        {
          fName: "fUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fUnit"],
          fAutoID: ["fUnit"],
          // searchWhere: [
          //   {
          //     Computer: "=",
          //     DataFile: "fUnitType",
          //     Value: 5
          //   }
          //  ]
        },
        {
          fName: "fVolumetUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fVolumetUnit"],
          fAutoID: ["fVolumetUnit"],
          // searchWhere: [
          //   {
          //     Computer: "=",
          //     DataFile: "fUnitType",
          //     Value: 7
          //   }
          //  ]
        },
        {
          fName: "fWeightUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fWeightUnit"],
          fAutoID: ["fWeightUnit"],
          // searchWhere: [
          //   {
          //     Computer: "=",
          //     DataFile: "fUnitType",
          //     Value: 9
          //   }
          //  ]
        },
        {
          fName: "fCategoryName",
          fUrl: "v_Type_StorageSize",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fCategory"],
          fAutoID: ["fCategory"]
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
