<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="addPopRight"
        :disabled="isDisabled"
        >筛选</el-button
      >
      <!-- <el-button
        type="primary"
        :disabled="isDisabled"
        class="iconfont icon-ziyuan"
        size="mini"
        >排车</el-button
      > -->

      <el-button
        type="primary"
        class="iconfont icon-danju"
        @click="createNotice"
        size="mini"
        :disabled="isDisabled"
        >生成拣货单</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        :disabled="isDisabled"
        >保存</el-button
      >
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
        >取消</el-button
      >
    </div>
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
      :fState="fState"
    ></child-form-head>
    <!-- 表格 -->
    <el-alert
      title="请双击表格中的内容查看货品信息!"
      type="warning"
      :closable="false"
    ></el-alert>

    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="配货信息" name="first">
        <child-table
          ref="childTable"
          :fTableView="fTableViewItem"
          :insertData="insertData"
          :isDisabled="isDisabled"
          :fID="rowData.fID"
          :fState="fState"
          @openEditDrawer="openEditDrawer"
        ></child-table>
      </el-tab-pane>
      <el-tab-pane label="错误日志" name="second">
        <ErrorTable
          :ishow="false"
          :fTableView="'t_JobErrorLog'"
          :tableData="tableData"
        ></ErrorTable>
      </el-tab-pane>
    </el-tabs>
    <!-- 筛选 -->

    <el-dialog
      :title="openTitle"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="true"
    >
      <alert-table
        @closeBox="closeItemBox"
        :fTableView="fTableViewAlert[0]"
        :searchData="searchData"
        :homeSelArr="homeSelArr"
      ></alert-table>
    </el-dialog>
    <!-- 货品从表的从表 -->
    <el-drawer
      :modal="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <JobEditTable
        ref="ItemTable"
        fTableView="t_JobProduct_Item"
        :ItmeSelID="rowData.fID"
        :fOrderNo="fOrderNo"
      ></JobEditTable>
    </el-drawer>
    <!-- 生成拣货单 -->
    <el-dialog :append-to-body="true" title="拣货单" :visible.sync="dialogForm">
      <CreatFrom
        :selectArr="selectArrD"
        :fID="rowData.fID"
        :tableHead="DialogTableHead"
        ref="jobForm"
        v-if="isDestory"
      ></CreatFrom>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogForm = false"
          ><i class="iconfont icon-quxiao"></i>取 消</el-button
        >
        <el-button type="primary" v-preventReClick size="mini" @click="save">
          <i class="iconfont icon-baocun"></i>保存</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { handelData, handleProductfOrderNo, compare } from "@/utils/common";
