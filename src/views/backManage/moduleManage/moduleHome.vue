<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        {{ item.fColumnDes }}:
        <el-input
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
        ></el-input>
      </div>
      <div style="margin-top:10px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="search"
          :disabled="userLimit('fQurey')"
          >查询</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-xinzeng"
          @click="addPopRight"
          :disabled="userLimit('fAdd')"
          >新增</el-button
        >
      </div>
    </div>
    <div class="menus">
      <div class="left">
        <el-tabs
          :tab-position="tabPosition"
          v-model="activeName"
          @tab-click="clickTabs"
        >
          <template v-for="(item, index) in this.menuList">
            <el-tab-pane
              :label="item.MenuName"
              :name="item.MenuName"
              :key="index"
            >
              <span slot="label">
                <i class="el-icon-folder"></i>
                {{ item.MenuName }}
              </span>
              <template v-if="item.Child && item.Child.length > 0">
                <div
                  style="cursor: pointer;"
                  v-for="(child, idx) in item.Child"
                  :key="idx"
                  @click="clickMenus(child)"
                >
                  <i class="el-icon-setting"></i>
                  <span
                    @click="changeColor(idx)"
                    slot="title"
                    :class="active == idx ? 'addClass' : ''"
                    >{{ child.MenuName }}</span
                  >
                </div>
              </template>
            </el-tab-pane>
          </template>
        </el-tabs>
      </div>
      <div class="right">
        <el-table
          :header-cell-style="{ background: '#eef1f6' }"
          v-fit-columns
          class="table-wrapper"
          ref="singleTable"
          :max-height="tableHeight"
          border
          style="width: 100%"
          :data="tableData | pagination(pageNum, pageSize)"
          @selection-change="handleSelectionChange"
          @row-dblclick="dblclick"
        >
          <el-table-column type="index" width="50"></el-table-column>

          <template v-for="(item, index) in tableHeadData">
            <el-table-column
              v-if="item.fVisible == 1"
              :key="index"
              :label="item.fColumnDes"
              :prop="item.fColumn"
              min-width="160px"
              sortable
              :column-key="item.fColumn"
            >
              <template slot-scope="scope">
                <el-checkbox
                  v-if="item.fDataType == 'bit'"
                  :value="scope.row[item.fColumn] == 1 ? true : false"
                  :disabled="item.fReadOnly == 0 ? false : true"
                ></el-checkbox>

                <div v-else>{{ scope.row[item.fColumn] }}</div>
              </template>
            </el-table-column>
          </template>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              <div class="operation">
                <el-button
                  type="text"
                  size="small"
                  @click.stop="handleDelete(scope.row, scope.$index)"
                  :disabled="userLimit('fDel')"
                  >删除</el-button
                >

                <el-button
                  type="text"
                  size="small"
                  @click="handleEdit(scope.row, scope.$index)"
                  :disabled="userLimit('fEdit')"
                  >修改</el-button
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
    </div>
  </div>
</template>

<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import {
  addformSaveData,
  ItemTableHeadData,
  getItemMenus,
  getTableBodyData
} from "@/api/index";

