<template>
  <div>
    <div style="margin-top:5px">
      <el-button type="primary" size="mini" @click="productDesc"
        >按商品排序</el-button
      >
      <el-button
        type="primary"
        size="mini"
        @click="shopDesc"
        :disabled="isShopClick"
        >按门店排序</el-button
      >
      <el-button
        type="primary"
        size="mini"
        @click="seckill"
        :disabled="isSeckillClick"
        >按秒杀排序</el-button
      >
      <div class="flex-justify-end">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[10, 50, 100, 400]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          prev-text="上一页"
          next-text="下一页"
        ></el-pagination>
      </div>
    </div>

    <!--  :data="tableData.slice((pageNum-1)*pageSize,pageNum*pageSize)" -->
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData | pagination(pageNum, pageSize)"
      v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      :row-style="rowClass"
      :row-key="getRowKeys"
      @row-dblclick="dblclick"
      border
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column type="selection" width="60"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          :width="item.width"
        >
       
          <template slot-scope="scope">
            <div v-if="item.fColumn == 'fItemIsEnd'">
              {{ scope.row[item.fColumn] == 1 ? "是" : "否" }}
            </div>

            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="220">
        <template slot-scope="scope">
          <div class="operation">
            <!--     :disabled="rowData.fMstIsEnd==1" -->
            <el-button
              type="warning"
              size="mini"
              @click.stop="handleEdit(scope.row, scope.$index)"
              >修改</el-button
            >
            <el-button
              :disabled="scope.row.fItemIsEnd == 1"
              type="warning"
              size="mini"
              @click.stop="handleSorting(scope.row, scope.$index)"
              >分拣</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!--修改 v-if="isDestory" -->
    <el-drawer
      :modal="false"
      :visible.sync="drawerValue"
      :direction="'rtl'"
      :before-close="handleEditClose"
    >
      <edit-form-table
        @closeBox="closeBox"
        :fTableViewHead="fTableView[0]"
        :addItem="true"
        :isShowTable="isShow"
        :rowData="editForm"
        :rqOptions="rqOptions"
      ></edit-form-table>
    </el-drawer>
    <!-- 分拣界面 -->
    <el-dialog
      title="货品分拣"
      :visible.sync="dialogVisible"
      :modal="false"
      width="100%"
      :showClose="false"
      :before-close="handleClose"
      v-if="isDestory"
    >
      <Sorting
        :rowData="editForm"
        :fTableView="fTableView[0]"
        @closeBox="closeBox"
        :tableHeadData="ItemHeadData"
        :singleHeadData="singleHeadData"
        :rqOptions="rqOptions"
      ></Sorting>
    </el-dialog>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
