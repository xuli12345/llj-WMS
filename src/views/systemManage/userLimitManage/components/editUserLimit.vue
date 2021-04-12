<template>
  <div>
    <div class="btns">
      <el-button
        size="mini"
        class="iconfont icon-baocun"
        type="primary"
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
      label-position="right"
      label-width="125px"
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

    <!-- 子表格数据    -->
    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-tab-pane label="权限公司" name="first">
        <el-table
          :header-cell-style="{ background: '#eef1f6' }"
          :data="secondtableData"
          class="table-wrapper"
          ref="secondTable"
          :max-height="tableHeight"
          border
           v-fit-columns
          :row-key="getSecondRowKeys"
          style="width: 60%;"
          @selection-change="handleSceondChange"
        >
          <template>
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column
              type="index"
              label="序号"
              width="50"
            ></el-table-column>
            <template v-for="(item, index) in itemSceondTableHead">
              <el-table-column
                v-if="item.fVisible == 1 ? true : false"
                :key="index"
                :label="item.fColumnDes"
                :prop="item.fColumn"
                sortable
                min-width="120px"
              ></el-table-column>
            </template>
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="权限组" name="second">
        <!-- 子表格数据  -->
        <el-table
          class="table-wrapper"
          ref="singleTable"
          :max-height="tableHeight"
          :data="tableData"
          :row-key="getRowKeys"
          border
           v-fit-columns
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <template>
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column
              type="index"
              label="序号"
              width="50"
            ></el-table-column>
            <template v-for="(item, index) in itemTableHead">
              <el-table-column
                v-if="item.fVisible == 1 ? true : false"
                :key="index"
                :label="item.fColumnDes"
                :prop="item.fColumn"
                sortable
                min-width="120px"
              >
                <template slot-scope="scope">
                  <input
                    type="checkbox"
                    @change="changeA(scope.row, item.fColumn)"
                    v-if="item.fDataType == 'bit'"
                    :checked="scope.row[item.fColumn] == 0 ? false : true"
                    :disabled="item.fReadOnly == 0 ? false : true"
                  />
                  <el-select
                    v-else-if="item.fColumn == 'fDataType'"
                    v-model="scope.row[item.fColumn]"
                    placeholder="请选择"
                    :disabled="item.fReadOnly == 0 ? false : true"
                  >
                    <el-option
                      v-for="optionItem in selectOptions"
                      :key="optionItem.value"
                      :label="optionItem.label"
                      :value="optionItem.value"
                    ></el-option>
                  </el-select>
                  <el-input
                    v-else-if="item.fColumn === 'fSort'"
                    v-model="scope.row[item.fColumn]"
                    @change="ruleContent(scope.row[item.fColumn])"
                    :disabled="item.fReadOnly == 0 ? false : true"
                  ></el-input>

                  <el-input
                    v-else
                    v-model="scope.row[item.fColumn]"
                    :maxlength="scope.row[item.fLength]"
                  ></el-input>
                </template>
              </el-table-column>
            </template>
          </template>
        </el-table>
        <!-- 分页 -->
        <div class="page flex-justify-end">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[10, 50, 100, 400]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
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
            <EditItemTable
              :fTableView="fComTableView"
              :isAuthority="true"
              v-model="menuId"
              :isHandleMenu.sync="isHandleMenu"
              :isSave.sync="AuthorityTableHeadData"
              :selBatchList.sync="AuthorityTableData"
              :fID="fID"
              :UserLimit="true"
              :backData.sync="SurfaceBackData"
            ></EditItemTable>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { creatRules, defaultForm, compare } from "@/utils/common";
