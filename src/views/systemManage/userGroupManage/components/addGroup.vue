<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        size="mini"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
        >取消</el-button
      >
    </div>
    <!-- form表格 -->
    <HeadForm :tableHead="tableHead" ref="formBox"></HeadForm>
    <!-- 子表格数据    -->
    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-tab-pane label="权限公司" name="first">
        <ItemTable
          :fTableView="fTableView"
          :isCompany="true"
          :isSave.sync="companyTableHeadData"
          :selBatchList.sync="companyTableData"
        ></ItemTable>
      </el-tab-pane>
      <el-tab-pane label="权限表" name="second">
        <el-row>
          <el-col :span="4">
            <el-tabs
              tab-position="left"
              v-model="activeNameItem"
              @tab-click="clickTabs"
            >
              <template v-for="(item, index) in this.menuList">
                <el-tab-pane
                  :label="item.MenuName"
                  :name="item.MenuName"
                  :key="index"
                  :MenuID="item.MenuID"
                >
                  <span slot="label">
                    <i class="el-icon-folder"></i>
                    {{ item.MenuName }}
                  </span>
                  <template v-if="item.Child && item.Child.length > 0">
                    <div
                      style="cursor: pointer;"
                      v-for="(child, idx) in item.Child"
                      :key="idx"
                      @click="clickMenus(child)"
                    >
                      <i class="el-icon-setting"></i>
                      <span
                        @click="changeColor(idx)"
                        slot="title"
                        :class="active == idx ? 'addClass' : ''"
                        >{{ child.MenuName }}</span
                      >
                    </div>
                  </template>
                </el-tab-pane>
              </template>
            </el-tabs>
          </el-col>
          <el-col :span="20">
            <!-- 子表格数据  -->
            <ItemTable
              :fTableView="fComTableView"
              :isAuthority="true"
              v-model="menuId"
              :isHandleMenu.sync="isHandleMenu"
              :isSave.sync="AuthorityTableHeadData"
              :selBatchList.sync="AuthorityTableData"
            ></ItemTable>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { getItemMenus, collectionData } from "@/api/index";
import ItemTable from "@/components/ItemTable";
import HeadForm from "@/components/HeadForm";
export default {
  components: {
    ItemTable,
    HeadForm
  },
  props: {
    tableHead: {
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
      active: -1,
      activeName: "first",
      activeNameItem: "后台管理",
      menuList: [],
      //获取权限表id
      menuId: "",
      fTableView: '["t_UserGroupLimit_Company"]',
      fComTableView: '["t_GroupLimit_Mod"]',
      //是否点击了菜单
      isHandleMenu: false,
      //保存时获取权限公司数据
      companyTableHeadData: [],
      companyTableData: [],
      //权限表数据
      AuthorityTableHeadData: [],
      AuthorityTableData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },

  methods: {
    submitForm(formName) {
      //ruleForm的值
      let ruleFormData = this.$refs.formBox.ruleForm;
      this.$refs.formBox.$refs.ruleForm.validate(async valid => {
        if (valid) {
          // //权限表
          let res = await collectionData(
            //insert新建，update修改，delete删除
            [
              //主表
              {
                TableName: this.tableName,
                IdentityColumn: "fID",
                insertData: [ruleFormData],
                headData: this.tableHead
              },
              {
                TableName: "t_UserGroupLimit_Company",
                IdentityColumn: "fGroupID",
                insertData: this.companyTableData,
                headData: this.companyTableHeadData
              },
              {
                TableName: "t_GroupLimit_Mod",
                IdentityColumn: "fGroupID",
                insertData: this.AuthorityTableData,
                headData: this.AuthorityTableHeadData
              }
            ]
          );
          res = JSON.parse(
            decryptDesCbc(res, String(this.userDes))
          );
          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.State);
            this.$refs.formBox.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs.formBox.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },

    //tabs
    handleClick(activeName) {
      if (activeName == "second") {
        this.getMenuList();
      }
    },
    changeColor(index) {
      this.active = index;
    },
    clickMenus(item) {
      this.menuId = item.MenuID;
      this.isHandleMenu = true;
    },
    clickTabs(tab, event) {
      this.menuId = tab.$attrs.MenuID;
      this.isHandleMenu = true;
    },
    //获取菜单
    async getMenuList() {
      let res = await getItemMenus([
        ["1"],
        { userDes: this.userDes, userId: this.userId }
      ]);
      //  console.log(res);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
     
      if (res.State) {
        this.menuList = res.Menuurl.Child;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.item-munus {
  height: 30px;
  cursor: pointer;
}

.addClass {
  color: #409eff;
}
.el-col-4 {
  width: 14.66667%;
}
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
</style>
