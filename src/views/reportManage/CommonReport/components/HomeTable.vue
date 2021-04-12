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
          v-model="asData[item.fColumn]"
        ></el-checkbox>

        <el-row
          v-else-if="
            item.fDataType == 'datetime' && item.fComputer == 'between'
          "
        >
          <el-col :span="11">
            <el-date-picker
              v-model.trim="startData[item.fColumn]"
              type="date"
              placeholder="请输入范围值"
              min-width="200"
            ></el-date-picker>
          </el-col>
          <el-col :span="2">——</el-col>
          <el-col :span="11">
            <el-date-picker
              v-model.trim="endData[item.fColumn]"
              type="date"
              placeholder="请输入范围值"
              min-width="200"
            ></el-date-picker>
          </el-col>
        </el-row>
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model.trim="asData[item.fColumn]"
          type="date"
          placeholder="选择日期时间"
          min-width="300"
        ></el-date-picker>
        <!-- 需要使用下拉选择框的 -->
        <template
          v-else-if="
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
          icon="el-icon-setting"
          @click="addPopRight"
          :disabled="userLimit('fAdd')"
          v-if="stock"
          >设置在库数量</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="el-icon-s-opportunity"
          @click="propsAdjust"
          v-if="stock"
        >
          属性调整</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-export"
          :disabled="userLimit('fExport')"
          @click="handerExport"
          >导出</el-button
        >
      </div>
    </div>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
       v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      :max-height="tableHeight"
      border
      style="width: 100%"
      :data="tableData"
      highlight-current-row
      @current-change="handleCurrentRow"
    >
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
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
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData, exportData } from "@/api/index";
export default {
  //fTableView:请求列头   isSaveSuccess:是否保存成功 stock:库存查询显示的按钮
  props: ["fTableView", "isSaveSuccess", "searchParams", "stock", "Desc"],
  data() {
    return {
      searchData: [],
      tableHeadData: [], //表头数据
      //搜索条件
      searchWhere: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      //当前行
      currentRow: null,
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      asData: {},
      endData: {},
      startData: {},

      selectAllData: [],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      homeSelArr:[]
    };
  },

  methods: {
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData, "列头");

        //过滤搜索的字段
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
        //搜索的数据
        this.searchData = arr;
      } else {
        this.$message.error(res.Message);
      }
    },

    handleCurrentRow(val) {
      this.currentRow = val;
    },
    //查询
    search() {
      this.pageNum = 1;
      this.getTableData();
    },
    //获取table表格内容数据
    async getTableData() {
      this.searchCommon();
      let res = await getTableBodyData(
        this.fTableViewData,
        this.searchWhere,
        this.pageNum,
        this.pageSize,
        this.Desc
      );

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res);
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        // console.log(this.tableData, "表体内容");
      } else {
        this.$message.error(res.Message);
      }
      this.total = res.TTLPage;
    },

    //属性调整
    propsAdjust() {
      if (this.currentRow == null) {
        this.$message.warning("请选择一行数据!");
      } else {
        this.$emit("openEditDrawer", this.currentRow, this.tableHeadData);
      }
    },
    //新增
    addPopRight() {
      if (this.currentRow == null) {
        this.$message.warning("请选择一行数据!");
      } else {
        this.$emit("openDrawer", this.currentRow);
      }
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
      let a = userLimit(val);
      return a;
    },

    //EXCEL导出
    async handerExport() {
      this.searchCommon();
      let res = await exportData(
        this.fTableViewData,
        this.searchWhere,
        this.fTableView
      );
      // console.log(res);
      if (!res) return;
      var blob = new Blob([res], {
        type: "application/vnd.ms-excel;charset=utf-8"
        //  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
      });
      var downloadElement = document.createElement("a");
      var href = window.URL.createObjectURL(blob); //创建下载的链接

      downloadElement.href = href;
      downloadElement.download = `${this.$route.meta.title}-详情.xlsx`; //下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); //点击下载
      document.body.removeChild(downloadElement); //下载完成移除元素
      window.URL.revokeObjectURL(href); //释放掉blob
    },
    searchCommon() {
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];
            if (result instanceof Date) {
              result = timeCycle(result);
              // console.log(result);
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
      arr = [
        {
          data: [
            {
              fID: 1,
              fStateDes: "已审核"
            },
            {
              fID: 0,
              fStateDes: "未审核"
            }
          ],
          fName: "fStateDes"
        }
      ];
      arr.push(this.remorkData);
      this.selectAllData = arr;
      console.log(this.selectAllData);
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
        // console.log(ele.fName, "v", v);
        if (ele.fName == v) {
          arr = ele.data;
        }
      });
      // console.log(arr);
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
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.getTableData();
      }
    }
  },
  created() {
    this.getTableHeadData();
    if(this.fTableView=="t__ChengzhongRenWu_Item"){
      // this.homeSelArr=[
      //   {
      //     fName: "fStateDes",
      //     fUrl: "",
      //     fDes: "fStateDes",
      //     fID: "fState",
      //     isShowSel: false
      //   },
      // ]
    }
    //  if (this.homeSelArr && this.homeSelArr.length > 0) {
    //   this.getSelectData();
    // }
  }
};
</script>
<style lang="scss" scoped></style>
