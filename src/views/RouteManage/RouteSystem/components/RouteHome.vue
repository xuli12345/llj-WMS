<template>
  <div>
    <div class="page">
      <div class="flex-wrap buttons">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-xinzeng"
          @click="handleAdd"
          :disabled="userLimit('fAdd')"
          >新增线路体系</el-button
        >

        <el-button
          type="primary"
          size="small"
          @click="handleEdit"
          class="el-icon-edit"
          :disabled="userLimit('fEdit')"
          >修改线路体系</el-button
        >
        <el-button
          type="primary"
          size="small"
          @click.stop="handleDelete"
          class="iconfont icon-shanchu"
          :disabled="userLimit('fDel')"
          >删除线路体系</el-button
        >

        <el-button
          type="primary"
          size="small"
          class="iconfont icon-renwufenpei"
          @click="handleDis"
          >分派车辆</el-button
        >
        <el-button
          type="primary"
          class="iconfont icon-baocun"
          @click="saveSort"
          size="mini"
          >排序保存</el-button
        >
      </div>
      <div class="title">
        运输线路体系:
        <el-select
          v-model="routeValue"
          @change="ValChange"
          placeholder="请选择"
        >
          <el-option
            v-for="optionItem in selectOpts"
            :key="optionItem.fID"
            :label="optionItem.fSystemName"
            :value="optionItem.fID"
          ></el-option>
        </el-select>
      </div>
    </div>
    <!-- dailog -->
    <el-dialog title="新增线路" :visible.sync="dialogFormVisible">
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="fTableView"
        :selectArr="selectArr"
        :isSaveSuccess="isSaveSuccess"
      ></CreatFrom>
    </el-dialog>
    <el-dialog title="修改线路" :visible.sync="editFormVisible">
      <editCreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="fTableView"
        :selectArr="selectArr"
        :rowData="rowData"
        :isSaveSuccess="isSaveSuccess"
      ></editCreatFrom>
    </el-dialog>
    <!-- 分派车辆 -->
  </div>
</template>

<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { userLimit, compare } from "@/utils/common";
import {
  collectionData,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
import CreatFrom from "./CreatFrom";
import editCreatFrom from "./editCreatFrom";
export default {
  props: ["fTableView", "selectArr"],
  components: {
    CreatFrom,
    editCreatFrom
  },
  data() {
    return {
      tableHeadData: [],
      selectOpts: [],
      //当前行数据
      rowData: {},
      isSaveSuccess: false,
      dialogFormVisible: false,
      editFormVisible: false,
      routeValue: this.$store.state.common.changeValue,
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  watch: {
    async isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.selectOpts = await this.getMstData();
      }
    }
  },
  methods: {
    saveSort(){
      this.$emit("saveSort")
    },
    ValChange() {
      this.$emit("input", this.routeValue);
      this.$store.commit("common/updateRouteValue", this.routeValue);
    },
    //新增线路体系
    handleAdd() {
      this.dialogFormVisible = true;
      this.isSaveSuccess = false;
    },
    //关闭新增弹窗
    async closeBox(value) {
      if (value) {
        this.isSaveSuccess = true;
      }
      this.dialogFormVisible = false;
      this.editFormVisible = false;
    },
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    //分派车辆
    handleDis() {
      this.$emit("openVehicle");
    },
    //修改线路体系
    async handleEdit() {
      if (!this.routeValue) {
        this.$message.warning("请选择线路体系!");
        return;
      } else {
        let searchWhere = [
          {
            Computer: "=",
            DataFile: "fID",
            Value: this.routeValue
          }
        ];
        let result = await this.getMstData(searchWhere);
        this.rowData = result[0];
        this.isSaveSuccess = false;
        //修改的弹窗
        this.editFormVisible = true;
      }
    },
    //删除线路体系
    handleDelete() {
      if (!this.routeValue) {
        this.$message.warning("请选择运输线路!");
        return;
      } else {
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            let searchWhere = [
              {
                Computer: "=",
                DataFile: "fID",
                Value: this.routeValue
              }
            ];
            let result = await this.getMstData(searchWhere);
            this.rowData = result[0];
            // console.log(this.rowData, "row");
            if (this.rowData) {
              let res = await collectionData([
                {
                  TableName: this.fTableView,
                  headData: this.tableHeadData,
                  deleteData: [this.rowData]
                }
              ]);
              res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
              if (res.State) {
                this.$message.success("删除成功!");
                this.selectOpts = await this.getMstData();
                this.routeValue = "";
              } else {
                this.$message.error(res.Message);
              }
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },

    //获取线路体系表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "表头");
      } else {
        this.$message.error(res.Message);
      }
    },

    //获取回显的数据
    async getMstData(searchWhere = []) {
      let res = await getTableBodyData("v_Route_System_Mst", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        // console.log(result, "主体数据");
        return result;
      }
    }
  },
  async created() {
    this.getTableHeadData();
    this.selectOpts = await this.getMstData();
    // console.log(this.selectOpts, "234");
  }
};
</script>

<style lang="scss" scoped>
.title {
  white-space: nowrap;
  margin-right: 20px;
  width: 250px;
  margin-top: 10px;
}
.buttons {
  margin: 0px;
}
</style>
