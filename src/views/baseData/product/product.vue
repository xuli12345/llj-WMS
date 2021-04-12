<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Product'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      @openBarCode="openBarCode"
      @openDailog="openDailog"
      :strType="'Goods'"
    ></HomeTable>

    <!-- 新增侧滑框  -->
    <el-drawer
      v-if="newisDestory"
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Product'"
        :showfColumn="showfColumn"
        :selectArr="selectArr"
      ></CreatFrom>
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
        :tableName="'t_Product'"
        :rowData="editForm"
        :selectArr="selectArr"
        :showfColumn="showfColumn"
      ></editCreatFrom>
    </el-drawer>
    <!-- 条码绑定 -->
    <el-drawer
      :modal-append-to-body="true"
      :visible.sync="drawerCode"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <ProductBarCode></ProductBarCode>
    </el-drawer>

    <!--dailog 任务分配 -->
    <el-dialog
      title="条码录入打印"
      width="30%"
      :visible.sync="dialogFormVisible"
      :before-close="handleClose"
    >
      <el-input
        v-model="productBarCode"
        placeholder="请输入货品条码"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">
          <i class="iconfont icon-quxiao"></i>取消</el-button
        >
        <el-button size="mini" type="primary" @click="printCon()">
          <i class="iconfont icon-baocun"></i>打印</el-button
        >
      </span>
    </el-dialog>
    <!-- 打印格式内容 -->
    <div style="width:0;height:0;overflow:hidden">
      <print-product-code
        v-if="isRender"
        ref="Print"
        id="toPrint"
        :tableData="productData"
      ></print-product-code>
    </div>
  </div>
</template>
<script>
import HomeTable from "./components/HomeTable";
import CreatFrom from "./components/CreatFrom";
import editCreatFrom from "./components/EditCreatFrom";
import ProductBarCode from "./components/ProductBarCode";
import PrintProductCode from "./components/PrintProductCode";
import PrintJS from "print-js";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable,
    ProductBarCode,
    PrintProductCode
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      drawerCode: false,
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
      fTableView: "t_Product",
      //是否新增成功
      isSaveSuccess: false,
      dialogFormVisible: false,
      productBarCode: "",
      productData: [],
      isRender: false,
      userDes: this.$store.state.user.userInfo.userDes,
      //新增 /修改 控制显示隐藏的字段
      showfColumn: [
        {
          name: "fIsShelfLife",
          hidden: [
            "fShelfLifeNum",
            "fShelfLifeUnit",
            "fShelfLifeMinDays",
            "fShelfLifeMaxDays",
            "fShelfLifeOutboundDa",
            "fShelfLifeAlertDays"
          ]
        }
      ],
      selectArr: [
        {
          fName: "fShelfLifeUnitName",
          fUrl: "v_Type_ShelfLife",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fShelfLifeUnit"],
          fAutoID: ["fShelfLifeUnit"],
          pageNum: 1,
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
          fName: "fSupplierName",
          fUrl: "v_Supplier",
          fDes: "fSupplierName",
          fID: "fID",
          fAuto: ["fSupplierID"],
          fAutoID: ["fSupplierID"],
          isShowSel: true
        },
        {
          fName: "fUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fUnit"],
          fAutoID: ["fUnit"],
          isShowSel: true
        },

        {
          fName: "fProductTypeName",
          fUrl: "v_Product_KindType",
          fDes: "fType",
          fID: "fID",
          fAuto: ["fProductType"],
          fAutoID: ["fProductType"],
          isShowSel: false
        },
        {
          fName: "fPickingPlace",
          fUrl: "v_Storage_Item",
          fDes: "fStorageBarCode",
          fID: "fID",
          searchWhere: [
            //库位类型3 存储位(筛选不同的库位类型)
            {
              Computer: "=",
              DataFile: "fStorageType",
              Value: 3
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
    //条码绑定弹框
    openBarCode() {
      this.drawerCode = true;
    },

    openDailog() {
      this.dialogFormVisible = true;
    },
    printCon() {
      if (!this.productBarCode) {
        this.$message.warning("请输入打印的货品条码!");
      } else {
        this.productData = [{ productBarCode: this.productBarCode }];

        this.isRender = true;
        setTimeout(() => {
          PrintJS({
            printable: "toPrint",
            type: "html",
            scanStyles: false,
            css: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
          });
        }, 500);
        setTimeout(() => {
          this.isRender = false;
        }, 600);
      }
    },
    //点击x dailog关闭弹窗
    handleClose(done) {
      this.drawer = false;
      this.dialogFormVisible = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
      this.drawerCode = false;
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
