<template>
  <div>
    <div style="margin-bottom:10px">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-A"
        @click="search"
        >查询</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >确定</el-button
      >
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
        >取消</el-button
      >
      <el-button
        type="primary"
        size="mini"
        class="el-icon-setting"
        @click="reset"
        >重置</el-button
      >
    </div>
    <div
      class="flex-wrap"
      style="justify-content: space-between;margin:8px 10px 0 10px"
    >
      <div
        style="width:48%;margin-bottom: 10px"
        class="flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        <p style="min-width:75px">{{ item.fColumnDes }}:</p>

        <template
          v-if="
            homeSelArr && homeSelArr.length > 0 && selectFunction(item.fColumn)
          "
        >
          <el-select
            filterable
            v-model="asData[item.fColumn]"
            @change="getVal(asData[item.fColumn], item.fColumn)"
          >
            <el-pagination
              v-if="totalA(item.fColumn) > selpagesize"
              @size-change="sizeChange"
              @current-change="currentChange"
              :current-page.sync="currentPage"
              :page-size="selpagesize"
              layout="total, prev, pager, next"
              :total="totalA(item.fColumn)"
            >
            </el-pagination>
            <div
              style="display: flex;margin: 0 20px"
              v-if="isShow(item.fColumn)"
            >
              <el-input
                style="margin-left: 0px"
                v-model.trim="selData[item.fColumn]"
                placeholder="请输入查询的数据"
              ></el-input>
              <el-button
                style="margin-left:10px"
                type="primary"
                size="mini"
                @click="getSelectData"
                >查询</el-button
              >
            </div>
            <el-option
              :value="i[selectStr(item.fColumn)]"
              v-for="i in selectData(item.fColumn)"
              :key="i[selectVal(item.fColumn)]"
              :label="i[selectStr(item.fColumn)]"
            ></el-option>
          </el-select>
        </template>
        <el-row v-else-if="item.fComputer == 'between'">
          <el-col :span="11">
            <el-input
              v-model.trim="startData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
          <el-col :span="2">——</el-col>
          <el-col :span="11">
            <el-input
              style="margin-left:0px"
              v-model.trim="endData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
        </el-row>
        <el-input
          v-else
          v-model="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
          clearable
        ></el-input>
      </div>
    </div>

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
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
    
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          :width="item.width"
          :column-key="item.fColumn"
        >
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
    <!-- 分页 -->
    <div class="flex-justify-end" style="margin-right:30px">
      <p>共{{ total }}条</p>
      <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 50, 100, 400]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination> -->
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import {
  getTableHeadData,
  getTableBodyData,
  getTableSelData
} from "@/api/index";
export default {
  props: ["fTableView", "homeSelArr"],
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      tableHeadData: [], //表头数据
      searchData: [], //查询的数据
      tableData: [], //表格数据
      pageNum: 1, // 当前页数
      pageSize: 10, // 每页条数
      total: 0, // 总条数
      fTableViewll: "", //获取表格数据的fTableView
      asData: {},
      sendData: [], //传递过去的数据
      newArr: [],
      selectAllData: [],
      //下拉框分页
      currentPage: 1,
      selpagesize: 100,
      selData: {},
      endData: {},
      startData: {},
      searchWhere: [],
      tableHeight: 450, //document.body.clientHeight
      userDes: this.$store.state.user.userInfo.userDes
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

 
    reset() {
      this.asData = {};
    },
  
    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        this.tableHeadData.forEach(item => {
          if (item.fColumn == "fProductName") {
            this.$set(item, "width", 260);
          } else {
            this.$set(item, "width", 130);
          }
        });
        let searchArr = [];
        searchArr = this.tableHeadData.filter(element => {
          return element.fQureyCol == 1;
        });
        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        let arr = [];
        ColumnArr.forEach((element, index) => {
          this.tableHeadData.forEach((item, index) => {
            // if (item.fColumn.includes(element)) {
            //这里用相等 当勾选的字段名相近时就会把没勾选的值给添加进来
            if (item.fColumn == element) {
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
        console.log(this.tableHeadData, "dailog表头数据");
      } else {
        this.$message.error(res.Message);
      }
    },
    search() {
      this.getTableData();
    },
    //获取表格内容数据
    async getTableData() {
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          // console.log(element,"element")
          if (this.asData[element.fColumn]) {
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: this.asData[element.fColumn]
            };
            this.searchWhere.push(obj);
          }
        });
      }
      let startobj = {};
      let endobj = {};
      let arr = [];
      for (const key in this.startData) {
        for (const Ikey in this.endData) {
          if (
            Ikey == key &&
            this.startData[key] != null &&
            this.endData[Ikey] != null
          ) {
            startobj = {
              Computer: ">=",
              DataFile: key,
              Value: this.startData[key]
            };
            endobj = {
              Computer: "<=",
              DataFile: key,
              Value: this.endData[Ikey]
            };

            arr.push(startobj);
            arr.push(endobj);
          } else {
            startobj = {};
            endobj = {};
          }
        }
      }
      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }
      let res = await getTableBodyData(
        this.fTableViewll,
        this.searchWhere,
        0,
        0
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
      } else {
        this.$message.error(res.Message);
      }
    },

    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    },
    submitForm() {
      this.$emit("closeBox", JSON.parse(JSON.stringify(this.sendData)));
    },
    resetForm() {
      this.$emit("closeBox");
      this.asData = {};
    },
    handleSelectionChange(val) {
      this.sendData = val;
    }, //判断当前字段是否需要做下拉框 v表头所有的字段
    selectFunction(v) {
      // console.log(v);
      let cc = false;
      this.homeSelArr.forEach(element => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
    },
    // 获取所有需要下拉选择的内容
    async getSelectData(loading) {
      // console.log(this.asData,"asData")
      let arr = [];
      let searchWhere = [];
      let pageNumber = 1;
      let obj = {};
      let searchColumn = "";
      let searchValue = "";
      if (JSON.stringify(this.selData) != "{}") {
        for (const key in this.selData) {
          for (let i = 0; i < this.homeSelArr.length; i++) {
            if (this.homeSelArr[i].fName == key) {
              searchColumn = this.homeSelArr[i].fDes;
              searchValue = this.selData[key];
            }
          }
        }
      }

      obj = {
        Computer: "_like_",
        DataFile: searchColumn,
        Value: searchValue
      };
      console.log(obj);
      for (let i = 0; i < this.homeSelArr.length; i++) {
        if (this.homeSelArr[i].pageNum) {
          pageNumber = this.homeSelArr[i].pageNum;
        } else {
          let totalNum = this.pagesize * this.currentPage;
          if (this.totalA(this.homeSelArr[i].fName) <= totalNum) {
            pageNumber = 1;
          } else {
            pageNumber = this.currentPage;
          }
        }

        if (this.homeSelArr[i].searchWhere) {
          if (this.homeSelArr[i].searchWhere.length == 1) {
            searchWhere = this.homeSelArr[i].searchWhere;
          } else {
            this.homeSelArr[i].searchWhere.pop();
          }
          // console.log(this.homeSelArr[i].searchWhere, "searchW");
        } else {
          searchWhere = [];
        }

        if (searchColumn != "" && this.homeSelArr[i].fDes == searchColumn) {
          pageNumber = 1;
          searchWhere.push(obj);
        } else {
        }

        let res = await getTableSelData(
          this.homeSelArr[i].fUrl,
          searchWhere,
          pageNumber,
          this.selpagesize,
          loading
        );
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        console.log(res);
        if (res.State) {
          this.selData = {};
          let obj = {
            fName: this.homeSelArr[i].fName, //当前字段
            data: JSON.parse(res.Data), //当前字段下拉框的值
            total: res.TTLPage, //当前字段下拉的总页数
            isShowSel: this.homeSelArr[i].isShowSel //当前下拉框是否显示搜索框
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }

      this.selectAllData = arr;
    },
    isShow(fColumn) {
      let isShow = false;
      this.selectAllData.forEach(ele => {
        if (ele.fName == fColumn) {
          isShow = ele.isShowSel;
        }
      });
      return isShow;
    },
    // 下拉选择框选中值后，带出其他需要带出的值
    getVal(val, n) {
      console.log(val, n);
      //当前选择框对应的数据
      let arr = [];
      this.selectAllData.forEach(ele => {
        if (ele.fName == n) {
          arr = ele.data;
        }
      });
      //选中值后对应的单条数据
      let data = {};
      arr.forEach(el => {
        if (el.fID == val) {
          data = el;
        }
      });
    },
    // options下拉选择框的内容
    selectData(v) {
      let arr = [];
      this.selectAllData.forEach(ele => {
        if (ele.fName == v) {
          arr = ele.data;
        }
      });

      return arr;
    },
    //下拉选择框需要显示的label字段
    selectStr(v) {
      let str = "";
      this.homeSelArr.forEach(element => {
        if (element.fName == v) {
          str = element.fDes;
        }
      });
      return str;
    },
    //下拉选择框选择的值
    selectVal(v) {
      let str = "";
      this.homeSelArr.forEach(element => {
        if (element.fName == v) {
          str = element.fID;
        }
      });
      return str;
    },
    totalA(fColumn) {
      // console.log(fColumn);
      let num = 0;
      this.selectAllData.forEach(ele => {
        if (ele.fName == fColumn) {
          num = ele.total;
        }
      });
      return num;
    },
    //下拉框分页
    sizeChange(val) {
      this.selpagesize = val;
      this.getSelectData();
    },
    currentChange(val) {
      this.currentPage = val;
      this.getSelectData();
    }
  },

  created() {
    this.getTableHeadData();
    if (this.homeSelArr && this.homeSelArr.length > 0) {
      this.getSelectData(true);
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

/deep/ .el-dialog {
  margin: 50px auto !important;
}
</style>
