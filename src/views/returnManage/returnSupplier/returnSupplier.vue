<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_RetSupply_mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      :isPrint="true"
      :OutboundPrint="false"
      :printView="printView"
      :title="title"
      :isCheck="checkData"
      :isClose="closeData"
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
        :addItem="true"
        :selectArr="selectArr"
        :homeSelArr="homeSelArr"
        :strType="'Outbound'"
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
      <!-- rowData 当前行的数据 -->
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="true"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :rowData="editForm"
        :changeData="changeData"
        :strType="'Outbound'"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "./components/HomeTable";
import CreatFrom from "./components/FormTable";
import EditFormTable from "./components/EditFormTable";
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
      fTableView: "t_RetSupply_mst",
      //审核的数据
      checkData: [true, 3],
      //单据关闭的数据
      closeData: [true, 4],
      printView: [
        "v_OutboundOrder_Mst_Print",
        "v_OutboundOrder_Mst_Print",
        "v_OutboundOrder_Item",
        "t_RetSupply_item"
      ],
      title: ["老邻居物流", "供应商退货单"],
      //是否新增成功
      isSaveSuccess: false,
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_RetSupply_mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_RetSupply_item", "fMstID"],
      //表单需要下拉选择的数据
      //fName 需要做下拉的字段，fUrl 下拉选择的数据的接口，fDes 下拉选择的label值 ,fID选择绑定的值
      //fAuto 需要自动带出的值
      //fAutoID 需要转换使用fID的值
      selectArr: [
        {
          fName: "fSupplierCode",
          fUrl: "v_Supplier",
          fDes: "fSupplierCode",
          fID: "fID",
          fAuto: [
            "fConsignorID",
            "fSupplierCode",
            "fSupplierName",
            "fSupplyID",
            "fConsignorName"
          ],
          fAutoID: ["fSupplyID"],
          isShowSel: true
        },
        {
          fName: "fSupplierName",
          fUrl: "v_Supplier",
          fDes: "fSupplierName",
          fID: "fID",
          fAuto: [
            "fConsignorID",
            "fSupplierCode",
            "fSupplierName",
            "fSupplyID",
            "fConsignorName"
          ],
          fAutoID: ["fSupplyID"],
          isShowSel: true
        },
        {
          fName: "fStateName",
          fUrl: "t_RetSupplier_State",
          fDes: "fStateName",
          fID: "fID",
          fAuto: ["fState"],
          fEdit: [{ key: "fState", value: "fID" }],
          isShowSel: false
        }
      ],
      //新增字表需要下拉选择的数据
      selectArr2: [
        {
          fName: "fProductName",
          fUrl: "v_Stock",
          fDes: "fProductName",
          fID: "fID",
          fAuto: [
            "fProductCode",
            "fProductID",
            "fBatchNo",
            "fQpcstr",
            "fUnitName",
            "fUnit",
            "fProdDate",
            "fExpireDate"
          ],
          fAutoID: ["fProductID"],
          fEdit: [
            { key: "fProdDate", value: "fProductionDate" },
            { key: "fExpireDate", value: "fExpiration" }
          ],
          isShowSel: true
        },
        {
          fName: "fProductCode",
          fUrl: "v_Stock",
          fDes: "fProductCode",
          fID: "fID",
          fAuto: [
            "fProductName",
            "fProductID",
            "fBatchNo",
            "fQpcstr",
            "fUnitName",
            "fUnit",
            "fProdDate",
            "fExpireDate"
          ],
          fAutoID: ["fProductID"],
          fEdit: [
            { key: "fProdDate", value: "fProductionDate" },
            { key: "fExpireDate", value: "fExpiration" }
          ],
          isShowSel: true
        }
      ],
      homeSelArr: [
        //   {
        //   fName: "fSupplierName",
        //   fUrl: "v_Stock",
        //   fDes: "fSupplierName",
        //   fID: "fID",
        //   fAuto: ["fSupplierCode"],
        //   fAutoID: ["fSupplierID"]
        // },
        // {
        //   fName: "fSupplierCode",
        //   fUrl: "v_Stock",
        //   fDes: "fSupplierCode",
        //   fID: "fID",
        //   fAuto: ["fSupplierName"],
        //   fAutoID: ["fSupplierID"]
        // },
        //  {
        //   fName: "fStorageCode",
        //   fUrl: "v_Stock",
        //   fDes: "fStorageCode",
        //   fID: "fID",
        //   // fAuto: ["fSupplierCode"],
        //   // fAutoID: ["fSupplierID"]
        // },
      ],
      batchDelTableName: [
        {
          Key: "t_RetSupply_item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      //字表表格需要做下拉框的字段 及需要转换的id值
      // key:需要做下拉框的字段名  fKey:需要装换的id值
      changeData: [
        { key: "fNumUnitName", fKey: "fOutboundNumUnit" },
        { key: "fWeightUnitName", fKey: "fWeightUnit" },
        { key: "fVolumetUnitName", fKey: "fVolumetUnit" }
      ],
      StateObj: [
        { key: "fState", val: 1 },
        { key: "fStateName", val: "初始" }
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
