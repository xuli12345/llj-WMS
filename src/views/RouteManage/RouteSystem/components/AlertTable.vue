<template>
  <div>
    <div class="pan-btns">
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
    </div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        {{ item.fColumnDes }}:
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
            <el-option
              :value="i[selectStr(item.fColumn)]"
              v-for="i in selectData(item.fColumn)"
              :key="i[selectVal(item.fColumn)]"
              :label="i[selectStr(item.fColumn)]"
            ></el-option>
          </el-select>
        </template>
        <el-input
          v-else
          v-model="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
          clearable
        ></el-input>
      </div>
      <div style="margin-top:10px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="search"
          >查询</el-button
        >
      </div>
    </div>

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
          min-width="120px"
          :column-key="item.fColumn"
        >
          <!-- <template slot-scope="scope">
            <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 0 ? false : true"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-checkbox>
            <el-select
              @change="selectDataType(scope.row, scope.row[item.fColumn])"
              v-else-if="item.fColumn == 'fDataType'"
              v-model="scope.row[item.fColumn]"
              placeholder="请选择"
              :disabled="item.fReadOnly == 0 ? false : true"
            >
              <el-option
                v-for="optionItem in selectOptions"
                :key="optionItem.value"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </el-select>

            <el-input
              v-else
              v-model="scope.row[item.fColumn]"
              :maxlength="scope.row[item.fLength]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input>
          </template> -->
        </el-table-column>
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
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
export default {
  props: ["fTableView", "homeSelArr"],
  data() {
    return {
      tableHeight: document.body.clientHeight,
      tableHeadData: [], //表头数据
      getRowKeys(row) {
        return row.fID;
      },
      //查询的数据
      searchData: [],
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //权限表修改的数据
      userDes: this.$store.state.user.userInfo.userDes,

      //传递过去的数据
      sendData: [],
      newArr: [],
      asData: {},
      selectAllData: [],
      vfTableView: ""
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
    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        item[val] = 0;
        this.$set(item, val, 0);
      }
    },
    //表格筛选
    async filterTagTable(filters) {
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

      let res = await getTableBodyData("v_ShopItem", searchData);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;

        console.log(this.tableData, "筛选表体内容");
      }
    },

    //获取表格表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        this.vfTableView = res.fTableViewData;

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
      this.getTableData(this.vfTableView);
    },
    //获取表格内容数据
    async getTableData(fTableView) {
      this.pageNum = 1;
      let searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: this.asData[element.fColumn]
            };
            searchWhere.push(obj);
          }
        });
      }
      let res = await getTableBodyData(fTableView, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res, "ieie");
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
      } else {
        this.$message.error(res.Message);
      }
    },

    //验证表格内容不能为空
    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    },
    //获取门店数据
    submitForm() {
      this.$emit("closeBox", JSON.parse(JSON.stringify(this.sendData)));
    },
    resetForm() {
      this.$emit("closeBox");
    },
    handleSelectionChange(val) {
      this.sendData = val;
    },
    //判断当前字段是否需要做下拉框 v表头所有的字段
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
    async getSelectData() {
      let arr = [];

      let searchWhere = [];
      for (let i = 0; i < this.homeSelArr.length; i++) {
        let res;
        if (this.homeSelArr[i].searchWhere) {
          searchWhere = this.homeSelArr[i].searchWhere;
          res = await getTableBodyData(this.homeSelArr[i].fUrl, searchWhere);
        } else {
          searchWhere = [];
          res = await getTableBodyData(this.homeSelArr[i].fUrl, searchWhere);
        }
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let obj = {
            fName: this.homeSelArr[i].fName, //当前字段
            data: JSON.parse(res.Data) //当前字段下拉框的值
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }

      this.selectAllData = arr;
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
    }
  },
  watch: {
    tableData: function() {
      this.total = this.tableData.length;
    }
  },
  created() {
    this.getTableHeadData();
    if (this.homeSelArr && this.homeSelArr.length > 0) {
      this.getSelectData();
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
.pan-btns {
  margin-bottom: 10px;
}
</style>
