<template>
  <div>
    <el-button
      style="margin:0 0 5px 10px"
      type="primary"
      size="mini"
      class="iconfont icon-xinzeng"
      @click="addPopRight"
      :disabled="userLimit('fAdd')"
      >添加客户</el-button
    >

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
      :row-key="getRowKeys"
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="120px"
        >
        </el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click.stop="handleDelete(scope.row, scope.$index)"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增字表数据  -->
    <el-dialog
      title="选择随车人员信息"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="false"
    >
      <alert-table
        @closeBox="closeItemBox"
        :fTableView="'v_get_paichegenche'"
      ></alert-table>
    </el-dialog>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare, userLimit } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
import AlertTable from "./alertTable";
import VueBus from "@/vueBus";
export default {
  props: ["fTableView", "tableName", "isSaveSuccess", "ShopBatchList"],
  components: {
    AlertTable
  },
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      //checkbox选中的数据
      BatchList: [],
      getRowKeys(row) {
        return row.fShopID;
      },
      tableData: [],
      //获取表格数据的fTableView
      fTableViewll: "",
      dialogFormVisible: false,
      fPaicheNo: "",
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    //新增
    addPopRight() {
      //   console.log(this.ShopBatchList);
      if (this.ShopBatchList.length == 0) {
        this.$message.warning("请选择客户");
        return;
      }
      this.tableData = [...this.tableData, ...this.ShopBatchList];
      this.tableData.forEach((item, index) => {
        let fPaicheSn = this.$store.state.common.Jobid;
        this.$set(item, "fPaicheSn", fPaicheSn);
        this.$set(item, "fPaicheNo", this.fPaicheNo);
        this.$set(item, "fShopSn", index + 1);
      });
      this.$emit("delShopData", this.ShopBatchList);
    },
    //关闭新增人员弹窗
    closeItemBox(val) {
      if (val) {
        //排车序号 fPaicheSn fPaicheNo
        let fPaicheSn = this.$store.state.common.Jobid;
        this.tableData = [...this.tableData, ...val];
        this.tableData.forEach(item => {
          this.$set(item, "fPaicheSn", fPaicheSn);
          this.$set(item, "fPaicheNo", this.fPaicheNo);
        });
      }
      this.dialogFormVisible = false;
    },

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      res = JSON.parse(decryptDesCbc(res, String(userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData, "字表表头数据");
      } else {
        this.$message.error(res.Message);
      }
    },

    handleDelete(val, index) {
      // console.log(val, "val");
      VueBus.$emit("shopAddone", val);
      this.tableData.splice(index, 1);
    },
    getfPaicheNo() {
      VueBus.$on("changefPaicheNo", val => {
        // console.log(val);
        this.fPaicheNo = val;
      });
    }
  },
  watch: {
    tableData: function() {
      this.total = this.tableData.length;
    }
  },

  created() {
    this.getTableHeadData();
    this.getfPaicheNo();
  }
};
</script>
<style lang="scss" scoped>
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
</style>
