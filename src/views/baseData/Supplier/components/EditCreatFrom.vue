<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存
      </el-button>
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>
        取消
      </el-button>
    </div>

    <el-form
      label-position="right"
      label-width="120px"
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
          <template
            v-if="
              selectArr && selectArr.length > 0 && selectFunction(item.fColumn)
            "
          >
            <el-select
              filterable
              v-model="ruleForm[item.fColumn]"
              @change="getName(ruleForm[item.fColumn], item.fColumn)"
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
          <!-- 省市联动 -->
          <el-cascader
            v-else-if="item.fColumn == 'address'"
            size="large"
            :options="options"
            v-model="selectedOptions"
            @change="handleChange"
          >
          </el-cascader>
          <el-date-picker
            v-else-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-date-picker>
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
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData, getTableBodyData, getTableSelData } from "@/api/index";
import { creatRules } from "@/utils/common";
import { regionData, CodeToText } from "element-china-area-data";
export default {
  data() {
    return {
      options: regionData,
      selectedOptions: [],
      //表单数据
      ruleForm: {},
      rules: {},
      currentPage: 1,
      pagesize: 100,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      obj: {
        fColumn: "address",
        fColumnDes: "选择地址",
        fComputer: "",
        fDataType: "string",
        fDateFormat: "",
        fDecimal: 0,
        fEnd: "",
        fHeader: "",
        fIsNo: 0,
        fKey: 0,
        fLanguageCode: "",
        fLength: 200,
        fLoadData: 0,
        fNeedSave: 0,
        fNotNull: 1,
        fQureyCol: 1,
        fReadOnly: 0,
        fRemark: "",
        fSn: 0,
        fSort: 2,
        fTableView: "t_AddressBook",
        fVisible: 1
      },
      //需要下拉选择的所有数据
      selectAllData: [],
      asData: {}
    };
  },
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    rowData: {
      type: Object,
      default: () => {}
    },
    tableName: {
      type: String,
      default: () => ""
    },

    selectArr: {
      type: Array,
      default: () => []
    },
    selectParams: {
      type: Array,
      default: () => []
    },
    fVisibleColumn: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    handleChange() {
      var loc = "";
      let obj = {};
      for (let i = 0; i < this.selectedOptions.length; i++) {
        loc += CodeToText[this.selectedOptions[i]] + ",";
      }

      loc = loc.substring(0, loc.lastIndexOf(","));
      let arr = loc.split(",");
      let newArr = ["fProvince", "fCity", "fDistrict"];

      for (let i = 0; i < newArr.length; i++) {
        obj[newArr[i]] = arr[i];
      }

      if (obj.fDistrict == undefined) {
        obj.fDistrict = "";
      }
      this.ruleForm = Object.assign(this.ruleForm, obj);
    },

    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              headData: this.tableHead,
              updateData: [this.ruleForm],
              TableName: this.tableName
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("修改成功!");
            this.changeColumn();
            this.$emit("closeBox", res.State);
            this.ruleForm = {};
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.ruleForm = {};
      this.changeColumn();
      this.$emit("closeBox");
    },
    changeColumn() {
      this.tableHead.splice(5, 1);
      this.fVisibleColumn.forEach(item => {
        this.tableHead.forEach(ele => {
          if (item == ele.fColumn) {
            this.$set(ele, "fVisible", 1);
          }
        });
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
          pageNumber = this.currentPage;
          // let totalNum = this.pagesize * this.currentPage;
          // if (this.totalA(this.selectArr[i].fName) <= totalNum) {
          //   pageNumber = 1;
          // } else {
          //   pageNumber = this.currentPage;
          // }
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
        }

        let res = await getTableSelData(
          this.selectArr[i].fUrl,
          searchWhere,
          pageNumber,
          this.pagesize,
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
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
      this.pagesize = val;
      this.getSelectData();
    },
    handleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      this.currentPage = val;
      this.getSelectData();
    },
    totalA(fColumn) {
      // console.log(fColumn);
      let num = 0;
      this.selectAllData.forEach(ele => {
        if (ele.fName == fColumn) {
          num = ele.total;
        }
      });
      // console.log(num);
      return num;
    },
    //判断当前字段是否需要做下拉框
    //v表头所有的字段
    selectFunction(v) {
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
      // console.log(this.selectArr)
      let str = "";
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          str = element.fID;
        }
      });
      return str;
    },
    // 下拉选择框选中值后，带出其他需要带出的值
    getName(val, n) {
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
    //回显省事联动
    selGetArea() {
      let str = [];
      this.selectParams.forEach(item => {
        for (const key in this.ruleForm) {
          if (item == key) {
            str.push(this.ruleForm[item]);
          }
        }
      });

      var temp = [];
      let that = this;
      scoure(str);
      function scoure(str) {
        for (let i = 0; i < that.options.length; i++) {
          function getChildren(item) {
            if (str.includes(item.label)) {
              temp = temp.concat(item.value);
              if (item.children && item.children.length > 0) {
                item.children.forEach(v => {
                  getChildren(v);
                });
              }
            }
            return temp;
          }
          getChildren(that.options[i]);
        }
      }
      this.selectedOptions = temp;
    },
    //处理bit类型的回显
    changeBool() {
      this.tableHead.forEach(element => {
        if (element.fDataType == "bit" && this.ruleForm[element.fColumn] == 1) {
          this.$set(this.ruleForm, element.fColumn, true);
        } else if (
          element.fDataType == "bit" &&
          this.ruleForm[element.fColumn] == 0
        ) {
          this.$set(this.ruleForm, element.fColumn, false);
        }
      });
    }
  },
  created() {
    this.rules = creatRules(this.tableHead);
    this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
    this.ruleForm.fModifyDate = new Date();
    this.tableHead.splice(5, 0, this.obj);
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData(true);
    }
    this.fVisibleColumn.forEach(item => {
      this.tableHead.forEach(ele => {
        if (item == ele.fColumn) {
          this.$set(ele, "fVisible", 0);
        }
      });
    });
    this.selGetArea();
    this.changeBool();
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal));
      this.selGetArea();
      this.changeBool();
      this.tableHead.splice(5, 0, this.obj);
      this.fVisibleColumn.forEach(item => {
        this.tableHead.forEach(ele => {
          if (item == ele.fColumn) {
            this.$set(ele, "fVisible", 0);
          }
        });
      });

      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.$set(this.ruleForm, "fModifier", userInfo.userId);
      this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
      this.ruleForm.fModifyDate = new Date();
    }
  }
};
</script>
<style lang="scss" scoped></style>
