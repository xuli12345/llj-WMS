<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存</el-button
      >
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>取消</el-button
      >
    </div>

    <el-form
      label-position="right"
      label-width="140px"
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
          <el-input
            v-else-if="item.fDataType == 'decimal'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
            @change="computeValue(item.fColumn)"
          ></el-input>

          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            @change="showColumn(item.fColumn, ruleForm[item.fColumn], item)"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-checkbox>
          <el-input
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
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData, getTableBodyData, getOrderNo } from "@/api/index";
import { creatRules, defaultForm } from "@/utils/common";
import md5 from "js-md5";
export default {
  data() {
    return {
      //表单数据
      ruleForm: {},
      //验证规则
      rules: {},
      //需要下拉选择的所有数据
      selectAllData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId
    };
  },
  props: {
    //表头数据
    tableHead: {
      type: Array,
      default: () => []
    },
    //保存的tableName字段
    tableName: {
      type: String,
      default: () => ""
    },
    //需要做下拉框的数据
    selectArr: {
      type: Array,
      default: () => []
    },

    showfColumn: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (this.ruleForm.fPassWord != undefined) {
            this.$set(
              this.ruleForm,
              "fPassWord",
              md5(this.ruleForm["fPassWord"])
            );
          }

          if (
            "fPickingPlace" in this.ruleForm &&
            this.ruleForm["fPickingPlace"].length > 0
          ) {
            let value = this.ruleForm["fPickingPlace"];
            value = value.join(",");
            this.$set(this.ruleForm, "fPickingPlace", value);
          } else {
            this.$set(this.ruleForm, "fPickingPlace", null);
          }

          let res = await collectionData([
            {
              TableName: this.tableName,
              headData: this.tableHead,
              insertData: [this.ruleForm]
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.State, res.Identity);
            this.ruleForm = {};
            this.ruleForm = defaultForm(this.tableHead);
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
    async getSelectData() {
      let arr = [];
      let searchWhere = [];
      for (let i = 0; i < this.selectArr.length; i++) {
        if (this.selectArr[i].searchWhere) {
          searchWhere = this.selectArr[i].searchWhere;
        } else {
          searchWhere = [];
        }
        let res = await getTableBodyData(this.selectArr[i].fUrl, searchWhere);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        // console.log(JSON.parse(res.Data));
        if (res.State) {
          let obj = {
            fName: this.selectArr[i].fName, //当前字段
            data: JSON.parse(res.Data) //当前字段下拉框的值
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }
      this.selectAllData = arr;
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
            this.ruleForm[n] = data[ele.fDes];
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
    showColumn(val, status, headItem) {
      // console.log(val, status);
      this.showfColumn.forEach(item => {
        if ((item.name = val && status)) {
          this.tableHead.forEach(child => {
            if (item.hidden.includes(child.fColumn)) {
              this.$set(child, "fVisible", 1);
            }
          });
        } else {
          this.tableHead.forEach(child => {
            if (item.hidden.includes(child.fColumn)) {
              this.$set(child, "fVisible", 0);
            }
          });
        }
      });
    },
    //获取入库单号
    async getOrderNoData() {
      let res = await getOrderNo(this.tableName);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        for (const key in this.ruleForm) {
          if (key.indexOf("fOrderNo") != -1) {
            this.ruleForm[key] = res.Data;
          }
        }
      }
    }
  },

  created() {
    this.ruleForm = defaultForm(this.tableHead);
    console.log(this.tableHead,"22")
    this.ruleForm.fStockNum = 0;
    this.ruleForm.fStockAmount = 0;
    this.rules = creatRules(this.tableHead);
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
  },
  mounted() {
    setTimeout(() => {
      this.getOrderNoData();
    }, 100);
  }
};
</script>
<style lang="scss" scoped></style>
