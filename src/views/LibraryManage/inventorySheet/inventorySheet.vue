<template>
  <div>
    <!-- :isPrint="true" -->
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_CheckOrder_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      :isCheck="checkData"
      :isClose="closeData"
      :isPrint="true"
      :title="title"
      :printView="printView"
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <!-- addItem 是否需要新增字表的数据 布尔值 true或false-->
      <!-- fTableViewHead 表单的fTableView字段 -->
      <!-- fTableViewItem 表格的fTableView字段 -->
      <!-- selectArr 头部表单需要做下拉选择的表单字段数组 -->
      <!-- selectArr2 新增字表表单需要做下拉选择的表单字段数组 -->
      <CreatFrom
        @closeBox="closeBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :fTableViewAlert="fTableViewAlert"
        :addItem="true"
        :selectArr="selectArr"
        :homeSelArr="homeSelArr"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <!-- rowData 当前行的数据  editFormTable edit-->
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :fTableViewAlert="fTableViewAlert"
        :homeSelArr="homeSelArr"
        :addItem="true"
        :selectArr="selectArr"
        :rowData="editForm"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "./component/HomeTable";
import CreatFrom from "./component/add";
import EditFormTable from "./component/edit";
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
      fTableView: "t_CheckOrder_Mst",
      //审核的数据
      checkData: [true, 7],
      //单据关闭的数据
      closeData: [true, 6],
      //是否新增成功
      isSaveSuccess: false,
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_CheckOrder_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_CheckOrder_Item", "fMstID"],
      // 弹出框的ftableview
      fTableViewAlert: ["t_Stock"],
      //表单需要下拉选择的数据
      //fName 需要做下拉的字段，fUrl 下拉选择的数据的接口，fDes 下拉选择的label值 ,fID选择绑定的值
      //fAuto 需要自动带出的值
      //fAutoID 自动带出的值需要转换使用fID的值
      selectArr: [
        {
          fName: "fMstStateName",
          fUrl: "v_Type_CheckOrderState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fMstState"],
          fAutoID: ["fMstState"],
          isShowSel: false
        },
        {
          fName: "fCustomerName",
          fUrl: "v_Consignor",
          fDes: "fConsignorName",
          fID: "fID",
          fAuto: ["fCustomerID"],
          fAutoID: ["fCustomerID"],
          isShowSel: false
        },
        {
          fName: "fWarehouseName",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID",
          fAuto: ["fWarehouseID"],
          fAutoID: ["fWarehouseID"],
          isShowSel: false
        }
      ],
      batchDelTableName: [
        {
          Key: "t_CheckOrder_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],

      printView: [
        "t_CheckOrderData",
        "v_CheckOrderData",
        "v_CheckOrder_Item",
        "t_CheckOrder_Item"
      ],
      title: ["老邻居配送中心", "商品盘点单"],
      homeSelArr: [
        {
          fName: "fWarehouseName",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID",
          pageNum: 1,
          isShowSel: false
        },
        {
          fName: "fAreaName",
          fUrl: "v_Area_Item",
          fDes: "fAreaName",
          fID: "fID",
          pageNum: 1,
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
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    //关闭修改弹窗
    closeEditBox(val) {
      if (val) {
        // console.log(val,"修改")
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
