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
          v-model="asData[item.fColumn]"
          type="datetime"
          placeholder="选择日期时间"
        ></el-date-picker>
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

        <template
          v-else-if="fColumn.length > 0 && fColumn.includes(item.fColumn)"
        >
          <el-select
            clearable
            v-model="cargData[item.fColumn]"
            @change="getName(cargData[item.fColumn], item.fColumn)"
          >
            <el-option
              v-for="i in sData(item.fColumn)"
              :label="i.fColumnDes"
              :key="i.ID"
              :value="i.fColumnDes"
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
      <!-- 货位层数 -->
      <div style="display:flex; width:23%;margin:10px 15px 0 0">
        <span style="min-width:60px">货位层数:</span>
        <el-select clearable v-model="pliesValue" placeholder="请选择">
          <el-option
            v-for="item in pliesOptions"
            :key="item.ID"
            :label="item.fColumnDes"
            :value="item.fColumnDes"
          >
          </el-option>
        </el-select>
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
          class="iconfont icon-dayin1"
          @click="printCon()"
          :disabled="userLimit('fPrint')"
          >打印</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-dayin1"
          @click="pliesPrintCon()"
          :disabled="userLimit('fPrint')"
          >按层数打印</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-export"
          @click="handerExport"
          :disabled="userLimit('fExport')"
          >导出</el-button
        >
        <!-- <el-button
          type="primary"
          size="mini"
          class="iconfont icon-yishenhe"
          @click="handleCheck"
          >修改</el-button
        > -->

        <!-- <el-button
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        > -->
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
      :row-key="getRowKeys"
      :data="tableData | pagination(pageNum, pageSize)"
      @selection-change="handleSelectionChange"
      @row-dblclick="dblclick"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template>
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
          </el-table-column>
        </template>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="180">
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
    <!-- 打印格式内容     -->
    <div style="width:0; height:0;overflow:hidden">
      <PrintTable
        ref="print"
        v-if="isRender"
        id="toPrint"
        :dataCode="dataCode"
      ></PrintTable>
    </div>

    <!-- 打印低位货位格式内容   -->
    <div style="width:0; height:0;overflow:hidden">
      <PrintCode
        v-if="isCodeRender"
        ref="toCodePrint"
        id="toCodePrint"
        :dataCode="codeList"
      ></PrintCode>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare, addParams } from "@/utils/common";
import { chunk } from "@/utils/index";
import PrintTable from "./PrintStorage";
import PrintCode from "./PrintCode";
import PrintJS from "print-js";
import {
  getTableBodyData,
  getTableHeadData,
  deleteStorageItem,
  collectionData,
  exportData
} from "@/api/index";

