<template>
  <div>
    <!--   :isCheck="checkData"-->
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_ChengzhongRenWu_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openEditDrawer="openEditDrawer"
      :batchDelTableName="batchDelTableName"
      :homeSelArr="homeSelArr"
    ></HomeTable>

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
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "./components/HomeTable";

import EditFormTable from "./components/EditFormTable";
export default {
  components: {
    HomeTable,
    EditFormTable
  },
  data() {
    return {
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
      fTableView: "t_ChengzhongRenWu_Mst",
      //审核的数据 1审核
      checkData: [true, 1],

      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_ChengzhongRenWu_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_ChengzhongRenWu_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_ChengzhongRenWu_Item", "fMstID"],
      selectArr: [
        {
          fName: "fShopName",
          fUrl: "v_Shop",
          fDes: "fShopName",
          fID: "fID",
          fAuto: ["fShopID", "fShopCode"],
          fAutoID: ["fShopID"],
          isShowSel: false
        },
        {
          fName: "fShopCode",
          fUrl: "v_Shop",
          fDes: "fShopCode",
          fID: "fID",
          fAuto: ["fShopID", "fShopName"],
          fAutoID: ["fShopID"],
          isShowSel: false
        }
      ],
      selectArr2: [
        {
          fName: "fProductName",
          fUrl: "v_Product",
          fDes: "fProductName",
          fID: "fID",
          fAuto: ["fProductCode", "fGoodsID", "fUnitName", "fUnit"],
          fAutoID: ["fGoodsID"],
          isShowSel: true,
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fState",
              Value: 1
            }
          ]
        },
        {
          fName: "fProductCode",
          fUrl: "v_Product",
          fDes: "fProductCode",
          fID: "fID",
          fAuto: ["fProductName", "fGoodsID", "fUnitName", "fUnit"],
          fAutoID: ["fGoodsID"],
          isShowSel: true,
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fState",
              Value: 1
            }
          ]
        }
      ],
      homeSelArr: [
        {
          fName: "fHrCode",
          fUrl: "v_Hr_mst",
          fDes: "fHrCode",
          fID: "fID",
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fJobTypeName",
              Value: "拣货员"
            }
          ],
          isShowSel: true
        }
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
  }
};
</script>
<style lang="scss"></style>
