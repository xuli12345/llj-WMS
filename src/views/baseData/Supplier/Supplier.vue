<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Supplier'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
    ></HomeTable>

    <!-- 新增侧滑框   -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Supplier'"
        :selectArr="selectArr"
        :fVisibleColumn="fVisibleColumn"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Supplier'"
        :rowData="editForm"
        :selectArr="selectArr"
        :selectParams="selectParams"
        :fVisibleColumn="fVisibleColumn"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "@/components/HomeTable";
import editCreatFrom from "./components/EditCreatFrom";
import CreatFrom from "./components/CreatFrom";
import { getTableBodyData } from "@/api/index";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable
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
      fTableView: "t_Supplier",
      //是否新增成功
      isSaveSuccess: false,
      //回显省事联动配的字段
      selectParams: ["fProvince", "fCity", "fDistrict"],
      //需要隐藏的字段
      fVisibleColumn: ["fProvince", "fCity", "fDistrict"],
      userDes: this.$store.state.user.userInfo.userDes,
      selectArr: [
        {
          fName: "fTypeName",
          fUrl: "v_Type_Supplier",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fSupplierType"],
          fAutoID: ["fSupplierType"],
          pageNum: 1,
          isShowSel: false
        },
        {
          fName: "fConsignorName",
          fUrl: "v_Consignor",
          fDes: "fConsignorName",
          fID: "fID",
          fAuto: ["fConsignorID"],
          fAutoID: ["fConsignorID"],
          pageNum: 1,
          isShowSel: false
        },
        {
          fName: "fStorageCode",
          fUrl: "v_Storage_Item",
          fDes: "fStorageCode",
          fID: "fID",
          fAuto: ["fRetPlaceID", "fStorageCode"],
          fAutoID: ["fRetPlaceID"],
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fStorageType",
              Value: 4
            }
          ],
          isShowSel: true
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
    changeColumn() {
      this.tableHeadData.shift();
      this.fVisibleColumn.forEach(item => {
        this.tableHeadData.forEach(ele => {
          if (item == ele.fColumn) {
            this.$set(ele, "fVisible", 1);
          }
        });
      });
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
      this.changeColumn();
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
      this.changeColumn();
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