import {
  getItemMenus,
  getTableBodyData,
  getTableHeadData,
  collectionData
} from "@/api/index";
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
      tableHeight: document.body.clientHeight,
      radio: "",
      active: -1,

      //表单数据
      ruleForm: {},
      rules: {},
      activeName: "first",
      activeNameItem: "后台管理",
      menuList: [],
      //获取权限表id
      menuId: "",
      fComTableView: '["t_UserLimit_Mod"]',
      getRowKeys(row) {
        return row.fModName || row.fID;
      },

      getSecondRowKeys(row) {
        return row.fCompanyID;
      },
      //权限表
      secondtableData: [],
      itemSceondTableHead: [],
      selSceondData: [],
      //权限表修改的数据
      editTableData: [],
      //权限组fTableViewData
      LimitTableView: "",
      limitIndex: 1,
      TableView: "",
      //权限公司fTableViewData
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      //权限公司字表数据
      tableData: [],
      itemTableHead: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      selectOptions: [
        { label: "字符串", value: "string" },
        { label: "整数", value: "int" },
        { label: "小数", value: "decimal" },
        { label: "布尔值", value: "bit" },
        { label: "数组", value: "bytes" },
        { label: "日期与时间", value: "datetime" }
      ],
      menuId: "",
      //是否点击了菜单
      isHandleMenu: false,
      //权限表数据
      AuthorityTableHeadData: [],
      AuthorityTableData: [],
      fID: "",
      //权限公司原始数据
      CompanyBackData: [],
      //权限组原始数据
      GroupBackData: [],
      //权限表原始数据
      SurfaceBackData: [],
      UserArr: []
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        //如果原来的没有就是新增的
        //如果×掉原来的就是新增
        //如果x掉原来的，再勾选上，不动
        function editCompanyData(BackArr, NowArr) {
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
        }
        //第一个删除的数据，第二个插入的数据
        let CompanyData = editCompanyData(
          this.CompanyBackData,
          this.selSceondData
        );
        function editGroupData(BackArr, NowArr) {
          let deleteArr = JSON.parse(JSON.stringify(BackArr));
          let insertArr = JSON.parse(JSON.stringify(NowArr));
          let commonArr = [];
          NowArr.forEach(item => {
            BackArr.forEach(child => {
              if (item.fID === child.fGroupID) {
                commonArr.push(item);
              }
            });
          });
          commonArr.forEach(item1 => {
            insertArr.forEach((itemB, idxB) => {
              if (item1.fID === itemB.fID) {
                insertArr.splice(idxB, 1);
              }
            });
            deleteArr.forEach((itemA, idxA) => {
              if (item1.fID === itemA.fGroupID) {
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
        }
        let GroupData = editGroupData(this.GroupBackData, this.editTableData);
        function editSurfaceData(BackArr, NowArr) {
          let updateArr = [];
          let insertArr = [];
          BackArr.forEach(item => {
            NowArr.forEach(child => {
              if (item.fLimitID == 0 && item.fModName == child.fModName) {
                insertArr.push(child);
              }
              if (
                item.fLimitID != null &&
                item.fLimitID != 0 &&
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
        }
        this.AuthorityTableHeadData.forEach(element => {
          if (element.fColumn == "fGroupID") {
            this.$set(element, "fColumn", "fLimitID");
          }
        });
        this.AuthorityTableData.forEach(ele => {
          delete ele.fGroupID;
        });
        let SurfaceData = editSurfaceData(
          this.SurfaceBackData,
          this.AuthorityTableData
        );
        if (SurfaceData[1] != null) {
          SurfaceData[1].forEach(ele => {
            ele.fLimitID = this.fID;
          });
        }
        let saveParams = [
          {
            TableName: this.tableName,
            headData: this.tableHead,
            updateData: [this.ruleForm]
          },
          {
            TableName: "t_UserLimit_Company",
            headData: this.itemSceondTableHead,
            deleteData: CompanyData[0],
            insertData: CompanyData[1]
          },
          {
            TableName: "t_UserLimit_Group",
            headData: this.itemTableHead,
            deleteData: GroupData[0],
            insertData: GroupData[1]
          },
          {
            TableName: "t_UserLimit_Mod",
            updateData: SurfaceData[0],
            insertData: SurfaceData[1],
            headData: this.AuthorityTableHeadData
          }
        ];
        if (valid) {
          let res = await collectionData(saveParams);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          console.log(res);
          if (res.State) {
            this.$message.success("修改成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
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

    //权限公司checkbox选中的数据
    handleSceondChange(val) {
      this.selSceondData = val;
    },
    // 权限组CheckBox选中的数据
    handleSelectionChange(val) {
      this.editTableData = val;
    },
    //点击权限组，获取权限组内容
    handleClick(activeName) {
      if (activeName == "second") {
        if (this.limitIndex == 1) {
          this.TableView = this.LimitTableView;
          this.getSearchItemData();
          this.limitIndex = -1;
        }
      }
      //点击权限表
      if (activeName == "third") {
        this.getMenuList();
      }
    },

    changeA(item, val) {
      this.editTableData.push(item);
      this.editTableData = Array.from(new Set(this.editTableData));
      if (item[val] == 0) {
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        this.$set(item, val, 0);
      }
    },
    //获取权限组的表头数据
    async getTableHeadData() {
      let res = await getTableHeadData("t_UserLimit_Group");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res, "权限组表头数据");
      if (res.State) {
        this.itemTableHead = res.lstRet.sort(compare);
        this.LimitTableView = res.fTableViewData;
        this.total = this.itemTableHead.length;
        this.getGroupLimitData();
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取权限组表格内容
    async getGroupLimitData() {
      let res = await getTableBodyData(
        "v_UserGroup_Mst",
        [],
        this.pageNum,
        this.pageSize
      );

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        // console.log(this.tableData);
        this.getSearchItemData();
        this.tableData.forEach(element => {
          for (const key in element) {
            if (key == "fID") {
              this.$set(element, "fGroupID", element.fID);
              this.$set(element, "fLimitID", this.ruleForm.fID);
            } else if (element[key] == null) {
              element[key] = 0;
            }
          }
        });
      }
      this.total = res.TTLPage;
    },
    //获取权限公司表头数据
    async getSecondTableHead() {
      let res = await getTableHeadData("t_UserLimit_Company");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      // console.log(res, "公司表头数据");
      if (res.State) {
        this.itemSceondTableHead = res.lstRet.sort(compare);
        this.total = this.itemSceondTableHead.length;
        this.TableView = res.fTableViewData;
        this.getSearchItemData();
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取权限公司表格内容
    async getModData() {
      let res = await getTableBodyData("v_Company_Mst");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let resultData = JSON.parse(res.Data);
        this.secondtableData = resultData.map((item, index) => {
          return {
            fLimitID: this.ruleForm.fID,
            fCompanyID: item.fID, //公司ID
            fCompanyCode: item.fCompanyCode,
            fCompanyName: item.fCompanyName
          };
        });
        // console.log(this.secondtableData, "公司");
        this.total = this.secondtableData.length;
      }
    },
    //获取该用户对应的权限公司和权限组
    async getSearchItemData() {
      let searchWhereObj = [
        {
          Computer: "=",
          DataFile: "fLimitID",
          Value: this.ruleForm.fID
        }
      ];

      let res = await getTableBodyData(this.TableView, searchWhereObj);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let resultData = JSON.parse(res.Data);
        resultData.forEach(item => {
          // console.log(this.tableData);
          //权限组回选
          if (this.tableData.length > 0) {
            this.tableData.forEach(ele => {
              if (ele.fGroupID == item.fGroupID) {
                this.$refs.singleTable.toggleRowSelection(ele);
                this.GroupBackData = resultData;
              }
            });
          }
          //权限公司回选
          if (this.secondtableData.length > 0) {
            this.secondtableData.forEach(elemt => {
              // console.log(elemt,item,"权限公司")
              if (elemt.fCompanyID == item.fCompanyID) {
                this.$refs.secondTable.toggleRowSelection(elemt);
                this.CompanyBackData = resultData;
              }
            });
          }
        });
      }
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
      this.getGroupLimitData();
    },
    // 当前页nge
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getGroupLimitData();
    },
    // //获取菜单
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
    clickMenus(item) {
      this.menuId = item.MenuID;
      this.isHandleMenu = true;
    },
    clickTabs(tab, event) {
      this.menuId = tab.$attrs.MenuID;
      this.isHandleMenu = true;
    },
    changeColor(index) {
      this.active = index;
    }
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal));
      this.getSearchItemData();
    }
  },
  created() {
    this.getModData();
    this.getTableHeadData();
    this.getSecondTableHead();
    this.ruleForm = defaultForm(this.tableHead);
    this.rules = creatRules(this.tableHead);
    this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
  },
  async mounted() {
    this.fID = this.ruleForm.fID;
    let res = await getTableBodyData("t_User_Mst");
    res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
    if (res.State) {
      this.UserArr = JSON.parse(res.Data);
    }
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
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
