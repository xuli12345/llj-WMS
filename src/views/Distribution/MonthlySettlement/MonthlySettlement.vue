<template>
  <div>
    <div class="page flex-wrap">
      <div style="margin-top: 10px">
        <el-button type="primary" size="mini" class="iconfont icon-A" @click="search">查询</el-button>
        <el-button
          type="primary"
          size="mini"
          class="el-icon-document-checked"
          @click="reconCiliation"
        >新增</el-button>
      </div>
    </div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%;margin-top:5px"
      :row-key="getRowKeys"
      :data="tableData| pagination(pageNum, pageSize)"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="60"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
          :column-key="item.fColumn"
        ></el-table-column>
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="page flex-justify-end">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 50, 100, 400]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
    <!-- 新增弹框 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
    >
      <CreateForm @closeBox="closeBox" :tableHead="tableHeadData"></CreateForm>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { saveSupply_tq_zxyt, getSupply_tq_zxyt } from "@/api/distributor";
import CreateForm from "./components/createForm";
export default {
  components: {
    CreateForm
  },
  data() {
    return {
      getRowKeys(row) {
        return row.YWBILLNO;
      },
      selectValue: "", //合同号
      tableHeadData: [
        { fColumn: "FSUPCODE", fColumnDes: "供应商代号" },
        { fColumn: "FSUPNAME", fColumnDes: "供应商名称" },
        { fColumn: "FHTCODE", fColumnDes: "合同号" }
      ], //表头数据
      BatchList: [], //批量
      tableData: [], //表格数据
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      user: this.$store.state.user.userInfo,
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      drawer: false
    };
  },
  computed: {
    total() {
      let total = this.tableData.length;
      return total;
    }
  },
  methods: {
     userLimit(v){
      return userLimit(v)
    },
    //查询
    async search() {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let res = await getSupply_tq_zxyt();
      let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
      res = JSON.parse(decryptDesCbc(res, String(userDes)));
      loading.close();
      if (!res.State) {
        return this.$message.warning(res.Message);
      }
      if (res.Data == "[]") {
        return this.$message.warning("没有数据");
      }
      console.log(JSON.parse(res.Data));
      this.tableData = JSON.parse(res.Data);
    },
    // 新增
    async reconCiliation() {
      this.drawer = true;
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },
    //重置
    reset() {
      this.selectValue = "";
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭新增弹窗
    closeBox(value) {
      // if (value) {
      //   // this.isSaveSuccess = true;
      //   this.drawer = false;
      // }
      this.drawer = false;
    }
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

.el-form-item {
  width: 50%;
}

/deep/ .el-checkbox__inner {
  width: 20px;
  height: 20px;
}
</style>
