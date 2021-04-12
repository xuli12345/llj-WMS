<template>
  <div>
    <div class="btns">
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
    <!-- form表格 -->
    <EditHeadForm
      :tableHead="tableHead"
      :rowData="rowData"
      ref="formBox"
    ></EditHeadForm>
    <!-- 子表格数据    -->
    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-tab-pane label="权限公司" name="first">
        <EditItemTable
          :fTableView="fTableView"
          :isCompany="true"
          :isSave.sync="companyTableHeadData"
          :selBatchList.sync="companyTableData"
          :searchWhere="searchWhereObj"
          :backData.sync="backData"
        ></EditItemTable>
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
            <EditItemTable
              :fTableView="fComTableView"
              :isAuthority="true"
              v-model="menuId"
              :searchWhere="searchWhereObj"
              :isHandleMenu.sync="isHandleMenu"
              :isHandleTabs.sync="isHandleTabs"
              :isSave.sync="AuthorityTableHeadData"
              :selBatchList.sync="AuthorityTableData"
              :fID="fID"
              :backData.sync="queryBackData"
            ></EditItemTable>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { getItemMenus, collectionData } from "@/api/index";
import EditItemTable from "@/views/systemManage/components/EditItemTable";
import EditHeadForm from "@/components/EditHeadForm";
export default {
  components: {
    EditItemTable,
    EditHeadForm
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
    rowData: {
      type: Object,
      default: () => {}
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
      //是否点击了tabs到权限表菜单
      isHandleTabs: false,
      //保存时获取权限公司数据
      companyTableHeadData: [],
      companyTableData: [],
      //回显的值
      backData: [],
      //权限表数据
      AuthorityTableHeadData: [],
      AuthorityTableData: [],
      queryBackData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      //查询数据的条件
      searchWhereObj: [],
      //fID数据
      fID: ""
    };
  },
  methods: {
    //计算权限公司新增和删除的数据
    editCompanyData(BackArr, NowArr) {
      let deleteArr = JSON.parse(JSON.stringify(BackArr));
      let insertArr = JSON.parse(JSON.stringify(NowArr));
      let commonArr = [];
      NowArr.forEach(item => {
        BackArr.forEach(child => {
          if (item.fCompanyID === child.fCompanyID) {
            commonArr.push(item);
          }
        });
      });
      commonArr.forEach(item1 => {
        insertArr.forEach((itemB, idxB) => {
          if (item1.fCompanyID === itemB.fCompanyID) {
            insertArr.splice(idxB, 1);
          }
        });
        deleteArr.forEach((itemA, idxA) => {
          if (item1.fCompanyID === itemA.fCompanyID) {
            deleteArr.splice(idxA, 1);
          }
        });
      });
      if (deleteArr.length < 1) {
        deleteArr = null;
      }
      if (insertArr.length < 1) {
        insertArr = null;
      }
      return [deleteArr, insertArr];
    },
    //计算权限表修改和新增的数据
    editSurfaceData(BackArr, NowArr) {
      let updateArr = [];
      let insertArr = [];
      BackArr.forEach(item => {
        NowArr.forEach(child => {
          if (item.fGroupID == 0 && item.fModName == child.fModName) {
            insertArr.push(child);
          }
          if (
            item.fGroupID != null &&
            item.fGroupID != 0 &&
            item.fModName == child.fModName
          ) {
            updateArr.push(child);
          }
        });
      });
      if (updateArr.length < 1) {
        updateArr = null;
      }
      if (insertArr.length < 1) {
        insertArr = null;
      }
      return [updateArr, insertArr];
    },
    submitForm(formName) {
      //ruleForm的值
      let ruleFormData = this.$refs.formBox.ruleForm;
      this.$refs.formBox.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let modBackData = this.queryBackData;
          //权限公司
          let companyData = this.editCompanyData(
            this.backData,
            this.companyTableData
          );
          if (companyData[1] != null) {
            companyData[1].forEach(ele => {
              ele.fGroupID = this.fID;
            });
          }
          let GroupArr = this.editSurfaceData(
            this.queryBackData,
            this.AuthorityTableData
          );
          let saveParams = [];
          if (GroupArr[1] != null) {
            GroupArr[1].forEach(ele => {
              ele.fGroupID = this.fID;
            });
          }
          ruleFormData.fModifyDate = new Date();
          if (this.AuthorityTableData.length == 0) {
            saveParams = [
              {
                TableName: this.tableName,
                updateData: [ruleFormData],
                headData: this.tableHead
              },
              {
                TableName: "t_UserGroupLimit_Company",
                insertData: companyData[1],
                deleteData: companyData[0],
                headData: this.companyTableHeadData
              }
            ];
          } else {
            console.log(this.companyTableHeadData,"权限公司表头1")
           
            saveParams = [
              {
                TableName: this.tableName,
                updateData: [ruleFormData],
                headData: this.tableHead
              },
              {
                TableName: "t_UserGroupLimit_Company",
                insertData: companyData[1],
                deleteData: companyData[0],
                headData: this.companyTableHeadData
              },
              {
                TableName: "t_GroupLimit_Mod",
                updateData: GroupArr[0],
                insertData: GroupArr[1],
                headData: this.AuthorityTableHeadData
              }
            ];
          }
          // //权限表
          let res = await collectionData(saveParams);
          //主表
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
          if (res.State) {
            this.$message.success("修改成功!");
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

    handleClick(activeName) {
      if (activeName == "second") {
        this.isHandleTabs = true;
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
    }
  },

  mounted() {
    this.fID = this.$refs.formBox.ruleForm.fID;
    let obj = [
      {
        Computer: "=",
        DataFile: "fGroupID",
        Value: this.fID
      }
    ];
    this.searchWhereObj = obj;
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
