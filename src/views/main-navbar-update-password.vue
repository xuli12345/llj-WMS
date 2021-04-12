<template>
  <el-dialog title="修改密码" :visible.sync="visible" :append-to-body="true">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item label="账号">
        <span>{{ dataForm.username }}</span>
      </el-form-item>
      <el-form-item label="原密码" prop="password" :inline-message="true">
        <el-input type="password" v-model="dataForm.password"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword" class="new-password">
        <el-col :span="12">
          <el-input
            type="password"
            v-model="dataForm.newPassword"
            @focus="passwordFocus"
            show-password
          ></el-input>
        </el-col>
        <el-col :span="11" :offset="1">
          <el-rate
            v-model="value"
            disabled
            text-color="#ff9900"
            score-template="{value}"
            :low-threshold="2"
            :high-threshold="5"
            :colors="colors"
            :texts="['过弱','弱','中','较强','强']"
            show-text
            v-show="isInput"
          ></el-rate>
        </el-col>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input type="password" v-model="dataForm.confirmPassword"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="visible = false">
        <i class="iconfont icon-quxiao"></i>取消
      </el-button>
      <el-button size="mini" type="primary" @click="dataFormSubmit()">
        <i class="iconfont icon-baocun"></i>确定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { clearLoginInfo } from "@/utils";
import {
  PASSOWRD_REG_WEEK,
  PASSOWRD_REG_MIDDLE,
  PASSOWRD_REG_POWER
} from "@/utils/validate";
import {
  addformSaveData,
  getTableBodyData,
  getTableHeadData,
  collectionData
} from "@/api/index";
import md5 from "js-md5";
export default {
  data() {
    var validateConfirmPassword = (rule, value, callback) => {
      if (this.dataForm.newPassword !== value) {
        callback(new Error("确认密码与新密码不一致"));
      } else {
        callback();
      }
    };
    var validateOriginPassword = (rule, value, callback) => {
      if (this.originPassword !== md5(value)) {
        callback(new Error("原密码不正确"));
      } else {
        callback();
      }
    };
    var validateNewPassword = (rule, value, callback) => {
      let level = this.checkStrong(value);
      if (level == 0) {
        this.value = 1;
        callback(new Error("密码位数为6位 ~ 16位"));
      } else if (level == 1) {
        this.value = 2;
        callback(new Error("密码强度弱"));
      } else if (level == 2) {
        this.value = 3;
        callback(new Error("密码强度中"));
      } else if (level == 3) {
        this.value = 4;
        callback();
      } else if (level == 4) {
        this.value = 5;
        callback();
      }
    };
    return {
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      tableHeadData: [],
      userObj: {},
      visible: false,
      dataForm: {
        username: "",
        password: "",
        newPassword: "",
        confirmPassword: ""
      },
      colors: {
        1: "#ef0d25",
        2: "#ef0d25",
        3: "#ff8344",
        4: "#ff8344",
        5: "#07c160"
      },
      originPassword: "",
      dataRule: {
        password: [
          { required: true, message: "原密码不能为空", trigger: "blur" },
          { validator: validateOriginPassword, trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { validator: validateNewPassword, trigger: "change" }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { validator: validateConfirmPassword, trigger: "blur" }
        ]
      },
      // 密码强度
      value: 1,
      isInput: false
    };
  },

  methods: {
    passwordFocus() {
      this.isInput = true;
    },
    // 初始化
    init() {
      this.visible = true;
      this.getTableHeadData();
      this.getUserMsg();
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate(async valid => {
        this.$set(this.userObj, "fPassWord", md5(this.dataForm.newPassword));
        if (valid) {
          let res = await collectionData([
            {
              headData: this.tableHeadData,
              updateData: [this.userObj],
              TableName: "t_User_Mst"
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("修改成功!");
            this.visible = false;
          } else {
            this.$message.error(res.Message);
          }
        }
      });
    },
    //获取表头信息
    async getTableHeadData() {
      let res = await getTableHeadData("t_user_mst");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHeadData = res.lstRet;
        console.log(this.tableHeadData, "表头的字段");
      }
    },
    async getUserMsg() {
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.dataForm.username = userInfo.username;
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fUserCode",
          Value: userInfo.usercode
        }
      ];

      let res = await getTableBodyData("v_user_mst", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(userInfo.userDes)));
      // console.log(res);
      if (res.State) {
        let result = JSON.parse(res.Data);
        console.log(result);
        this.userObj = result[0];
        // this.dataForm.password = result[0].fPassWord;
        this.originPassword = result[0].fPassWord;
      }
    },
    checkStrong(sValue) {
      var modes = 0;
      let num = 0;
      if (sValue.length < 6 || sValue.length > 16) {
        return modes;
      }
      if (/\d/.test(sValue)) {
        modes++; //数字
        num++;
      }
      if (/[a-z]/.test(sValue)) {
        modes++; //小写
      }
      if (/[A-Z]/.test(sValue)) {
        modes++; //大写
      }
      if (/\W/.test(sValue)) {
        modes++; //特殊字符
      }
      switch (modes) {
        case 1:
          return 1;
          break;
        case 2:
          return 2;
          break;
        case 3:
          return 3;
          break;
        case 4:
          return 4;
          break;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/ .el-dialog {
  width: 40%;
}
.el-form-item {
  width: 50%;
  margin-bottom: 22px !important;
}
.el-form-item.new-password {
  width: 89%;
}
.el-rate {
  line-height: 2.2;
}
</style>
