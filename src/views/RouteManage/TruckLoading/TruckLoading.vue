<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Paiche_Mst'"
      :isSaveSuccess="isSaveSuccess"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      @openEditDrawer="openEditDrawer"
      @openDeliver="openDeliver"
      @openSign="openSign"
    ></HomeTable>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <!-- rowData 当前行的数据 -->
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :rowData="editForm"
      ></edit-form-table>
    </el-drawer>
    <!-- 配送单打印明细 -->
    <el-drawer
      :modal-append-to-body="true"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <deliver-list></deliver-list>
    </el-drawer>
    <!-- 签收单打印明细  v-if="newisDestory" -->
    <el-drawer
      :modal-append-to-body="true"
      :visible.sync="drawerSign"
      :direction="direction"
      :before-close="handleClose"
    >
      <SignList></SignList>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "./components/HomeTable";
import EditFormTable from "./components/EditFormTable";
import deliverList from "./components/deliverList";
import SignList from "./components/SignCom/SignList";
export default {
  components: {
    EditFormTable,
    HomeTable,
    deliverList,
    SignList
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      drawerSign: false,
      direction: "rtl",
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      isDestory: false,
      //新增销毁创建
      newisDestory: false,
      fTableView: "t_Paiche_Mst",
      //是否新增成功
      isSaveSuccess: false,
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_Paiche_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_RMShopRtnNtc_Item", "fMstID"],
      batchDelTableName: [
        {
          Key: "t_Paiche_PeopleItem",
          Value: [
           
            { Key: "fPaicheSn", Value: "fPaicheSn" },
           
          ]
        },
        {
          Key: "t_Paiche_ShopItem",
          Value: [
          
            { Key: "fPaicheSn", Value: "fPaicheSn" },
          
          ]
        }
      ]
    };
  },
  methods: {
    openDeliver() {
      this.drawer = true;
    },
    openSign() {
      this.drawerSign = true;
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
      this.drawerSign = false;
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
<style lang="scss"></style>
