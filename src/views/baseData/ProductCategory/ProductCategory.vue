<template>
  <div>
    <div class="page">
      <div style="display:flex">
        <span>货品类型:</span>
        <el-select
          style="width:200px"
          @change="selectGetData"
          v-model="typeValue"
          placeholder="请选择"
        >
          <el-option
            v-for="item in options"
            :key="item.fID"
            :label="item.fType"
            :value="item.fID"
          >
          </el-option>
        </el-select>
      </div>
      <div class="flex">
        <div
          v-for="(item, index) in searchData"
          :key="index"
          class="search-title flex-align-center"
        >
          <p>{{ item.fColumnDes }}:</p>

          <el-checkbox
            v-if="item.fDataType == 'bit'"
            v-model="asData[item.fColumn]"
          ></el-checkbox>
          <el-date-picker
            v-if="item.fDataType == 'datetime'"
            v-model.trim="asData[item.fColumn]"
            type="date"
            placeholder="选择日期时间"
            min-width="300"
          ></el-date-picker>
          <template v-else-if="item.fColumn == 'fState1'">
            <el-select
              clearable
              style="width:200px"
              v-model="asData[item.fColumn]"
              placeholder="请选择"
            >
              <el-option
                v-for="item in Stateoptions"
                :key="item.fState"
                :label="item.fStateName"
                :value="item.fStateName"
              >
              </el-option>
            </el-select>
          </template>

          <el-input
            v-else
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
            class="iconfont icon-baocun"
            @click="save"
            >排序保存</el-button
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
    </div>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%"
      :row-key="getRowKeys"
      :data="tableData"
      @selection-change="handleSelectionChange"
     
    >
     
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="160px"
          :column-key="item.fColumn"
        >
          <template slot-scope="scope">
            <div v-if="item.fDataType == 'bit'">
              {{ scope.row[item.fColumn] == 1 ? "已上架" : "未上架" }}
            </div>
            <input
              v-else-if="item.fColumn == 'fSort'"
              v-model="scope.row[item.fColumn]"
              type="text"
            />
            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="180">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click="handlePutaway(scope.row, scope.$index)"
              :disabled="scope.row.fState == 1"
              >上架</el-button
            >

            <el-button
              type="text"
              size="small"
              :disabled="scope.row.fState == 0"
              @click="handleSoldOut(scope.row, scope.$index)"
              >下架</el-button
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
import { userLimit, compare } from "@/utils/common";
import {
  getTableHeadData,
  getTableBodyData,
  collectionData
} from "@/api/index";

