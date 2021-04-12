<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        {{ item.fColumnDes }}:

        <el-checkbox
          v-if="item.fDataType == 'bit'"
          v-model.trim="asData[item.fColumn]"
        ></el-checkbox>
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model.trim="asData[item.fColumn]"
          type="date"
          placeholder="选择日期时间"
          min-width="300"
        ></el-date-picker>

        <el-input
          v-else
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
        ></el-input>
      </div>
      <div style="margin-top:10px">
        <el-button
          size="mini"
          class="iconfont icon-A"
          type="primary"
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
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        >
      </div>
    </div>
    <!-- 表格数据   -->
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      ref="singleTable"
      :data="tableData"
      v-fit-columns
      border
      style="width: 100%;"
      :max-height="tableHeight"
      :row-key="getRowKeys"
      @selection-change="handleSelectionChange"
      @row-dblclick="dblclick"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template v-for="(item, index) in tableHead">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
          :column-key="item.fColumn"
        ></el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="180">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row, scope.$index)"
              :disabled="userLimit('fEdit')"
              >修改</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="handleDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel')"
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
    <!-- 新增侧滑框 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <addInferface
        @closeBox="closeBox"
        :tableHead="tableHead"
        v-if="newisDestory"
      ></addInferface>
    </el-drawer>
    <!-- 修改侧滑框 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <editInferface
        ref="edit"
        v-if="isDestory"
        @closeBox="closeEditBox"
        :tableHead="tableHead"
        :rowData="editForm"
      ></editInferface>
    </el-drawer>
  </div>
</template>
<script>
import addInferface from "@/views/backManage/interFaceManage/components/addInterface";
import editInferface from "@/views/backManage/interFaceManage/components/editInterface";
import { compare } from "@/utils/common";
import {
  ItemTableHeadData,
  tableBodyData,
  getTableBodyData,
  BathcDeleteData
} from "@/api/index";
import { timeCycle } from "@/utils/updateTime";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { userLimit } from "@/utils/common.js";
import Sortable from "sortablejs";
export default {
  name: "interFaceManage",
  components: {
    addInferface,
    editInferface
  },
  data() {
    return {
      tableHeight: document.body.clientHeight,
      bbb: [],
      //新增侧滑显示隐藏
      drawer: false,
      //新增销毁创建
      newisDestory: false,
      //修改侧滑显示隐藏
      drawerValue: false,
      //修改销毁创建
      isDestory: false,
      //控制侧滑框的方向
      direction: "rtl",
      //修改数据信息
      editForm: [],
      //货主信息列表
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //表头数据
      tableHead: [],
      fTableViewData: "",
      getRowKeys(row) {
        return row.fTableView;
      },
      //批量删除
      BatchList: [],
      itemfDataTableView: "",
      batchDelTableName: [
        {
          Key: "t_Interface_Item",
          Value: [{ Key: "fTableView", Value: "fColumn" }]
        }
      ],
      //用户当前菜单下的权限
      pageUserLimit: {},
      //查询的数据
      searchData: [],
      asData: {},

      //表格拖拽字段
      sortable: null,
      oldList: [],
      newList: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
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
    }
  },
  methods: {
    setSort() {
      console.log(Sortable);
      const el = document.querySelectorAll(
        ".el-table__body-wrapper > table > tbody"
      )[0];
      console.log(el);
      this.sortable = Sortable.create(el, {
        // ghostClass: "sortable-ghost", // Class name for the drop placeholder,
        // setData: function(dataTransfer) {
        //   dataTransfer.setData("Text", "");
        // },
        onEnd: evt => {
          console.log(evt);
          const targetRow = this.tableData.splice(evt.oldIndex, 1)[0];
          console.log(targetRow);
          this.tableData.splice(evt.newIndex, 0, targetRow);

          // for show the changes, you can delete in you code
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0];
          this.newList.splice(evt.newIndex, 0, tempIndex);
        }
      });
    },
    //查询
    search() {
      this.pageNum = 1;
      this.getTableData();
    },

    //获取table表格内容数据
    async getTableData() {
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];
            if (result instanceof Date) {
              result = timeCycle(result);
            }
            if (result.constructor == Boolean && result == true) {
              result = 1;
            }
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: result
            };
            this.searchWhere.push(obj);
          }
        });
      }

      let res = await getTableBodyData(
        this.fTableViewData,
        this.searchWhere,
        this.pageNum,
        this.pageSize
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.oldList = this.tableData.map(v => v.fID);
        this.newList = this.oldList.slice();
        this.$nextTick(() => {
          // this.setSort();
        });
      } else {
        this.$message.error(res.Message);
      }
      this.total = res.TTLPage;
    },
    //修改
    handleEdit(row, index) {
      //把当前行数据传递过去
      this.itemfDataTableView = row.fDataTableView;
      this.editForm = row;
      this.drawerValue = true;
    },

    async changeBatchDel(objectArr, row) {
      let res = await BathcDeleteData([
        {
          MstItemKey: this.batchDelTableName,
          MstKeyValue: objectArr,
          MstTableView: "t_Interface_Mst"
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
    },

    //删除
    handleDelete(row, index) {
      let RowData = JSON.parse(JSON.stringify(row));
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let objectArr = [];
          let obj = [
            {
              Key: "fTableView",
              Value: RowData.fTableView
            }
          ];
          objectArr.push(obj);
          this.changeBatchDel(objectArr, RowData);
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
      this.getTableData();
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getTableData();
    },
    //新增按钮
    addPopRight() {
      this.drawer = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },

    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        value.fCreateDate = timeCycle(value.fCreateDate);
        value.fModifyDate = timeCycle(value.fModifyDate);
        this.tableData.unshift(value);
      }
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    //关闭修改弹窗
    closeEditBox(val) {
      if (val) {
        val.fCreateDate = timeCycle(val.fCreateDate);
        val.fModifyDate = timeCycle(val.fModifyDate);
        this.getTableData();
      }
      this.drawerValue = false;
    },
    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.bbb = [];
      this.BatchList = val;
      val.forEach((val, index) => {
        let obj = {};
        obj.fTableView = val.fTableView;
        obj.fDataTableView = val.fDataTableView;
        this.bbb.push(obj);
      });
    },
    //批量删除
    BatchDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            let objectArr = [];
            this.BatchList.forEach(item => {
              let obj = [
                {
                  Key: "fTableView",
                  Value: item.fTableView
                }
              ];
              objectArr.push(obj);
            });
            this.changeBatchDel(objectArr);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },
    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.editForm = row;
        this.drawerValue = true;
      }
    },
    //获取头部信息
    async getHeadData() {
      let res = await ItemTableHeadData([
        {
          fTableView: '["t_Interface_Mst"]'
        },
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHead = res.lstRet.sort(compare);
        let searchArr = [];
        searchArr = this.tableHead.filter(element => {
          return element.fQureyCol == 1;
        });

        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        // console.log(ColumnArr, "搜索的字段");
        let arr = [];
        ColumnArr.forEach((element, index) => {
          this.tableHead.forEach((item, index) => {
            if (item.fColumn.includes(element)) {
              let obj = {
                fColumnDes: item.fColumnDes,
                fColumn: item.fColumn,
                fComputer: item.fComputer,
                fDataType: item.fDataType
              };
              arr.push(obj);
            }
          });
        });
        this.searchData = arr;
      } else {
        this.$message.error(res.Message);
      }
    },
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      let a = userLimit(val);
      return a;
    }
  },
  created() {
    this.getHeadData();
  }
};
</script>
<style lang="scss" scoped>
.dialog-form {
  width: 100%;
  .el-form-item {
    width: 90%;
  }
}
</style>
