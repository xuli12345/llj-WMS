<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData | pagination(pageNum, pageSize)"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
      :row-key="getRowKeys"
      style="width: 100%;"
    >
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="120px"
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
      <div class="pan-btns">
        <!-- <el-button type="primary" class="iconfont icon-baocun" @click="submitForm()" size="mini">确定</el-button> -->
        <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
          >取消</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
export default {
  props: ["fTableView", "dialogData", "tableData"],
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [
        { fColumn: "fJobID", fColumnDes: "排车序号ID" },
        { fColumn: "fShopCode", fColumnDes: "门店代号" },
        { fColumn: "fShopName", fColumnDes: "门店" },
        { fColumn: "fQty", fColumnDes: "数量" },
        { fColumn: "fRealQty", fColumnDes: "实际数量" }
      ], //表头数据
      getRowKeys(row) {
        return row.fID;
      },
      //查询的数据
      searchData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //权限表修改的数据
      userDes: this.$store.state.user.userInfo.userDes,
      //获取表格数据的fTableView
      fTableViewll: "",
      asData: {},
      //传递过去的数据
      sendData: [],
      newArr: [],
      selectAllData: []
    };
  },
  methods: {
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    //表格筛选
    async filterTagTable(filters) {
      // console.log(filters);
      this.pageNum = 1;
      let column, value, arrLength;
      let obj = {};
      for (const key in filters) {
        column = key;
        value = filters[key][0];
        arrLength = filters[key].length;
        //判断是否有值 有值才添加
        if (value != undefined) {
          obj[key] = value;
          this.newArr.push(obj);
        }
        //判断是否点击了重置
        this.newArr.forEach((item, index) => {
          if (column in item && arrLength == 0) {
            this.newArr.splice(index, 1);
          }
        });
      }

      let searchData = [];
      let objData;
      this.newArr.forEach(ele => {
        for (const key in ele) {
          objData = {
            Computer: "=",
            DataFile: key,
            Value: ele[key]
          };
        }

        searchData.push(objData);
      });

      let res = await getTableBodyData(this.fTableViewll, searchData);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        console.log(this.tableData, "筛选表体内容");
      }
    },

    //筛选的条件数组
    screenFuction(val) {
      let copyTable = this.tableData;
      let screenData = [];
      copyTable.forEach((item, idx) => {
        let obj = {
          text: item[val],
          value: item[val]
        };
        screenData.push(JSON.stringify(obj));
      });
      let screenArr = Array.from(new Set(screenData));
      var newData = screenArr.map(function(item) {
        return JSON.parse(item);
      });
      return newData;
    },
    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData("v_OutboundOrderNoReceive");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData);
      } else {
        this.$message.error(res.Message);
      }
    },
    submitForm() {
      this.$emit("closeAlert", true);
    },
    resetForm() {
      this.$emit("closeAlert");
    },
    handleSelectionChange(val) {
      this.sendData = val;
    }
  },
  watch: {
    tableData: {
      handler() {
        this.total = this.tableData.length;
      },
      immediate: true
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
.page {
  margin: 0px 10px 10px 10px;
  width: 100%;
}
</style>