import {
  collectionData,
  DistributeJob,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "@/components/EditChildFormHead";
import ChildTable from "./EditChildTable";
import ErrorTable from "./ChildTable";
import AlertTable from "./AlertTable";
import JobEditTable from "./JobEditTable";
import CreatFrom from "./CreatFrom";
export default {
  //弹出框请求的表头字段fTableViewAlert searchData:搜索的字段
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "rowData",
    "fTableViewAlert",
    "searchData",
    "homeSelArr"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    AlertTable,
    JobEditTable,
    CreatFrom,
    ErrorTable
  },
  data() {
    return {
      drawer: false,
      newisDestory: false,
      isDestory: false,
      dialogForm: false,
      DialogTableHead: [
        {
          fColumn: "OrderType",
          fColumnDes: "单据类型名称",
          fVisible: 1
        },
        {
          fColumn: "Warehouse",
          fColumnDes: "仓库名称",
          fVisible: 1
        },
        {
          fColumn: "fID",
          fColumnDes: "ID",
          fVisible: 1
        },
        {
          fColumn: "PickingPlanID",
          fColumnDes: "拣货位方案名称",
          fVisible: 1
        }
      ],
      selectArrD: [
        {
          fName: "OrderType",
          fUrl: "v_Type_OutboundOrder",
          fDes: "fTypeName",
          fID: "fID"
        },
        {
          fName: "Warehouse",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID"
        },
        {
          fName: "PickingPlanID",
          fUrl: "v_PickingPlan_Mst",
          fDes: "fPlanName",
          fID: "fID"
        }
      ],
      insertData: {}, //表格添加的数据
      tableData: [], //错误日志的数据
      isDisabled: false,
      dialogFormVisible: false,
      openTitle: "选择货品",
      fMstID: "",
      fState: 1,
      fOrderNo: "", //从表定单号
      activeName: "first",
      timeout: "",
      productHeadData: [],
      productDelData: [],
      productAddData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      userId: JSON.parse(sessionStorage.getItem("user")).userId
    };
  },
  methods: {
    handleClick(tab, event) {
      if (this.activeName == "second") {
        this.getErrorData();
      } else if (this.activeName == "first") {
      }
    },
    openEditDrawer(row) {
      this.fOrderNo = row.fOrderNo;
      this.drawer = true;
    },
    async getTableHeadData() {
      let res = await getTableHeadData("t_JobProduct_Item");

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.productHeadData = res.lstRet.sort(compare);
      }
    },
    //获取所有门店是否在当前线路中
    async shopIsInSystem() {
      let ruleForm = this.$refs.ruleForm.ruleForm;
      let where = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: ruleForm.fRouteSystemID
        }
      ];
      let res = await getTableBodyData("v_Route_System_Item", where);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        // console.log(result);
        let arr = [];
        result.forEach(item => {
          arr.push(item.fID);
        });
        let allID = arr.join();
        let seachWhere = [
          {
            Computer: "in",
            DataFile: "fSystemItemID",
            Value: allID
          }
        ];
        let res1 = await getTableBodyData(
          "v_Route_System_ShopItem",
          seachWhere
        );
        res1 = JSON.parse(decryptDesCbc(res1, String(this.userDes)));
        if (res1.State) {
          let allShopData = JSON.parse(res1.Data);
          // console.log(allShopData,'all')
          return allShopData;
        } else {
          this.$message.error(res1.Message);
        }
      } else {
        this.$message.error(res.Message);
      }
    },
    //  判断某个数组是否包含在另一个数组中
    //判断arr2数组是否包含在arr1数组中
    includes(arr1, arr2) {
      return arr2.every(val => arr1.includes(val));
    },
    //保存
    async submitForm() {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let allShopData = await this.shopIsInSystem();
      // console.log(tableData, allShopData);
      let shopCode = [];
      if (allShopData.length > 0) {
        allShopData.forEach(item => {
          shopCode.push(item.fShopName);
        });
      }

      shopCode = [...new Set(shopCode)];

      let arr = [];
      if (tableData.length > 0) {
        tableData.forEach(ele => {
          arr.push(ele.fShopName);
        });
      }

      let result = this.includes(shopCode, arr);
      // console.log(result);
      if (result) {
        let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
        let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据

        let backData = this.$refs.childTable.backData; //表格原来的数据
        this.fMstID = this.$refs.ruleForm.ruleForm.fID; //字表添加数据时,需要手动添加的键

        // backData.forEach(element => {
        //   for (const key in element) {
        //     if (element[key] == null) {
        //       this.$set(element, key, 0);
        //     }
        //   }
        // });
        // tableData.forEach(element => {
        //   for (const key in element) {
        //     if (element[key] == null) {
        //       this.$set(element, key, 0);
        //     }
        //   }
        // });

        let wantData = handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
        let updateArr = wantData[0];
        let insertArr = wantData[1];
        let deletedArr = wantData[2];
        // console.log(deletedArr);

        // //获取门店货品信息要删除的数据
        // let updateArr1 = null;
        // let insertArr1 = null;
        // let deletedArr1 = null;
        // if (deletedArr != null) {
        //   let wantOrderNo = handleProductfOrderNo(backData, deletedArr); //处理数据，获取修改的，新增的，删除的数据
        //   updateArr1 = wantOrderNo[0];
        //   insertArr1 = wantOrderNo[1];
        //   deletedArr1 = wantOrderNo[2];
        //   let arr = [];
        //   let strOrderNo, search;
        //   if (updateArr1 != null) {
        //     updateArr1.forEach(item => {
        //       arr.push("'" + item.fOrderNo + "'");
        //       console.log(arr);
        //       strOrderNo = arr.join();
        //       search = [
        //         {
        //           Computer: "=",
        //           DataFile: "fMstID",
        //           Value: item.fMstID
        //         },
        //         {
        //           Computer: "in",
        //           DataFile: "fAlcntcNo",
        //           Value: strOrderNo
        //         }
        //       ];
        //     });
        //     // console.log(strOrderNo);
        //     this.productDelData = await this.getProductTableData(
        //       "_JobProduct_Item",
        //       search
        //     );
        //     console.log(this.productDelData);
        //   }
        // }
        //获取门店货品信息要新增的数据
        let updateArr2 = null;
        let insertArr2 = null;
        let deletedArr2 = null;
        if (insertArr != null) {
          let arr = [];
          let strOrderNo, search;
          insertArr.forEach(item => {
            arr.push("'" + item.fOrderNo + "'");
            // console.log(arr);
            strOrderNo = arr.join();
            search = [
              {
                Computer: "in",
                DataFile: "fOrderNo",
                Value: strOrderNo
              }
            ];
          });

          this.productAddData = await this.getProductTableData(
            "v_DistributeNotice_Item",
            search
          );
          this.productAddData.forEach((item, index) => {
            this.$set(item, "fMstID", this.fMstID);
            this.$set(item, "fSort", index + 1);
            this.$set(item, "fAlcntcNo", item.fOrderNo);
          });
          // console.log(this.productAddData, "productAddData");
        }

        this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
          if (valid) {
            let res = await collectionData([
              {
                TableName: this.fTableViewHead[0],
                updateData: [formData],
                headData: formHeadData
              },
              {
                TableName: this.fTableViewItem[0],
                updateData: updateArr,
                insertData: insertArr,
                deleteData: deletedArr,
                headData: childTableData
              },
              {
                TableName: "t_JobProduct_Item",
                updateData: updateArr2,
                insertData: this.productAddData,
                deleteData: deletedArr2,
                headData: this.productHeadData
              }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
            // console.log(res);
            if (res.State) {
              this.$message.success("修改成功!");
              this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
              this.$refs.ruleForm.$refs.ruleForm.resetFields();
            } else {
              this.$message.error(res.Message);
            }
          }
        });
      } else {
        // 筛选出两个数组不同的元素
        let list = [];
        list = arr.filter(item => {
          return shopCode.indexOf(item) === -1;
        });

        list = [...new Set(list)];
        let message = list.join();
        this.$message({
          message: `${message}不在${formData.fSystemName}体系中`,
          showClose: true,
          type: "warning",
          duration: 0
        });
      }
    },
    async getProductTableData(ftableView, searchWhere = []) {
      // this.fTableViewData
      let res = await getTableBodyData(ftableView, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        let resultData = JSON.parse(res.Data);
        console.log(resultData, "表体内容");
        return resultData;
      }
    },
    //取消
    resetForm() {
      this.$emit("closeBox");
    },
    //新增按钮
    addPopRight() {
      this.dialogFormVisible = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        value.forEach(item => {
          this.$set(item, "fSourceOrderNo", item.fOrgBillNo);
        });
        this.insertData = value;
      }
      this.dialogFormVisible = false;
    },
    //生成补货/拣货单
    createNotice() {
      this.dialogForm = true;
      this.isDestory = true;
    },

    async save() {
      let ruleForm = this.$refs.jobForm.ruleForm;
      if ("PickingPlanID" in ruleForm) {
      } else {
        this.$set(ruleForm, "PickingPlanID", "");
      }
      let res = await DistributeJob([
        {
          OrderType: ruleForm.OrderType,
          Warehouse: ruleForm.Warehouse,
          fID: ruleForm.fID,
          PickingPlanID: ruleForm.PickingPlanID
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res, "生成拣货单");
      if (res.State) {
        this.$message.success("生成拣货单成功!");
        this.$emit("closeBox", res.State);
      } else {
        this.$message({
          showClose: true,
          message: res.Message,
          type: "warning",
          duration: 0
        });
      }
      this.dialogForm = false;
    },
    //获取错误日志的数据
    async getErrorData() {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: this.rowData.fID
        }
      ];
      let res = await getTableBodyData("v_JobErrorLog", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
      }
    }
  },
  watch: {
    drawer: function(val, old) {
      // console.log(val, old);
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
    },
    dialogForm: function(val, old) {
      // console.log(val, old);
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
    }
  },
  created() {
    this.getTableHeadData();
    if (this.rowData.fState && this.rowData.fState != this.fState) {
      this.isDisabled = true;
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog {
  margin: 50px auto !important;
}
</style>
