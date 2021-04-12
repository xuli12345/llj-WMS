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
      label-width="180px"
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
              :multiple="item.fColumn == 'fPickingPlace'"
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
            v-else-if="item.fDataType == 'decimal'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
            @change="computeValue(item.fColumn)"
          ></el-input>
          <el-input
            @change="changePassword(ruleForm[item.fColumn])"
            v-else-if="item.fColumn == 'fPassWord'"
            v-model="ruleForm[item.fColumn]"
            type="password"
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
import { decryptDesCbc, encryptDesCbc } from "@/utils/cryptoJs.js";
import {
  addformSaveData,
  collectionData,
  getTableBodyData,
  getTableSelData
} from "@/api/index";
import { addParams, creatRules } from "@/utils/common";
import md5 from "js-md5";
export default {
  data() {
    return {
      //表单数据
      ruleForm: {},
      rules: {},
      //分页
      currentPage: 1,
      pagesize: 100,
      //修改后的密码
      newPassword: "",
      selectAllData: [],
      asData: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId
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
    //需要做下拉框的数据
    selectArr: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    changePassword(val) {
      this.newPassword = val;
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (this.newPassword) {
            this.$set(this.ruleForm, "fPassWord", md5(this.newPassword));
          }

          if (
            "fPickingPlace" in this.ruleForm &&
            this.ruleForm["fPickingPlace"].length > 0
          ) {
            let value = this.ruleForm["fPickingPlace"];
            console.log(value);
            value = value.join(",");
            this.$set(this.ruleForm, "fPickingPlace", value);
          } else {
            this.$set(this.ruleForm, "fPickingPlace", null);
          }
          if ("fState1" in this.ruleForm && this.ruleForm.fState1 == true) {
            this.ruleForm.fState1 = 1;
          } else {
            this.ruleForm.fState1 = 0;
          }
          if (Number(this.ruleForm.fFrozenNum) > this.ruleForm.fStockNum) {
            this.$message.error("锁定的数量不可大于库存数量");
            return;
          }
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
      this.$emit("closeBox");
    },
    computeValue(val) {
      //fContainerLength fContainerWidth fContainerHigh fContainerVolumet
      let length = 0;
      let Width = 0;
      let height = 0;

      if (this.ruleForm.fContainerLength) {
        length = this.ruleForm.fContainerLength;
      }
      if (this.ruleForm.fContainerWidth) {
        Width = this.ruleForm.fContainerWidth;
      }
      if (this.ruleForm.fContainerHigh) {
        height = this.ruleForm.fContainerHigh;
      }

      let value = length * Width * height;
      this.$set(this.ruleForm, "fContainerVolumet", value);
    },
    // 获取所有需要下拉选择的内容
    async getSelectData(loading) {
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
      // console.log(v,"v")
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
    }
  },

  created() {
    this.rules = creatRules(this.tableHead);
    this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    this.computeValue();
    if (
      "fPickingPlace" in this.ruleForm &&
      this.ruleForm["fPickingPlace"] != ""
    ) {
      let value = this.ruleForm["fPickingPlace"];
      if (value != null) {
        value = value.split(",");
        this.$set(this.ruleForm, "fPickingPlace", value);
      }
    }
    this.ruleForm.fModifyDate = new Date();
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
    //判断获取下拉框的数据
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData(true);
    }
    // console.log(this.tableHead);
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

    // console.log(this.ruleForm);
    if (this.ruleForm.fType) {
      if (this.ruleForm.fType.includes("模块分类")) {
        this.$set(this.ruleForm, "fType", 1);
      } else if (this.ruleForm.fType.includes("模块程序")) {
        this.$set(this.ruleForm, "fType", 0);
      }
    }
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal));
      if (
        "fPickingPlace" in this.ruleForm &&
        this.ruleForm["fPickingPlace"] != ""
      ) {
        let value = this.ruleForm["fPickingPlace"];
        if (value != null) {
          value = value.split(",");
          this.$set(this.ruleForm, "fPickingPlace", value);
        }
      }
      this.ruleForm.fModifyDate = new Date();
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.$set(this.ruleForm, "fModifier", userInfo.userId);
      this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);

      if (this.ruleForm.fType) {
        if (this.ruleForm.fType.includes("模块分类")) {
          this.$set(this.ruleForm, "fType", 1);
        } else if (this.ruleForm.fType.includes("模块程序")) {
          this.$set(this.ruleForm, "fType", 0);
        }
      }
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
  }
};
</script>
<style lang="scss" scoped></style>