export default {
  data() {
    return {
      tableHeight: document.body.clientHeight,
      typeValue: "",
      options: [],
      Stateoptions: [
        {
          fState: 0,
          fStateName: "未上架"
        },
        {
          fState: 1,
          fStateName: "已上架"
        }
      ],
      getRowKeys(row) {
        return row.fID;
      },
      //查询的数据
      searchData: [
        {
          fColumnDes: "货品编码",
          fColumn: "fProductCode",
          fComputer: "_like_",
          fDataType: "string"
        },
        {
          fColumnDes: "货品名称",
          fColumn: "fProductName",
          fComputer: "_like_",
          fDataType: "string"
        },
        {
          fColumnDes: "状态",
          fColumn: "fState1",
          fComputer: "=",
          fDataType: "string"
        }
      ],
      //表头数据
      tableHeadData: [],
      //货品主档头部信息
      productHeadData: [],
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      newArr: [],
      //批量
      BatchList: [],
      asData: {},
      searchWhere: [],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    search() {
      if (this.typeValue) {
        this.getTableData();
      } else {
        this.$message.warning("请先选择货品分类!");
      }
    },
    async save() {
      this.tableData.forEach(item => {
        if (item.fState1 == true) {
          this.$set(item, "fState1", 1);
        } else {
          this.$set(item, "fState1", 0);
        }
      });
      let tableHeadData = [
        {
          fColumn: "fID",
          fColumnDes: "ID",
          fComputer: "",
          fDataType: "int"
        },
        {
          fColumn: "fSort",
          fColumnDes: "排序",
          fComputer: "",
          fDataType: "string"
        }
      ];

      let res = await collectionData([
        {
          TableName: "t_Product",
          headData: tableHeadData,
          updateData: this.tableData
        }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.$message.success("保存成功!");
        this.getTableData();
      } else {
        this.$message.error(res.Message);
      }
    },
    BatchDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            this.BatchList.forEach(item => {
              this.$set(item, "fProductType", "");
            });
            let res = await collectionData([
              {
                TableName: "t_Product",
                headData: this.productHeadData,
                updateData: this.BatchList
              }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("删除成功!");
              this.getTableData();
            } else {
              this.$message.error(res.Message);
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
    //用户表格列头
    async getTableHeadData(tableView) {
      let res = await getTableHeadData(tableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let headResult = res.lstRet.sort(compare);
        return headResult;
      }
    },
    async getTableData() {
      this.searchWhere = [];
      let baseWhere = [
        {
          Computer: "=",
          DataFile: "fProductType",
          Value: this.typeValue
        }
      ];

      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = baseWhere;
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];
            // console.log(result);
            if (result instanceof Date) {
              result = timeCycle(result);
            }

            if (result == "已上架") {
              result = 1;
            } else if (result == "未上架") {
              result = 0;
            } else {
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
        this.searchWhere.push(...baseWhere);
      }
      let res = await this.getType(
        "v_Product",
        this.searchWhere,
        this.pageNum,
        this.pageSize
      );
      this.tableData = res.result;
      this.total = res.total;

      this.tableData.forEach(item => {
        this.$set(item, "fKindType", item.fProductType);
        this.$set(item, "fState", item.fState1);
      });
    },
    async selectGetData() {
      let baseWhere = [
        { Computer: "=", DataFile: "fProductType", Value: this.typeValue }
      ];
      let res = await this.getType(
        "v_Product",
        baseWhere,
        this.pageNum,
        this.pageSize
      );
      this.tableData = res.result;
      this.total = res.total;
      this.tableData.forEach(item => {
        this.$set(item, "fKindType", item.fProductType);
        this.$set(item, "fState", item.fState1);
      });
    },
    //上架
    handlePutaway(row, index) {
      this.$confirm("确定将此商品上架吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          row.fState1 = 1;
          let res = await collectionData([
            {
              TableName: "t_Product",
              headData: this.productHeadData,
              updateData: [row]
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("上架成功!");
            this.getTableData();
          } else {
            this.$message.error(res.Message);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消上架"
          });
        });
    },
    //下架
    handleSoldOut(row, index) {
      console.log(row);
      this.$confirm("确定将此商品下架吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          row.fState1 = 0;
          let res = await collectionData([
            {
              TableName: "t_Product",
              headData: this.productHeadData,
              updateData: [row]
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("下架成功!");
            this.getTableData();
          } else {
            this.$message.error(res.Message);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消下架"
          });
        });
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
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
 

    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    async getType(tableView, searchWhere) {
      let res = await getTableBodyData(
        tableView,
        searchWhere,
        this.pageNum,
        this.pageSize
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        return {
          result: result,
          total: res.TTLPage
        };
      }
    },
    async typeData(tableView, searchWhere) {
      let res = await getTableBodyData(tableView, searchWhere, 0, 0);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let result = JSON.parse(res.Data);
        return {
          result: result,
          total: res.TTLPage
        };
      }
    }
  },
  async created() {
    this.tableHeadData = await this.getTableHeadData("t_Product_Kind");
    this.productHeadData = await this.getTableHeadData("t_Product");
    let resultData = await this.typeData("v_Product_KindType");
    this.options = resultData.result;
  },
  computed: {
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      }
    }
  },
  watch: {
    mainTabs(e, o) {
      let name = this.$options._parentVnode.data.key.substring(1);
      let n = e.filter(ele => {
        return ele.name == name;
      });
      if (n.length == 0) {
        var key =
          this.$vnode.key == null
            ? this.$vnode.componentOptions.Ctor.cid +
              (this.$vnode.componentOptions.tag
                ? `::${this.$vnode.componentOptions.tag}`
                : "")
            : this.$vnode.key;
        var cache = this.$vnode.parent.componentInstance.cache;
        var keys = this.$vnode.parent.componentInstance.keys;
        if (cache[key]) {
          if (keys.length) {
            var index = keys.indexOf(key);
            if (index > -1) {
              keys.splice(index, 1);
            }
          }
          delete cache[key];
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
