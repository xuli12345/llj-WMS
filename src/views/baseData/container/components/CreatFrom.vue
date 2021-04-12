<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存
      </el-button>
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>取消
      </el-button>
      <el-button
        type="primary"
        size="mini"
        @click="entryPrint"
        class="iconfont icon-dayin1"
        >录入打印容器号</el-button
      >
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
          ></el-input>

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
    <!-- dailog -->
    <el-dialog
      title="打印容器号"
      append-to-body
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-input v-model="inputValue" placeholder="请输入内容"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="printCon()"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 打印格式内容 -->
    <div style="width:0;height:0;overflow:hidden">
      <print-container
        v-if="isRender"
        ref="Print"
        id="toPrint"
        :tableData="tableData"
      ></print-container>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  addformSaveData,
  collectionData,
  saveContainerCode,
  getTableBodyData
} from "@/api/index";
import { addParams, creatRules, defaultForm } from "@/utils/common";
import printContainer from "./printContainer";
import PrintJS from "print-js";

export default {
  components: {
    printContainer
  },
  data() {
    return {
      dialogVisible: false,
      dialogFormVisible: false,
      isRender: false,
      tableData: [],
      inputValue: "",
      //表单数据
      ruleForm: {},
      rules: {},
      //需要下拉选择的所有数据
      selectAllData: [],

      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId
    };
  },
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    tableName: {
      type: String,
      default: () => ""
    },
    //需要做下拉框的数据
    selectArr: {
      type: Array,
      default: () => []
    },
    //需要做下拉框的数据
    currentRow: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    // 基础资料生成容器号保存
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // let res = await saveContainerCode([
          //   {
          //     TableName: this.tableName,
          //     headData: this.tableHead,
          //     insertData: [this.ruleForm]
          //   }
          // ]);
          let result = addParams(this.tableHead, this.ruleForm);
          let res = await saveContainerCode([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: null,
                  InsertRow: [result.arr],
                  UpdateRow: null,
                  DeleteRow: null,
                  Columns: result.columns
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          console.log(res, "容器");
          if (res.State) {
            let tableData = JSON.parse(res.Data);
            this.$emit("closeBox", res.State, tableData);
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
      // this.ruleForm={};
      this.$emit("closeBox");
    },

    //手工
    entryPrint() {
      this.dialogVisible = true;
    },
    handleClose(done) {
      this.dialogVisible = false;
    },
    printCon() {
      if (!this.inputValue) {
        this.$message.warning("请输入打印的容器编码!");
      } else {
        this.tableData = [{ fContainerCode: this.inputValue }];
        console.log(this.tableData);
        this.isRender = true;
        setTimeout(() => {
          PrintJS({
            printable: "toPrint",
            type: "html",
            scanStyles: false,
            css: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
          });
        }, 500);
        setTimeout(() => {
          this.isRender = false;
        }, 600);
      }
    },

    // 获取所有需要下拉选择的内容
    async getSelectData() {
      let arr = [];
      for (let i = 0; i < this.selectArr.length; i++) {
        let res = await getTableBodyData(this.selectArr[i].fUrl);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        console.log(res);
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
  created() {
    this.ruleForm = defaultForm(this.tableHead);
    this.rules = creatRules(this.tableHead);
    this.$set(this.ruleForm, "fContainerID", this.currentRow.fID);
    this.$set(this.ruleForm, "fContainerCode", this.currentRow.fContainerCode);
    this.$set(this.ruleForm, "fContainerName", this.currentRow.fContainerName);
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
  }
};
</script>
<style lang="scss" scoped></style>
