<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Stock'"
      :isSaveSuccess="isSaveSuccess"
      :stock="true"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      @openNormMoveStorage="openNormMoveStorage"
      @openStorageMove="openStorageMove"
     :homeSelArr="homeSelArr"
    ></HomeTable>

    <!-- 设置在库数量  -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <StockAdjust
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Stock_Adjust'"
        :rowData="editForm"
      ></StockAdjust>
    </el-drawer>

    <el-drawer
      v-if="isDestory"
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Stock'"
        :rowData="editForm"
      ></editCreatFrom>
    </el-drawer>
    <!-- 标准移库  v-if="isDestory" -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerNorm"
      :direction="direction"
      :before-close="handleNormClose"
    >
      <NormFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Stock_Transfer'"
        :selectArr="selectArr"
        :rowData="rowData"
      ></NormFrom>
    </el-drawer>
    <!-- 库位移库  v-if="isDestory" -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerStorageMove"
      :direction="direction"
      :before-close="handleClose"
    >
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import HomeTable from "./components/HomeTable";
import editCreatFrom from "@/components/editCreatFrom";
import CreatFrom from "@/components/CreatFrom";
import StockAdjust from "./components/StockAdjust";
import { getTableHeadData } from "@/api/index";
import { compare } from "@/utils/common";
import NormFrom from "./components/NormFrom";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable,
    StockAdjust,
    NormFrom
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      drawerNorm: false,
      drawerStorageMove: false,
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
      fTableView: "t_Stock",
      //是否新增成功
      isSaveSuccess: false,
      rowData: {},
       //表格的ftableview,自增长字段
      fTableViewItem: ["t_Stock", "fID"],
         userDes: this.$store.state.user.userInfo.userDes,
      //修改要隐藏的字段
      fVisibleColumn: [
        "fContainerCode",
        "fUnit",
        "fProductBarCode",
        "fStorageCode",
        "fStorageBarCode",
        "fUnitName"
      ],
      //只读字段
      fReadOnlyColumn: [
        "fStockNum",
        "fCustomerName",
        "fProductCode",
        "fProductName"
      ],
      selectArr: [
       
        {
          fName: "fTargetBarCode",
          fUrl: "v_Storage_Item",
          fDes: "fStorageCode",
          fID: "fID"
        
        }
      ],
     
       homeSelArr: [
      
        {
          fName: "fAreaName",
          fUrl: "v_Area_Item",
          fDes: "fAreaName",
          fID: "fID"
        },
         {
          fName: "fWarehouseName",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID"
        },
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
    //标准移库
    async openNormMoveStorage(row) {
      let res = await this.getHeadData("t_Stock_Transfer");
      console.log(res);
      this.tableHeadData = res;
      this.drawerNorm = true;
      this.rowData = row;
    },
    //库位移库
    async openStorageMove() {
      let res = await this.getHeadData("t_Stock_Transfer");
      this.tableHeadData = res;
      this.drawerStorageMove = true;
    },

    //设置在库数量
    async openDrawer(tableView, row) {
      this.editForm = row;
      let res = await this.getHeadData(tableView);
      this.tableHeadData = res;
      this.drawer = true;
      this.isSaveSuccess = false;
    },
    //获取头部信息
    async getHeadData(tableView) {
      let res = await getTableHeadData(tableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "表头");
        return result;
      }
    },
    //属性调整
    openEditDrawer(row, headData) {
      headData.forEach(item => {
        this.fVisibleColumn.forEach(element => {
          if (item.fColumn == element) {
            this.$set(item, "fVisible", 0);
          }
        });
      });
      headData.forEach(item => {
        this.fReadOnlyColumn.forEach(element => {
          if (item.fColumn == element) {
            this.$set(item, "fReadOnly", 1);
          }
        });
      });
      this.tableHeadData = headData;
      this.editForm = row;
      this.drawerValue = true;
      this.isSaveSuccess = false;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
      this.drawerStorageMove = false;
    },
    handleNormClose(done) {
      this.drawerNorm = false;
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
      this.drawerNorm = false;
    }
  }
};
</script>
<style lang="scss"></style>
