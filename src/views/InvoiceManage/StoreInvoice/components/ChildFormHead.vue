<template>
  <div>
    <div class="btns" v-if="addItem">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
        >取消</el-button
      >
    </div>
    <el-form
      :label-position="labelPosition"
      label-width="160px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="flex-wrap form-margin"
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
          <!-- 需要使用下拉选择框的 -->
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
          <!-- 补货作业 fRealqty(实际数量) -->
          <el-input
            v-else-if="
              (item.fColumn == 'fRealqty' && item.fDataType == 'decimal') ||
                (item.fColumn == 'fInPrice' && item.fDataType == 'decimal')
            "
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
            @change="getChangeValue"
          ></el-input>

          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-checkbox>
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
  getOrderNo,
  getTableSelData
} from "@/api/index";
//fState :主表状态值
export default {
  props: ["fTableViewHead", "addItem", "selectArr", "StateObj"],
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
      //下拉框分页
      currentPage: 1,
      selpagesize: 100,
      asData: {},
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  created() {
    this.getTableHeadData();
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData(true);
    }
  },
  mounted() {
    setTimeout(() => {
      this.getOrderNoData();
    }, 100);
  },
  methods: {
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
        this.ruleForm = defaultForm(this.tableHead);
        this.rules = creatRules(this.tableHead);
        // console.log(this.StateObj,this.StateObj&&this.StateObj.length > 0)
        if (this.StateObj && this.StateObj.length > 0) {
          //设置状态默认值
          this.$set(this.ruleForm, this.StateObj[0].key, this.StateObj[0].val);
          this.$set(this.ruleForm, this.StateObj[1].key, this.StateObj[1].val);
        }
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取入库单号
    async getOrderNoData() {
      let res = await getOrderNo(this.fTableViewHead);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        for (const key in this.ruleForm) {
          if (key.indexOf("fAPNo") != -1 ) {
            this.ruleForm[key] = res.Data;
          }
        }
      }
    },
    //新增子项,提交
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.$notify({
            title: "新增",
            message: "新增成功",
            type: "success"
          });
          this.$emit(
            "closeBox",
            JSON.parse(JSON.stringify(this.ruleForm)),
            this.fTableViewHead
          );
          this.ruleForm = {};
        } else {
          return false;
        }
      });
    },
    //取消
    resetForm(formName) {
      // this.ruleForm = {};
      this.$emit("closeBox");
    },

    getChangeValue() {
      let fInPrice = 0;
      let fRealqty = 0;
      if (this.ruleForm.fInPrice) {
        fInPrice = this.ruleForm.fInPrice;
      }
      if (this.ruleForm.fRealqty) {
        fRealqty = this.ruleForm.fRealqty;
      }
      let value = Number(fInPrice) * parseInt(fRealqty);
      this.$set(this.ruleForm, "fInAmount", value);
    },
    //判断当前字段是否需要做下拉框
    //v表头所有的字段
    selectFunction(v) {
      // console.log(v);
      let cc = false;
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
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
      // console.log(val,n)
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
                console.log(itemVal.key,item,111)
                if (itemVal.key == item) {
                  this.ruleForm[item] = data[itemVal.value];
                  console.log(this.ruleForm[item])
                  console.log(data[itemVal.value])
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
          this.selpagesize,
          loading
        );
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        console.log(res);
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

  watch: {
    ruleForm: function(val) {
      this.ruleForm.fID = 0;
    }
  }
};
</script>
<style lang="scss" scoped></style>
