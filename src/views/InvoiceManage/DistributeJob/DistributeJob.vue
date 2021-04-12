<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_DistributeJob_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      :isCheck="checkData"
      :checkState="checkState"
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
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
        :fTableViewAlert="fTableViewAlert"
        :addItem="true"
        :selectArr="selectArr"
        :homeSelArr="homeSelArr"
        :StateObj="StateObj"
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
        :fTableViewAlert="fTableViewAlert"
        :addItem="true"
        :selectArr="selectArr"
        :rowData="editForm"
        :homeSelArr="homeSelArr"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "../components/HomeTable";
import CreatFrom from "./components/AddJob";
import EditFormTable from "./components/EditJob";
export default {
  components: {
    CreatFrom,
    EditFormTable,
    HomeTable
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      direction: "rtl",
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      isDestory: false,
      newisDestory: false,
      fTableView: "t_DistributeJob_Mst",
      //审核的数据 5审核
      checkData: [true, 5],
      //是否新增成功
      isSaveSuccess: false,
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_DistributeJob_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_DistributeJob_Item", "fMstID"],
      // 弹出框的ftableview
      fTableViewAlert: ["t_DistributeNotice_Mst"],
      checkState: 1,
      //主表状态
      StateObj: [
        { key: "fState", val: 1 },
        { key: "fStateName", val: "初始" }
      ],
      selectArr: [
        {
          fName: "fSystemName",
          fUrl: "v_Route_System_Mst",
          fDes: "fSystemName",
          fID: "fID",
          fAuto: ["fRouteSystemID"],
          fAutoID: ["fRouteSystemID"],
          isShowSel: false
        }
      ],
      batchDelTableName: [
        {
          Key: "t_DistributeJob_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        },
        {
          Key: "t_JobErrorLog",
          Value: [{ Key: "fID", Value: "fMstID" }]
        },
        {
          Key: "t_JobProduct_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      homeSelArr: [
        {
          fName: "fWarehouseName",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID",
          isShowSel: false
        },
        {
          fName: "fReasonName",
          fUrl: "v_Type_DistributeReason",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fReasonID"],
          fAutoID: ["fReasonID"],
          isShowSel: false
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
      this.drawerExcel = false;
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
  computed: {
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      }
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
  }
};
</script>
<style lang="scss"></style>
