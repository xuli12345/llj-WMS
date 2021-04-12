<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData"
      v-fit-columns
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
        <!-- 权限表 -->
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
                <input
                  type="checkbox"
                  @change="changeA(scope.row, item.fColumn)"
                  v-if="item.fDataType == 'bit'"
                  :checked="scope.row[item.fColumn] == 0 ? false : true"
                  :disabled="item.fReadOnly == 0 ? false : true"
                />
                <div v-else>{{ scope.row[item.fColumn] }}</div>
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
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, compare } from "@/utils/common";
import {
  getTableBodyData,
  ItemTableHeadData,
  GroupLimitData,
  GetUserLimitData
} from "@/api/index";
export default {
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isCompany",
    "isAuthority",
    "value",
    "isHandleMenu",
    "isSave",
    "selBatchList",
    "searchWhere",
    "fID",
    "backData",
    "UserLimit",
    "isHandleTabs"
  ],
  data() {
    return {
      tableHeadData: [], //表头数据
      BatchList: [],
      fTableViewData: "",
      getRowKeys(row) {
        // console.log(row)
        return row.fCompanyID || row.fModName;
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
      //回显的数据
      resultData: [],
      //回显的fGroupID
      fGroupID: "",
      //原始权限表数据
      OrignData: [],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  methods: {
    // 手动选中Checkbox
    handleSelectionChange(val) {
      // console.log(val, "ieieie");
      this.BatchList = val;
      this.BatchList.forEach(element => {
        this.$set(element, "fGroupID", this.fGroupID);
      });
      if (this.isAuthority) {
        this.editTableData.push(...val);
        this.editTableData = Array.from(new Set(this.editTableData));
        this.$emit("update:selBatchList", this.editTableData);
      }
      if (this.isCompany) {
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

        if (this.isAuthority) {
          //权限表
          let newArr = [];
          newArr = this.tableHeadData.filter(element => {
            return element.fKey == 1;
          });
          let arr = [];
          newArr.forEach(item => {
            let obj = {
              ColumnName: item.fColumn,
              ColumnType: item.fDataType
            };
            arr.push(obj);
          });
          this.$emit("update:isSave", this.tableHeadData);
        }
        //权限公司
        if (this.isCompany) {
          this.$emit("update:isSave", this.tableHeadData);
          this.getModData();
          setTimeout(() => {
            this.getSearchItemData();
          }, 100);
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
            fCompanyName: item.fCompanyName
          };
        });
        this.total = this.tableData.length;
      }
    },
    //根据点击菜单的menuId获取数据
    async getGroupLimitData() {
      let res = await GroupLimitData([
        [this.fID],
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.OrignData = JSON.parse(res.Data);
        this.$emit("update:backData", this.OrignData);
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
      }
    },
    async getGroupLimitData2() {
      let res = await GetUserLimitData([this.fID, this.userId]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.OrignData = JSON.parse(res.Data);
        this.$emit("update:backData", this.OrignData);
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
        let newArr = [];
        let data = [];
        this.tableHeadData.forEach(item => {
          if (item.fDataType == "bit") {
            newArr.push(item.fColumn);
          }
        });
        newArr.forEach(item => {
          this.tableData.forEach(ele => {
            for (const key in ele) {
              if (item == key && ele[key] == 1) {
                data.push(ele);
              }
            }
          });
        });
        var obj = {};
        data = data.reduce(function(item, next) {
          obj[next.fID] ? "" : (obj[next.fID] = true && item.push(next));
          return item;
        }, []);
        console.log(data);
      }
    },

    //查询数据
    async getSearchItemData() {
      // v_UserGroupLimit_Company   v_GroupLimit_Mod
      let res = await getTableBodyData(this.fTableViewData, this.searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.resultData = JSON.parse(res.Data);
        this.$emit("update:backData", this.resultData);
        console.log(this.resultData, "回显的数据");
        if (this.tableData.length > 0) {
          this.tableData.forEach(element => {
            this.resultData.forEach(item => {
              if (element.fCompanyID === item.fCompanyID) {
                this.fGroupID = item.fGroupID;
                this.$refs.singleTable.toggleRowSelection(element);
              }
            });
          });
        }
      }
    },
    //相同的元素
    getArrDifference(arr1, arr2) {
      return arr1.concat(arr2).filter(function(v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
      });
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
    },
    isHandleTabs(newVal, oldVal) {
      if (newVal) {
        this.$emit("update:isHandleTabs", false);
      }
    },
    BatchList(newVal, oldVal) {
      // console.log(newVal, oldVal);
      let newArr = [];
      this.tableHeadData.forEach(item => {
        if (item.fDataType == "bit") {
          newArr.push(item.fColumn);
        }
      });

      newArr.forEach(item => {
        newVal.forEach(ele => {
          for (const key in ele) {
            if (item == key) {
              ele[key] = 1;
            }
          }
        });
      });
      if (oldVal.length > 0 && newVal.length == 0) {
        newArr.forEach(item => {
          oldVal.forEach(ele => {
            for (const key in ele) {
              if (item == key) {
                ele[key] = 0;
              }
            }
          });
        });
      } else if (oldVal.length > 0 && newVal.length > 0) {
        let result = this.getArrDifference(newVal, oldVal);
        newArr.forEach(item => {
          result.forEach(ele => {
            for (const key in ele) {
              if (item == key) {
                ele[key] = 0;
              }
            }
          });
        });
        newArr.forEach(item => {
          newVal.forEach(ele => {
            for (const key in ele) {
              if (item == key) {
                ele[key] = 1;
              }
            }
          });
        });
      }
    }
  },
  created() {
    this.getTableHead();
  },
  mounted() {
    setTimeout(() => {
      if (this.UserLimit) {
        this.getGroupLimitData2();
      } else {
        this.getGroupLimitData();
      }
    }, 1000);
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
