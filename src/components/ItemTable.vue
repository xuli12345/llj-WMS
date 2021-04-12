<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData | pagination(pageNum, pageSize)"
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
      :row-key="getRowKeys"
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <template>
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <template v-if="!isAuthority">
          <template v-for="(item, index) in tableHeadData">
            <el-table-column
              v-if="item.fVisible == 1 ? true : false"
              :key="index"
              :label="item.fColumnDes"
              :prop="item.fColumn"
              sortable
              min-width="120px"
            ></el-table-column>
          </template>
        </template>
        <template v-if="isAuthority">
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
                <!-- <el-checkbox
                  @change="changeA(scope.row, item.fColumn)"
                  v-if="item.fDataType == 'bit'"
                  :value="scope.row[item.fColumn] == 0 ? false : true"
                  :disabled="item.fReadOnly == 0 ? false : true"
                ></el-checkbox> -->
                <input
                  type="checkbox"
                  @change="changeA(scope.row, item.fColumn)"
                  v-if="item.fDataType == 'bit'"
                  :checked="scope.row[item.fColumn] == 0 ? false : true"
                  :disabled="item.fReadOnly == 0 ? false : true"
                />
                <el-input
                  v-else
                  v-model="scope.row[item.fColumn]"
                  :maxlength="scope.row[item.fLength]"
                ></el-input>
              </template>
            </el-table-column>
          </template>
        </template>
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
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { compare } from "@/utils/common";
import {
  getTableBodyData,
  ItemTableHeadData,
  GroupLimitData
} from "@/api/index";
export default {
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isCompany",
    "isAuthority",
    "isAuthorityGroup",
    "value",
    "isHandleMenu",
    "isSave",
    "selBatchList"
  ],
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      //checkbox选中的数据
      BatchList: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      getRowKeys(row) {
        // console.log(row)
        return row.fCompanyID || row.fModName || row.fGroupID;
      },
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //权限表修改的数据
      editTableData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      OrignData: [],
      select: true
    };
  },
  methods: {
    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
      if (this.isAuthority) {
        this.editTableData.push(...val);
        this.editTableData = Array.from(new Set(this.editTableData));
        this.$emit("update:selBatchList", this.editTableData);
      }
      if (this.isCompany) {
        this.$emit("update:selBatchList", this.BatchList);
      }
      if (this.isAuthorityGroup) {
        this.$emit("update:selBatchList", this.BatchList);
      }
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },

    changeA(item, val) {
      if (this.isAuthority) {
        this.editTableData.push(item);
        this.editTableData = Array.from(new Set(this.editTableData));
        this.$emit("update:selBatchList", this.editTableData);
        // console.log(this.editTableData);
      }

      if (item[val] == 0) {
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        this.$set(item, val, 0);
      }
    },

    async getTableHead() {
      let res = await ItemTableHeadData([
        {
          fTableView: this.fTableView
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        this.fTableViewData = res.fTableViewData;

        if (this.isCompany) {
          //权限公司
          this.$emit("update:isSave", this.tableHeadData);
          this.getModData();
        } else {
          this.$emit("update:isSave", this.tableHeadData);
        }
        if (this.isAuthorityGroup) {
          //权限组
          this.$emit("update:isSave", this.tableHeadData);
          this.getAuthorityGroupData();
        }
        if (this.isAuthority) {
          //权限表
          this.$emit("update:isSave", this.tableHeadData);
          this.getGroupLimitData();
        }
      } else {
        this.$message.error(res.Message);
      }
    },
    //权限公司tableData
    async getModData() {
      let res = await getTableBodyData("v_Company_Mst");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let resultData = JSON.parse(res.Data);
        this.tableData = resultData.map((item, index) => {
          return {
            fGroupID: 0, //用户组ID
            fCompanyID: item.fID, //公司ID
            fCompanyCode: item.fCompanyCode,
            fCompanyName: item.fCompanyName,
            fLimitID: 0
          };
        });
        this.total = this.tableData.length;
      }
    },
    //获取权限组tabledata
    async getAuthorityGroupData() {
      let res = await getTableBodyData("v_UserGroup_Mst");

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.tableData = this.tableData.map(element => {
          return {
            fLimitID: 0,
            fGroupID: element.fID,
            fGroupName: element.fGroupName
          };
        });
        this.total = this.tableData.length;
      }
    },
    //权限表数据
    async getGroupLimitData() {
      let res = await GroupLimitData([
        ["0"],
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.OrignData = JSON.parse(res.Data);
        this.OrignData.forEach(element => {
          for (const key in element) {
            if (key == "fID") {
              this.$set(element, "fModID", element.fID);
            } else if (element[key] == null) {
              element[key] = 0;
            }
          }
        });
        this.tableData = this.OrignData;
        this.total = this.tableData.length;
        // console.log(this.tableData, "权限表数据");
      }
    }
  },
  watch: {
    isHandleMenu(newVal, oldVal) {
      if (newVal) {
        this.$emit("update:isHandleMenu", false);
        this.tableData = this.OrignData.filter(item => {
          return item.fPID == this.value;
        });
        this.total = this.tableData.length;
      }
    }
  },

  created() {
    this.getTableHead();
    this.getModData();
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