export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  props: ["fTableView", "tableName", "isSaveSuccess", "searchParams"],
  data() {
    return {
      activeName: "后台管理",
      tabPosition: "left",
      active: -1,
      menuList: [],
      //查询的数据
      searchData: [],
      tableHeadData: [], //表头数据
      //搜索条件
      searchWhere: [],

      fTableViewData: "",
      //批量
      BatchList: [],
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      asData: {},
      //copy
      copyData: [],
      // 点击左侧tab页时，当前table数据
      currentData: [],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },

  methods: {
    clickTabs(tab, event) {
      let filterData = this.copyData.filter(element => {
        return element.fType == 1;
      });
      let arr = [];
      filterData.forEach(item => {
        this.copyData.forEach(v => {
          if (v.fPID == item.fID && tab.name.includes(item.fModName)) {
            arr.push(v);
          }
        });
      });

      this.currentData = JSON.parse(JSON.stringify(arr));
      this.tableData = arr;
      this.total = this.tableData.length;
      this.pageNum = 1;
    },
    changeColor(index) {
      this.active = index;
    },
    clickMenus(val) {
      let filterData = this.currentData.filter(element => {
        return element.fType == 1 || element.fType == "模块分类";
      });
      let arr = [];
      filterData.forEach(item => {
        this.copyData.forEach(v => {
          if (v.fPID == item.fID && val.MenuName.includes(item.fModName)) {
            // this.$set(v, "fType", "模块程序");
            arr.push(v);
          }
        });
      });

      this.tableData = arr;
      this.total = this.tableData.length;
      this.pageNum = 1;
    },
    //获取菜单
    async getMenuList() {
      let res = await getItemMenus([
        ["1"],
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.menuList = res.Menuurl.Child;
      }
    },
    //用户表格列头
    async getTableHeadData() {
      let res = await ItemTableHeadData([
        {
          fTableView: this.fTableView
        },
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);

        //过滤搜索的字段
        let searchArr = [];
        searchArr = this.tableHeadData.filter(element => {
          return element.fQureyCol == 1;
        });
        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        // console.log(ColumnArr, "搜索的字段");
        let arr = [];
        ColumnArr.forEach((element, index) => {
          this.tableHeadData.forEach((item, index) => {
            if (item.fColumn.includes(element)) {
              let obj = {
                fColumnDes: item.fColumnDes,
                fColumn: item.fColumn,
                fComputer: item.fComputer
              };
              arr.push(obj);
            }
          });
        });
        //搜索的数据
        this.searchData = arr;
      } else {
        this.$message.error(res.Message);
      }
    },

    //查询
    search() {
      this.active = -1;
      this.getTableData();
    },
    //获取table表格内容数据
    async getTableData() {
      this.searchWhere = [];
      this.pageNum = 1;
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            if (
              element.fColumn === "fType" &&
              this.asData[element.fColumn] == "模块分类"
            ) {
              // this.$set(this.asData, element.fColumn, 1);
              this.asData[element.fColumn] = 1;
            } else if (
              element.fColumn === "fType" &&
              this.asData[element.fColumn] == "模块程序"
            ) {
              this.asData[element.fColumn] = 0;
            }
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: this.asData[element.fColumn]
            };
            this.searchWhere.push(obj);
          }
        });
      }
      let res = await getTableBodyData(this.fTableViewData, this.searchWhere);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        this.copyData = JSON.parse(JSON.stringify(this.tableData));
        //fType:1 为模块分类   fType:0 为模块程序 this.tableData:为模块分类数据
      }
    },
    //新增
    addPopRight() {
      this.$emit("openDrawer", this.tableHeadData);
    },
    //双击表格弹框
    dblclick(row) {
      // console.log(row);
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },
    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },
    //批量删除
    BatchDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        let result = batchDelete(this.tableHeadData, this.BatchList);
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            let res = await addformSaveData([
              {
                lstSaveData: [
                  {
                    TableName: this.tableName,
                    IdentityColumn: null,
                    InsertRow: null,
                    UpdateRow: null,
                    DeleteRow: result.arr,
                    Columns: result.columns
                  }
                ]
              },
              { userDes: this.userDes, userId: this.userId }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("删除成功!");
              this.getTableData();
            } else {
              this.$message.error(res.errstr);
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },

    //修改
    handleEdit(row, index) {
      this.$emit("openEditDrawer", row, this.tableHeadData);
    },
    //删除
    handleDelete(row, index) {
      let currentRow = JSON.parse(JSON.stringify(row));
      if (currentRow["fType"].includes("模块程序")) {
        this.$set(currentRow, "fType", 0);
      } else if (currentRow["fType"].includes("模块分类")) {
        this.$set(currentRow, "fType", 1);
      }

      let resultData = addParams(this.tableHeadData, currentRow);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let res = await addformSaveData([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: null,
                  InsertRow: null,
                  UpdateRow: null,
                  DeleteRow: [resultData.arr],
                  Columns: resultData.columns
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("删除成功!");
            this.getTableData();
            this.$emit("delSuccess", true);
          } else {
            this.$message.error(res.errstr);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },

    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      let a = userLimit(val);
      return a;
    }
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.getTableData();
      }
    },
    tableData(newVal, oldVal) {
      newVal.forEach(element => {
        if (element.fType == 1) {
          element.fType = "模块分类";
        } else if (element.fType == 0) {
          element.fType = "模块程序";
        }
      });
    }
  },
  created() {
    this.getTableHeadData();
    this.getMenuList();
  },
  mounted() {
    setTimeout(() => {
      this.getTableData();
    }, 200);
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
.item-munus {
  padding-left: 15px;
  height: 30px;
  cursor: pointer;
}

.addClass {
  color: #409eff;
}
.menus {
  display: flex;
  width: 100%;
  .left {
    width: 15%;
    margin: 0 15px 0 5px;
    border: 1px solid #ebeef5;
    padding-top: 10px;
    .el-tabs {
      width: 250px;
    }
  }
  .right {
    flex: 1;
  }
}
</style>
