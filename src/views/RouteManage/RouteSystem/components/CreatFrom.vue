<template>
  <div>
    <el-form
      label-position="rigth"
      label-width="145px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="ruleForm"
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
              :disabled="item.fReadOnly == 0 ? false : true"
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
          <el-select
            v-else-if="isUserLimit && item.fColumn == 'fUserName'"
            v-model="ruleForm[item.fColumn]"
            placeholder="请选择用户"
            @change="GetUserId"
          >
            <el-option
              v-for="item in UserArr"
              :key="item.fID"
              :label="item.fUserName"
              :value="item.fID"
            ></el-option>
          </el-select>
          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-checkbox
            @change="disColumn(item.fColumn, ruleForm[item.fColumn], item)"
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
    <div class="page flex-justify-end">
      <el-button class="iconfont icon-quxiao" @click="resetForm('ruleForm')"
        >取 消</el-button
      >
      <el-button
        class="iconfont icon-baocun"
        type="primary"
        @click="submitForm('ruleForm')"
        >确 定</el-button
      >
    </div>
  </div>
</template>
<script>
import { creatRules, defaultForm } from "@/utils/common";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { getTableBodyData, collectionData } from "@/api/index";
export default {
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    isUserLimit: {
      type: Boolean,
      default: () => false
    },
    UserArr: {
      type: Array,
      default: () => []
    },

    disabledfColumn: {
      type: Array,
      default: () => []
    },
    //需要做下拉框的数据
    selectArr: {
      type: Array,
      default: () => []
    },
    tableName: {
      type: String,
      default: () => ""
    }
  },
  data() {
    return {
      //表单数据
      ruleForm: {},
      rules: {},
      //需要下拉选择的所有数据
      selectAllData: [],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  mounted() {
    this.ruleForm = defaultForm(this.tableHead);
    this.rules = creatRules(this.tableHead);
    // console.log(this.rules, this.tableHead);
  },
  created() {
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.tableName,
              headData: this.tableHead,
              insertData: [this.ruleForm]
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        //   console.log(res, "rs");
          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.State);
            this.ruleForm={};
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
      this.ruleForm={};
      this.$emit("closeBox");
    },
    GetUserId(data) {
      this.ruleForm.fUserID = data;
      this.UserArr.forEach(element => {
        if (element.fID == data) {
          this.ruleForm.fUserCode = element.fUserCode;
        }
      });
    },
    disColumn(val, status, headItem) {
      for (let i = 0; i < this.disabledfColumn.length; i++) {
        if (this.disabledfColumn[i].name == val && status) {
          this.tableHead.forEach(child => {
            if (this.disabledfColumn[i].disColumn.includes(child.fColumn)) {
              this.$set(child, "fReadOnly", 1);
              this.disabledfColumn[i].disColumn.forEach(element => {
                this.$set(this.ruleForm, element, 0);
              });
            }
          });
          break;
        } else {
          this.tableHead.forEach(child => {
            if (this.disabledfColumn[i].disColumn.includes(child.fColumn)) {
              this.$set(child, "fReadOnly", 0);
            }
          });
        }
      }
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
    }
  },
  watch: {
    ruleForm: function(val) {
      this.ruleForm.fID = 0;
    }
  }
};
</script>
<style lang="scss" scoped>
.ruleForm {
  display: flex;
  flex-wrap: wrap;
}
/deep/.el-dialog__body {
  padding: 0 !important;
}

.ruleForm .el-form-item {
  width: 50%;
}
</style>
