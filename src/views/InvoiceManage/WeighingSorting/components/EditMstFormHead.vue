<template>
  <div>
    <el-form
      :label-position="labelPosition"
      label-width="130px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="flex-wrap"
      style="margin-top:30px"
      :show-message="false"
    >
      <template v-for="(item, index) in tableHead">
        <el-form-item
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
        >
          <el-date-picker
            v-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-date-picker>
          <template
            v-else-if="
              selectArr && selectArr.length > 0 && selectFunction(item.fColumn)
            "
          >
            <el-select
              filterable
              v-model="ruleForm[item.fColumn]"
              @change="getVal(ruleForm[item.fColumn], item.fColumn)"
              :disabled="item.fReadOnly == 0 ? false : true"
            >
              <el-pagination
                v-if="totalA(item.fColumn) > pagesize"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="pagesize"
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
                  v-model.trim="asData[item.fColumn]"
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
                :value="i[selectVal(item.fColumn)]"
                v-for="i in selectData(item.fColumn)"
                :key="i[selectVal(item.fColumn)]"
                :label="i[selectStr(item.fColumn)]"
              ></el-option>
            </el-select>
          </template>

          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
            @change="handleChecked"
          ></el-checkbox>

          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-input
            v-else
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { creatRules, defaultForm, compare } from "@/utils/common";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  getTableHeadData,
  getTableBodyData,
  getTableSelData
} from "@/api/index";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: ["fTableViewHead", "addItem", "selectArr", "rowData"],
  data() {
    return {
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      tableHead: [],
      //需要下拉选择的所有数据
      selectAllData: [],
      //分页
      currentPage: 1,
      pagesize: 100,
      column: "", //获取焦点的字段
      asData: {},
      tableHeight: document.body.clientHeight,
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  async created() {
    this.tableHead = await this.getTableHeadData("t_ChengzhongRenWu_Mst");
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData(true);
    }
    if (this.rowData) {
      this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
      this.ruleForm.fModifyDate = new Date();
      if (this.ruleForm.fMstIsEnd && this.ruleForm.fMstIsEnd == 1) {
        this.$set(this.ruleForm, "fMstIsEnd", true);
        this.tableHead.forEach(item => {
          this.$set(item, "fReadOnly", 1);
        });
      } else {
        this.$set(this.ruleForm, "fMstIsEnd", false);
      }
    } else {
      this.ruleForm = defaultForm(this.tableHead);
    }
  },
  methods: {
    //获取form表单数据
    async getTableHeadData(fTableView) {
      let res = await getTableHeadData(fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.rules = creatRules(this.tableHead);
        let result = res.lstRet.sort(compare);
        return result;
      } else {
        this.$message.error(res.Message);
      }
    },
    //
    handleChecked(val) {
 
      this.$emit("boxChecked",val)
    },
    //判断当前字段是否需要做下拉框
    selectFunction(v) {
      let cc = false;
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
    },
    // 下拉选择框的内容
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
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          str = element.fDes;
        }
      });
      return str;
    },
    //下拉选择框选择的值
    selectVal(v) {
      let str = "";
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          str = element.fID;
        }
      });
      return str;
    },
    // 下拉选择框选中值后，带出其他需要带出的值
    getVal(val, n) {
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

      this.selectArr.forEach(ele => {
        if (ele.fName == n && ele.fAuto) {
          ele.fAuto.forEach(item => {
            let i = false;
            if (ele.fAutoID) {
              i = ele.fAutoID.includes(item);
            }
            if (i) {
              this.ruleForm[item] = data.fID;
              this.ruleForm[n] = data[ele.fDes];
            } else {
              this.ruleForm[item] = data[item];
            }
            if (ele.fEdit && ele.fEdit.length > 0) {
              ele.fEdit.forEach(itemVal => {
                if (itemVal.key == item) {
                  this.ruleForm[item] = data[itemVal.value];
                }
              });
            }
          });
        }
      });
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
      if (JSON.stringify(this.asData) != "{}") {
        for (const key in this.asData) {
          for (let i = 0; i < this.selectArr.length; i++) {
            if (this.selectArr[i].fName == key) {
              searchColumn = this.selectArr[i].fDes;
              searchValue = this.asData[key];
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
      for (let i = 0; i < this.selectArr.length; i++) {
        if (this.selectArr[i].pageNum) {
          pageNumber = this.selectArr[i].pageNum;
        } else {
          let totalNum = this.pagesize * this.currentPage;
          if (this.totalA(this.selectArr[i].fName) <= totalNum) {
            pageNumber = 1;
          } else {
            pageNumber = this.currentPage;
          }
        }

        if (this.selectArr[i].searchWhere) {
          if (this.selectArr[i].searchWhere.length == 1) {
            searchWhere = this.selectArr[i].searchWhere;
          } else {
            this.selectArr[i].searchWhere.pop();
          }
          // console.log(this.selectArr[i].searchWhere, "searchW");
        } else {
          searchWhere = [];
        }

        if (searchColumn != "" && this.selectArr[i].fDes == searchColumn) {
          pageNumber = 1;
          searchWhere.push(obj);
        } else {
        }

        let res = await getTableSelData(
          this.selectArr[i].fUrl,
          searchWhere,
          pageNumber,
          this.pagesize,
          loading
        );
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        // console.log(res);
        if (res.State) {
          this.asData = {};
          let obj = {
            fName: this.selectArr[i].fName, //当前字段
            data: JSON.parse(res.Data), //当前字段下拉框的值
            total: res.TTLPage, //当前字段下拉的总页数
            isShowSel: this.selectArr[i].isShowSel //当前下拉框是否显示搜索框
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
    handleSizeChange(val) {
      this.pagesize = val;
      this.getSelectData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getSelectData();
    }
  },
  watch: {
    rowData(newVal, oldVal) {
      //  console.log(newVal,oldVal)
      this.ruleForm = newVal;
      if (this.ruleForm.fMstIsEnd && this.ruleForm.fMstIsEnd == 1) {
        this.$set(this.ruleForm, "fMstIsEnd", true);
        this.tableHead.forEach(item => {
          this.$set(item, "fReadOnly", 1);
        });
      } else {
        this.$set(this.ruleForm, "fMstIsEnd", false);
      }
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

/deep/ .el-form-item {
  width: 25%;
}
</style>
