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
    <HeadForm
      :tableHead="tableHead"
      ref="formBox"
      :isUserLimit="true"
      :UserArr="UserArr"
    ></HeadForm>
    <!-- 子表格数据    -->
    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-tab-pane label="权限公司" name="first">
        <ItemTable
          :fTableView="fCompanyViewData"
          :isCompany="true"
          :isSave.sync="itemSceondTableHead"
          :selBatchList.sync="companyData"
        ></ItemTable>
      </el-tab-pane>
      <el-tab-pane label="权限组" name="second">
        <ItemTable
          :fTableView="fModViewData"
          :isSave.sync="itemTableHead"
          :isAuthorityGroup="true"
          :selBatchList.sync="groupData"
        ></ItemTable>
      </el-tab-pane>
      <el-tab-pane label="权限表" name="third">
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
import { getItemMenus, getTableBodyData, collectionData } from "@/api/index";
import HeadForm from "@/components/HeadForm";
import ItemTable from "@/components/ItemTable";
export default {
  components: {
    HeadForm,
    ItemTable
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
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      activeName: "first",
      activeNameItem: "后台管理",
      menuList: [],
      //获取权限表id
      menuId: "",
      getRowKeys(row) {
        return row.fModName || row.fID;
      },

      getSecondRowKeys(row) {
        return row.fCompanyID;
      },
      //权限表
      secondtableData: [],
      itemSceondTableHead: [],
      companyData: [],
      fComTableView: '["t_UserLimit_Mod"]',
      AuthorityTableData: [],
      AuthorityTableHeadData: [],
      //权限表修改的数据
      groupData: [],
      //权限组fTableViewData
      fModViewData: '["t_UserLimit_Group"]',
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      //权限公司字表数据
      tableData: [],
      itemTableHead: [],
      //权限公司fTableViewData
      fCompanyViewData: '["t_UserLimit_Company"]',
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      fGroupID: 0,
      selectOptions: [
        { label: "字符串", value: "string" },
        { label: "整数", value: "int" },
        { label: "小数", value: "decimal" },
        { label: "布尔值", value: "bit" },
        { label: "数组", value: "bytes" },
        { label: "日期与时间", value: "datetime" }
      ],
      isHandleMenu: false,
      UserArr: []
    };
  },
  methods: {
    submitForm(formName) {
      let ruleFormData = this.$refs.formBox.ruleForm;
      this.$refs.formBox.$refs.ruleForm.validate(async valid => {
        if (valid) {
          this.AuthorityTableHeadData.forEach(element => {
            if (element.fColumn == "fGroupID") {
              this.$set(element, "fColumn", "fLimitID");
            }
          });
          this.AuthorityTableData.forEach(ele => {
            delete ele.fGroupID;
            ele.fLimitID = 0;
          });
          let res = await collectionData([
            {
              TableName: this.tableName,
              insertData: [ruleFormData],
              headData: this.tableHead,
              IdentityColumn: "fID"
            },
            {
              TableName: "t_UserLimit_Company",
              insertData: this.companyData,
              headData: this.itemSceondTableHead,
              IdentityColumn: "fLimitID"
            },
            {
              TableName: "t_UserLimit_Group",
              IdentityColumn: "fLimitID",
              insertData: this.groupData,
              headData: this.itemTableHead
            },
            {
              TableName: "t_UserLimit_Mod",
              IdentityColumn: "fLimitID",
              insertData: this.AuthorityTableData,
              headData: this.AuthorityTableHeadData
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
   console.log(res,"xu")
          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
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
    //权限公司checkbox选中的数据
    handleSceondChange(val) {
      this.companyData = val;
    },
    handleSelectionChange(val) {
      this.groupData.push(...val);
      this.groupData = Array.from(new Set(this.groupData));
    },
    //current的tabs
    handleClick(activeName) {
      if (activeName == "third") {
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
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.menuList = res.Menuurl.Child;
      }
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页nge
    handleCurrentChange(val) {
      this.pageNum = val;
    }
  },
  async mounted() {
    let res = await getTableBodyData("t_User_Mst");
    res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
    if (res.State) {
      this.UserArr = JSON.parse(res.Data);
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
