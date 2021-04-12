<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Receive_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openEditDrawer="openEditDrawer"
      :batchDelTableName="batchDelTableName"
      :isItem="true"
      :isPrint="true"
      :printView="printView"
      :title="title"
    ></HomeTable>
    <!-- <el-drawer
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
        :strType="'Inbound'"
      ></CreatFrom>
    </el-drawer> -->
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
        :rowData="editForm"
        :changeData="changeData"
        :strType="'Inbound'"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "./components/HomeTable";
// import CreatFrom from "./components/Add/FormTable";
import EditFormTable from "./components/Edit/EditFormTable";
export default {
  components: {
    // CreatFrom,
    HomeTable,
    EditFormTable
  },
  data() {
    return {
      // drawer: false,
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
      fTableView: "t_Receive_Mst",
      printView: [
        "t_InboundOrderData",
        "v_InboundOrderData",
        "v_Receive_Item",
        "t_Receive_Item"
      ],
      title: ["老邻居配送中心", "收货单"],
      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_Receive_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_Receive_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_Receive_Item", "fMstID"],
      selectArr: [],
      //字表表格需要做下拉框的字段 及需要转换的id值
      // key:需要做下拉框的字段名  fKey:需要装换的id值
      changeData: [
        { key: "fNumUnitName", fKey: "fInboundNumUnit" },
        { key: "fWeightUnitName", fKey: "fWeightUnit" },
        { key: "fVolumetUnitName", fKey: "fVolumetUnit" }
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
    drawerValue: function(val, old) {
      // console.log(val)
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
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
  }
};
</script>
<style lang="scss" scoped></style>
