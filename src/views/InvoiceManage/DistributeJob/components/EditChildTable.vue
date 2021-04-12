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
      @row-dblclick="dblclick"
    >
      <el-table-column type="index" width="50"></el-table-column>
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
            <el-select
              @change="
                selectDataType(scope.row, scope.row[item.fColumn], item.fColumn)
              "
              v-if="
                item.fColumn == 'fNumUnitName' ||
                  item.fColumn == 'fBoxNumUniName'
              "
              v-model="scope.row[item.fColumn]"
              placeholder="请选择"
              :disabled="isDisabled"
            >
              <el-option
                v-for="optionItem in selectOptions"
                :key="optionItem.value"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </el-select>

            <div v-else>
              {{ scope.row[item.fColumn] }}
            </div>
          </template>
        </el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              :disabled="isDisabled"
              type="text"
              size="small"
              @click.stop="handleDelete(scope.row, scope.$index)"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
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
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
export default {
  props: ["fTableView", "insertData", "fID", "changeData", "isDisabled"],
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      //获取表格内容TableView的值,在获取headData中获取
      getRowKeys(row) {
        return row.fSort || row.fID;
      },
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      userDes: this.$store.state.user.userInfo.userDes,
      //获取表格数据的fTableView
      fTableViewll: "",
      backData: [],
      selectOptions: [],
      selData: []
    };
  },
  methods: {
    //双击表格弹框
    dblclick(row) {
      this.$emit("openEditDrawer", row);
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "字表表头");
        this.getTableData();
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表格内容数据
    async getTableData() {
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: this.fTableView[1],
          Value: this.fID
        }
      ];
      // console.log(searchWhereObj, "searchWhereObj");
      let res = await getTableBodyData(this.fTableViewll, searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.tableData = this.tableData.sort(compare);
        this.tableData.forEach((element, index) => {
          this.$set(element, "fSort", index + 1);
          for (const key in element) {
            if (
              (key.indexOf("Date") != -1 ||
                key.indexOf("time") != -1 ||
                key.indexOf("LifeDays") != -1) &&
              element[key] != null
            ) {
              element[key] = element[key].replace(/T/, " ");
            }
          }
        });

        this.backData = JSON.parse(JSON.stringify(this.tableData));
        console.log(this.backData, "回显的数据");
        this.total = this.tableData.length;
      } else {
        this.$message.error(res.Message);
      }
    },
    //下拉选择框
    selectDataType(row, val, key) {
      this.changeData.forEach(item => {
        if (item.key == key) {
          row[item.fKey] = val;
        }
      });
    },

    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    }
  },
  watch: {
    insertData(n, o) {
      if (Array.isArray(this.insertData)) {
        let iData = JSON.parse(JSON.stringify(this.insertData));

        iData.forEach((item, index) => {
          this.$set(item, "fSort", this.tableData.length + index + 1);
          this.$set(item, this.fTableView[1], this.fID);
        });
        this.tableData = this.tableData.concat(iData);
      } else {
        this.insertData[this.fTableView[1]] = this.fID;
        this.tableData = this.tableData.concat(
          JSON.parse(JSON.stringify(this.insertData))
        );
      }
      this.total = this.tableData.length;
      // console.log(this.tableData,"eieo")
    }
  },

  created() {
    this.getTableHeadData();
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
