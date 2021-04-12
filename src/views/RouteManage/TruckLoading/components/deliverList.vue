<template>
  <div>
    <deliverHome
      :fTableView="fTableView"
      :tableName="'t_Paiche_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      :isPrint="true"
      :printView="printView"
      :title="title"
    ></deliverHome>
    <el-drawer
      :modal="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
 
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :rowData="editForm"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import deliverHome from "./deliverCom/deliverHome"
import EditFormTable from "./deliverCom/EditFormTable";

export default {
  components: {
    EditFormTable,
    deliverHome
  },
  data() {
    return {
      drawerValue: false,
      direction: "rtl",
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      isDestory: false,
      fTableView: "t_Paiche_Mst",
      //审核的数据
      checkData: [true, 3],
      //单据关闭的数据
      closeData: [true, 4],
      printView: [
        "v_OutboundOrder_Mst_Print",
        "v_OutboundOrder_Mst_Print",
        "v_OutboundOrder_Item",
        "t_OutboundOrder_Item"
      ],
      title: ["老邻居配送中心", "配送单"],
      //是否新增成功
      isSaveSuccess: false,
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_Paiche_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_RMShopRtnNtc_Item", "fMstID"],
      batchDelTableName: [
        {
          Key: "t_RMShopRtnNtc_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      StateObj: [
        { key: "fState", val: 1 },
        { key: "fStateName", val: "初始" }
      ]
    };
  },
  methods: {
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
    }
  }
};
</script>
<style lang="scss"></style>
