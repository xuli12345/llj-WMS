<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_PGRpl_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :batchDelTableName="batchDelTableName"
      :isItem="true"
      :isCheck="checkData"
      :importExcel="true"
      :isPrint="true"
      :printView="printView"
      :title="title"
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
        :addItem="true"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
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
        :addItem="true"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :rowData="editForm"
        :checkState="checkState"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "./components/HomeTable";
import CreatFrom from "../components/FormTable";
import EditFormTable from "../components/EditFormTable";
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
      fTableView: "t_PGRpl_Mst",
      //审核的数据 4审核
      checkData: [true, 4],
      //初始状态
      checkState: 7,
      //主表状态
      StateObj: [
        { key: "fState", val: 7 },
        { key: "fStateName", val: "初始" }
      ],
      //是否新增成功
      isSaveSuccess: false,
      printView: ["t_PGRplData", "v_PGRplData", "v_PGRpl_Item", "t_PGRpl_Item"],
      title: ["老邻居配送中心", "商品补货单"],
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_PGRpl_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_PGRpl_Item", "fMstID"],
      selectArr: [
        {
          fName: "fRplwayName",
          fUrl: "v_Type_PGRplWay",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fRplway"],
          fAutoID: ["fRplway"],
          isShowSel: false
        },
        {
          fName: "fJobid",
          fUrl: "v_DistributeJob_Mst",
          fDes: "fJobid",
          fID: "fID",
          isShowSel: false
        },
        {
          fName: "fRpldirectionName",
          fUrl: "v_Type_PGRplDirection",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fRpldirection"],
          fAutoID: ["fRpldirection"],
          isShowSel: false
        },

        {
          fName: "fStateName",
          fUrl: "v_Type_PGRplState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fState"],
          fAutoID: ["fState"],
          isShowSel: false
        }
      ],
      //新增字表需要下拉选择的数据
      selectArr2: [
        {
          fName: "fProductName",
          fUrl: "v_Product",
          fDes: "fProductName",
          fID: "fID",
          fAuto: ["fProductCode", "fProductID", "fQpcstr"],
          fAutoID: ["fProductID"],
          isShowSel: true
        },
        {
          fName: "fProductCode",
          fUrl: "v_Product",
          fDes: "fProductCode",
          fID: "fID",
          fAuto: ["fProductName", "fProductID", "fQpcstr"],
          fAutoID: ["fProductID"],
          isShowSel: true
        },

        {
          fName: "fUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fUnitID"],
          fAutoID: ["fUnitID"],
          isShowSel: true
          // searchWhere: [
          //   {
          //     Computer: "=",
          //     DataFile: "fUnitType",
          //     Value: 10
          //   }
          // ]
        },
        {
          fName: "fSupplierName",
          fUrl: "v_Supplier",
          fDes: "fSupplierName",
          fID: "fID",
          fAuto: ["fSupplierID"],
          fAutoID: ["fSupplierID"],
          isShowSel: true
        },

        {
          fName: "fConsignorName",
          fUrl: "v_Consignor",
          fDes: "fConsignorName",
          fID: "fID",
          fAuto: ["fConsignorID"],
          fAutoID: ["fConsignorID"],
          isShowSel: false
        },
        {
          fName: "fTobinName",
          fUrl: "v_Storage_Item",
          fDes: "fStorageBarCode",
          fID: "fID",
          fAuto: ["fTobin"],
          fAutoID: ["fTobin"],
          isShowSel: true
        },
        {
          fName: "fFrombinName",
          fUrl: "v_Storage_Item",
          fDes: "fStorageBarCode",
          fID: "fID",
          fAuto: ["fFrombin"],
          fAutoID: ["fFrombin"],
          isShowSel: true
        }
      ],
      batchDelTableName: [
        {
          Key: "t_DistributeNotice_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
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
