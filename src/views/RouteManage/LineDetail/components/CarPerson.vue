<template>
  <div>
    <el-button
      style="margin-bottom:5px"
      type="primary"
      size="mini"
      class="iconfont icon-xinzeng"
      @click="addPopRight"
      :disabled="userLimit('fAdd')"
      >增加人员</el-button
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
          <template slot-scope="scope">
            <el-checkbox
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 0 ? false : true"
            ></el-checkbox>
            <el-input
              v-else
              v-model="scope.row[item.fColumn]"
              :maxlength="scope.row[item.fLength]"
            ></el-input>
          </template>
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
  props: ["fTableView", "tableName", "isSaveSuccess"],
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
        return row.fID;
      },
      tableData: [],
      // tableData: ,
      OrignData: [],
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
      this.dialogFormVisible = true;
    },

    //关闭新增人员弹窗
    closeItemBox(val, change) {
      if (val) {
        // console.log(val, "val");
        let fPaicheSn = this.$store.state.common.Jobid;

        this.tableData = [...this.tableData, ...val];
        let sj = this.tableData.filter(element => {
          return element.fJobTypeName == "司机";
        });

        let zxy = this.tableData.filter(element => {
          return element.fJobTypeName == "装车员";
        });
        if (sj.length >= 2) {
          this.$message.warning("只允许有一个司机");
          let hash = {};
          const data2 = sj.reduce((preVal, curVal) => {
            hash[curVal.fJobTypeName]
              ? ""
              : (hash[curVal.fJobTypeName] = true && preVal.push(curVal));
            return preVal;
          }, []);
          sj = data2;
        }

        if (zxy.length >= 2) {
          let hash = {};
          const data4 = zxy.reduce((preVal, curVal) => {
            hash[curVal.fHrID]
              ? ""
              : (hash[curVal.fHrID] = true && preVal.push(curVal));
            return preVal;
          }, []);
          zxy = data4;
        }

        this.tableData = [...sj, ...zxy];
        this.tableData.forEach((item, index) => {
          this.$set(item, "fPaicheSn", fPaicheSn);
          this.$set(item, "fPaicheNo", this.fPaicheNo);
          this.$set(item, "fPeople", item.fHrID);
        });
        console.log(this.tableData)
      }
      //已经选过的过滤随车人员
      VueBus.$emit("filterCheMst", this.tableData);
      this.$store.commit("common/updateSuiche", this.tableData);
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
      VueBus.$emit("CheAddone", val);
      this.$store.commit("common/updateSuiche", val);
      this.tableData.splice(index, 1);
    },

    getfPaicheNo() {
      VueBus.$on("changefPaicheNo", val => {
        console.log(val)
        this.fPaicheNo = val;
      });
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