import editFormTable from "./EditChildFormHead";
import Sorting from "./Sorting";
export default {
  props: ["fTableView", "rowData", "fID"],
  components: {
    editFormTable,
    Sorting
  },
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      ItemHeadData: [], //称重从表界面
      singleHeadData: [],
      rqOptions: [],
      //获取表格内容TableView的值,在获取headData中获取
      getRowKeys(row) {
        // console.log(row);
        return row.fID;
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
      selData: [],
      drawerValue: false,
      editForm: {},
      dialogVisible: false,
      isDestory: false,
      proptype: "fProductName",
      isShopClick: false,
      isSeckillClick: false,
      shopHeadData: [],
      seckillHeadData: [],
      clickType: "",
      isShow: false
    };
  },
  methods: {
    //排序触发事件
    sortChange(column) {
      this.proptype = column.prop; // 将键名prop赋值给变量proptype
      // console.log(this.proptype);
      // console.log(column.order);
      this.pageNum = 1;
      if (column.order === "ascending") {
        this.getTableData();
        this.tableData.sort(this.ascSortFun);
      } else if (column.order === "descending") {
        this.getTableData();
        this.tableData.sort(this.desSortFun);
      } else {
        //取消排序则重新获取列表，恢复默认状态。
        this.getTableData();
      }
    },
    //升序排列方法
    ascSortFun(a, b) {
      return a[this.proptype] - b[this.proptype];
    },
    //降序排列方法
    desSortFun(a, b) {
      return b[this.proptype] - a[this.proptype];
    },

    //修改
    handleEdit(row, index) {
      this.drawerValue = true;
      this.isShow = true;
      this.editForm = row;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    closeEditBox(val) {
      // console.log(val)
      if (val) {
        this.tableData.forEach((item, index) => {
          if (val.fID == item.fID) {
            this.tableData.splice(index, 1, val);
          }
        });
      }
      this.drawerValue = false;
    },
    dblclick(row) {
      // console.log(row);
      this.editForm = row;
      this.dialogVisible = true;
    },
    //分拣
    handleSorting(row, index) {
      this.editForm = row;
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
      this.getTableData();
    },
    async closeBox(val) {
      if (val) {
        if (this.clickType == "defalut" || this.clickType == "") {
          this.getTableData();
        } else if (this.clickType == "shop") {
          let searchWhereObj = [
            {
              Computer: "=",
              DataFile: this.fTableView[1],
              Value: this.fID
            }
          ];
          let res = await getTableBodyData(
            this.fTableViewll,
            searchWhereObj,
            0,
            0,
            "order by fShopName desc"
          );
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.tableData = JSON.parse(res.Data);
            console.log(this.tableData);
          }

          this.isShopClick = true;
          this.isSeckillClick = true;
          this.$nextTick(() => {
            this.$refs.singleTable.doLayout();
          });
        } else if (this.clickType == "seckill") {
          this.seckill();
        }
      }
      this.drawerValue = false;
      this.dialogVisible = false;
    },
    rowClass(row, index) {
      // console.log(row.row);
      if (row.row.fItemIsEnd) {
        return { "background-color": "#87ceeb" };
      } else {
        return { "background-color": "#fff" };
      }
    },
    //按商品排序
    productDesc() {
      this.clickType = "defalut";
      this.getTableHeadData();
      this.isShopClick = false;
      this.isSeckillClick = false;
    },
    //按门店排序
    async shopDesc() {
      this.clickType = "shop";
      let productData = this.shopHeadData.splice(3, 1);
      this.shopHeadData.splice(5, 0, productData[0]);
      this.tableHeadData = this.shopHeadData;
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: this.fTableView[1],
          Value: this.fID
        }
      ];
      let res = await getTableBodyData(
        this.fTableViewll,
        searchWhereObj,
        0,
        0,
        "order by fShopName desc"
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        console.log(this.tableData);
      }

      this.isShopClick = true;
      this.isSeckillClick = true;
      this.$nextTick(() => {
        this.$refs.singleTable.doLayout();
      });
    },
    //秒杀排序
    async seckill() {
      this.clickType = "seckill";
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: this.fTableView[1],
          Value: this.fID
        }
      ];
      let res = await getTableBodyData(
        this.fTableViewll,
        searchWhereObj,
        0,
        0,
        "order by replace(fProductName,'秒杀',''), fShopName,fProductName"
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
      }

      this.isShopClick = true;
      this.isSeckillClick = true;
      this.$nextTick(() => {
        this.$refs.singleTable.doLayout();
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

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData);
        this.tableHeadData.forEach(item => {
          if (item.fColumn == "fProductName" || item.fColumn == "fShopName") {
            this.$set(item, "width", 150);
          } else {
            this.$set(item, "width", 120);
          }
          if (item.fColumn == "fChengzhongNo" || item.fColumn == "fChayiQty") {
            this.$set(item, "fVisible", 0);
          }
        });
        this.shopHeadData = JSON.parse(JSON.stringify(this.tableHeadData));
        this.seckillHeadData = JSON.parse(JSON.stringify(this.tableHeadData));
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
      let res = await getTableBodyData(this.fTableViewll, searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);

        this.tableData.forEach((element, index) => {
          this.$set(element, "fSort", index + 1);
          if (element.fQty1 == null) {
            this.$set(element, "fQty1", 0);
          }
        });
        this.$nextTick(() => {
          this.$refs.singleTable.doLayout();
        });
        this.backData = JSON.parse(JSON.stringify(this.tableData));
        console.log(this.tableData, "回显的数据");
        this.total = this.tableData.length;
        if (this.proptype == "fProductName") {
          //处理数组对象 排序相同的属性
          this.tableData.sort((a, b) => {
            if (a["fProductName"] != b["fProductName"]) {
              return a["fProductName"].localeCompare(b["fProductName"]);
            }
          });
        } else if (this.proptype == "fShopName") {
          this.tableData.sort((a, b) => {
            if (a["fShopName"] != b["fShopName"]) {
              return a["fShopName"].localeCompare(b["fShopName"]);
            }
          });
        }
      } else {
        this.$message.error(res.Message);
      }
    },

    //获取表格表头数据
    async getSortHeadData(fTableView) {
      let res = await getTableHeadData(fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = res.lstRet.sort(compare);
        console.log(result, "表头");
        if (fTableView === "t_ChengzhongRenWu_Item") {
          result.forEach(item => {
            if (
              item.fColumn == "fUnitName" ||
              item.fColumn == "fQty" ||
              item.fColumn == "fQty1" ||
              item.fColumn == "fPizhong" ||
              item.fColumn == "fQty2" ||
              item.fColumn == "fNum" ||
              item.fColumn == "fQpcstr" ||
              item.fColumn == "fType"
            ) {
              this.$set(item, "fVisible", 1);
            } else {
              this.$set(item, "fVisible", 0);
            }
          });
        }

        return result;
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取称重容器下拉框数据
    async getRqSelData() {
      let baseWhere = [
        {
          Computer: "=",
          DataFile: "fProductType",
          Value: 9
        }
      ];
      let res = await getTableBodyData(
        "v_Product",
        baseWhere,
        0,
        0,
        "order by fCreateDate desc"
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.rqOptions = JSON.parse(res.Data);
      }
    }
  },
  watch: {
    dialogVisible: function(val, old) {
      // console.log(val)
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 200);
      }
    }
  },

  async created() {
    this.getTableHeadData();
    //称重界面数据
    this.ItemHeadData = await this.getSortHeadData(this.fTableView[0]);
    console.log(this.ItemHeadData, "从表数据");
    this.ItemHeadData.forEach(item => {
      if (
        item.fColumn == "fPizhong" ||
        item.fColumn == "fQty2" ||
        item.fColumn == "fType"
      ) {
        this.$set(item, "fReadOnly", 1);
      }
    });
    this.singleHeadData = await this.getSortHeadData("t_ChengzhongRenWu_Item1");
    this.getRqSelData(); //容器的数据
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
/deep/ .el-dialog {
  height: 100vh;
  margin-top: 0px !important;
}
/deep/ .el-checkbox__inner {
  width: 20px;
  height: 20px;
}

/deep/ .el-pagination button {
  background: #409eff;
  color: #fff;
}
// 配置elementui 固定列行向线对不齐
/deep/ .el-table {
  .el-table__fixed,
  .el-table__fixed-right {
    height: 100% !important;
  }
  &.el-table--fluid-height {
    &.el-table--scrollable-y {
      .el-table__fixed-body-wrapper {
        bottom: 1px;
        max-height: none !important;
      }
      &.el-table--scrollable-x {
        .el-table__fixed-body-wrapper {
          bottom: 18.5px; // 这里的高度如果写的比较小 ie会不兼容
          max-height: none !important;
        }
      }
    }
  }
}
</style>