export default {
  props: ["fTableView", "tableName", "isSaveSuccess", "fColumn", "selData"],
  components: {
    PrintTable,
    PrintCode
  },
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },

      inputValue: "",
      //是否临时库位
      fIsTemporaryStorage: false,
      searchData: [],
      tableHeadData: [],
      fTableViewData: "",
      BatchList: [],
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      asData: {},
      endData: {},
      startData: {},
      dataCode: [],
      codeList: [], //低位货位标签数据
      isRender: false,
      isCodeRender: false,
      cargData: {},
      pliesValue: "",
      pliesOptions: [
        { ID: 1, fColumnDes: "第一层" },
        { ID: 2, fColumnDes: "第二层" },
        { ID: 3, fColumnDes: "第三层" },
        { ID: 4, fColumnDes: "第四层" },
        { ID: 5, fColumnDes: "第五层" }
      ],
      tableHeight: document.body.clientHeight,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  methods: {
    sData(v) {
      let arr = [];
      this.selData.forEach(element => {
        if (element.name == v) {
          arr = element.data;
        }
      });
      return arr;
    },
    getName(data, i) {
      let arr = this.sData(i);
    },
    //批量删除
    // BatchDelete() {
    //   if (this.BatchList.length == 0) {
    //     this.$message.warning("请选择要删除的数据!");
    //   } else {
    //     let result = batchDelete(this.tableHeadData, this.BatchList);
    //     this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     })
    //       .then(async () => {
    //         let res = await addformSaveData([
    //           {
    //             lstSaveData: [
    //               {
    //                 TableName: this.tableName,
    //                 IdentityColumn: null,
    //                 InsertRow: null,
    //                 UpdateRow: null,
    //                 DeleteRow: result.arr,
    //                 Columns: result.columns
    //               }
    //             ]
    //           },
    //           { userDes: this.userDes, userId: this.userId }
    //         ]);
    //         res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

    //         if (res.State) {
    //           this.$message.success("删除成功!");
    //           this.getTableData();
    //         } else {
    //           this.$message.error(res.errstr);
    //         }
    //       })
    //       .catch(() => {
    //         this.$message({
    //           type: "info",
    //           message: "已取消删除"
    //         });
    //       });
    //   }
    // },
    async pliesPrintCon() {
      if (
        JSON.stringify(this.startData) == "{}" ||
        JSON.stringify(this.endData) == "{}" ||
        this.startData.fStorageCode == "" ||
        this.endData.fStorageCode == ""
      ) {
        this.$message.warning("请在库位编码中筛选要打印的库位标签!");
      } else if (this.tableData.length <= 0) {
        this.$message.warning("请点击查询按钮查询要打印的标签数据!");
      } else if (this.pliesValue == "") {
        this.$message.warning("请选择要打印货位的层数!");
      } else {
        //处理数组对象 排序相同的属性
        this.tableData.sort((a, b) => {
          if (a["fStorageBarCode"] != b["fStorageBarCode"]) {
            return a["fStorageBarCode"].localeCompare(b["fStorageBarCode"]);
          }
        });

        this.codeList = this.tableData;
        this.isCodeRender = true;
        setTimeout(() => {
          PrintJS({
            printable: "toCodePrint",
            type: "html",
            scanStyles: false,
            css: [
              // "@/assets/iconfont/iconfont.css",
              // "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
            ]
          });
        }, 500);
        setTimeout(() => {
          this.isCodeRender = false;
        }, 600);
      }
    },
    async printCon() {
      if (
        JSON.stringify(this.startData) == "{}" ||
        JSON.stringify(this.endData) == "{}" ||
        this.startData.fStorageCode == "" ||
        this.endData.fStorageCode == ""
      ) {
        this.$message.warning("请在库位编码中筛选要打印的库位标签!");
      } else if (this.tableData.length <= 0) {
        this.$message.warning("请点击查询按钮查询要打印的标签数据!");
      } else if (JSON.stringify(this.cargData) == "{}") {
        this.$message.warning("请选择您要打印的货位标签类型!");
      } else {
        //处理数组对象 排序相同的属性
        this.tableData.sort((a, b) => {
          if (a["fStorageBarCode"] != b["fStorageBarCode"]) {
            return a["fStorageBarCode"].localeCompare(b["fStorageBarCode"]);
          }
        });

        if (this.cargData.fCargory == "高位货架标签") {
          //处理箭头指向
          let newArr = [];
          this.tableData.forEach(item => {
            newArr=item.fStorageCode.split("-")
            

            console.log(newArr)
            if (
              (newArr[1] % 2 === 0 && newArr[2] % 2 === 0) ||
              (newArr[1] % 2 != 0 && newArr[2] % 2 != 0)
            ) {
              this.$set(item, "direction", true);
            } else {
              this.$set(item, "direction", false);
            }
          });
          //分割数组
          let arrData = chunk(this.tableData, 6);
          //处理最后一位数的排序
          arrData.forEach(v => {
            v.forEach(i => {
              let lastNum = i.fStorageBarCode.substr(
                i.fStorageBarCode.length - 1,
                1
              );
              this.$set(i, "lastNum", lastNum);
              v.sort(this.compare("lastNum"));
            });
          });

          //组装要循环的数据
          let tableList = [];
          arrData.forEach(item => {
            let result = this.comfun(item, 6);
            console.log(result, "result");
            // let result1 = this.comfun(result.left, 6);
            // let result2 = this.comfun(result1.left, 6);
            // let leftArr = [result2.left, result2.a];
            // let rightArr = [result1.a, result.a];
            let allData = [result.left, result.a];
            tableList.push(allData);
          });
          this.dataCode = tableList;
          this.common();
        } else if (this.cargData.fCargory == "低位货架标签") {
          this.tableData.forEach(i => {
            let lastNum = i.fStorageBarCode.substr(
              i.fStorageBarCode.length - 1,
              1
            );
            this.$set(i, "lastNum", lastNum);
            this.tableData.sort(this.compare("lastNum"));
          });

          this.codeList = this.tableData;

          this.isCodeRender = true;
          setTimeout(() => {
            PrintJS({
              printable: "toCodePrint",
              type: "html",
              scanStyles: false,
              css: [
                // "@/assets/iconfont/iconfont.css",
                // "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
              ]
            });
          }, 500);
          setTimeout(() => {
            this.isCodeRender = false;
          }, 600);
        }
      }
    },
    //对数组进行筛选
    comfun(arr, num) {
      let a = [];
      arr.forEach((item, index) => {
        let str = item.fStorageCode.substr(1, num);
        // console.log(str);
        a = arr.filter(val => {
          return val.fStorageCode.includes(str);
        });
      });

      let copy = JSON.parse(JSON.stringify(arr));
      let left = copy.filter(
        item => !a.some(ele => ele.fStorageCode === item.fStorageCode)
      );
      return {
        a,
        left
      };
    },
    //给定指定的数据排序(由高到低)
    compare(prop) {
      return function(a, b) {
        var value1 = a[prop];
        var value2 = b[prop];
        return value2 - value1;
      };
    },

    common() {
      this.isRender = true;
      setTimeout(() => {
        PrintJS({
          printable: "toPrint",
          type: "html",
          scanStyles: false,
          css: [
            // "@/assets/iconfont/iconfont.css",
            // "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
          ]
        });
      }, 300);
      setTimeout(() => {
        this.isRender = false;
      }, 400);
    },

    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData);

        let newArr = [];
        newArr = this.tableHeadData.filter(element => {
          return element.fKey == 1;
        });
        let obj = {};
        newArr.forEach(item => {
          obj = {
            ColumnName: item.fColumn,
            ColumnType: item.fDataType
          };
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

        let add = {
          fColumn: "fCargory",
          fColumnDes: "货位类型",
          fComputer: "=",
          fDataType: "int"
        };
        arr.push(add);
        console.log(arr, "搜索字段数据");
        this.searchData = arr;
      } else {
        this.$message.error(res.Message);
      }
    },

    //查询
    search() {
      this.getTableData();
    },
    //获取table表格内容数据
    async getTableData() {
      this.pageNum = 1;
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
      let startobj = {};
      let endobj = {};
      let arr = [];
      for (const key in this.startData) {
        for (const Ikey in this.endData) {
          if (Ikey == key) {
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
          }
          if (this.startData[key] == "" && this.endData[Ikey] == "") {
            arr = [];
          }
        }
      }

      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }

      let str = "";
      if (this.pliesValue) {
        if (this.pliesValue == "第一层") {
          str = "1";
        } else if (this.pliesValue == "第二层") {
          str = "2";
        } else if (this.pliesValue == "第三层") {
          str = "3";
        } else if (this.pliesValue == "第四层") {
          str = "4";
        } else if (this.pliesValue == "第五层") {
          str = "5";
        }
      }
      let paliObj = {};
      if (JSON.stringify(this.cargData) == "{}" && this.pliesValue) {
        paliObj = {
          Computer: "=",
          DataFile: "Right(fStorageCode,1)",
          Value: str
        };
        this.searchWhere.push(paliObj);
      } else if (this.cargData.fCargory == "低位货架标签" && this.pliesValue) {
        paliObj = {
          Computer: "<=",
          DataFile: "Right(fStorageCode,1)",
          Value: str
        };
        this.searchWhere.push(paliObj);
      } else if (this.cargData.fCargory == "高位货架标签" && this.pliesValue) {
        paliObj = {
          Computer: ">=",
          DataFile: "Right(fStorageCode,1)",
          Value: str
        };
        this.searchWhere.push(paliObj);
      }

      let res = await getTableBodyData(this.fTableViewData, this.searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;

        this.tableData.forEach(element => {
          for (const key in element) {
            if (key === "fIsTemporaryStorage" && element[key] == null) {
              this.$set(element, "fIsTemporaryStorage", 0);
            }
          }
        });
        console.log(this.tableData, "表体内容");
      }
    },

    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },
    //修改
    handleEdit(row, index) {
      this.$emit("openEditDrawer", row, this.tableHeadData);
    },
    // 删除
    handleDelete(row, index) {
      let RowData = JSON.parse(JSON.stringify(row));
      let resultData = addParams(this.tableHeadData, row);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let res = await deleteStorageItem([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: "fID",
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
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
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
      return userLimit(val);
    },

    async handleCheck() {
      this.tableData.forEach(item => {
        // this.$set(item, "fStorageType", 3);
        this.$set(item, "fAreaID", 21);
      });
      let res = await collectionData([
        {
          TableName: this.tableName,
          headData: this.tableHeadData,
          updateData: this.tableData
        }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res);
    },
    //EXCEL导出
    async handerExport() {
      this.searchCommon();
      let res = await exportData(
        this.fTableViewData,
        this.searchWhere,
        this.tableName
      );
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
          if (Ikey == key) {
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
          }
        }
      }
      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }
    }
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
.demo {
  display: flex;
}

/deep/ .el-input__inner {
  padding: 0 3px 0 10px !important;
}
</style>
