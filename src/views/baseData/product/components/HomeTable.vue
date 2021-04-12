<template>
  <div>
    <div class="page flex-wrap">
      <div class="search-title flex-align-center" v-for="(item, index) in searchData" :key="index">
        <p>{{ item.fColumnDes }}:</p>

        <el-checkbox v-if="item.fDataType == 'bit'" v-model="asData[item.fColumn]"></el-checkbox>
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model.trim="asData[item.fColumn]"
          type="date"
          placeholder="选择日期时间"
          min-width="300"
        ></el-date-picker>
        <el-row v-else-if="item.fComputer == 'between'">
          <el-col :span="11">
            <el-input v-model.trim="startData[item.fColumn]" placeholder="请输入范围值"></el-input>
          </el-col>
          <el-col :span="2">——</el-col>
          <el-col :span="11">
            <el-input
              style="margin-left:0px"
              v-model.trim="endData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
        </el-row>
        <el-input v-else v-model.trim="asData[item.fColumn]" :placeholder="`请输入${item.fColumnDes}`"></el-input>
      </div>
      <div style="margin-top:10px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="search"
          :disabled="userLimit('fQurey')"
        >查询</el-button>
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-xinzeng"
          @click="addPopRight"
          :disabled="userLimit('fAdd')"
        >新增</el-button>
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchDelete"
          :disabled="userLimit('fDel')"
        >批量删除</el-button>

        <el-button
          type="primary"
          size="mini"
          icon="el-icon-help"
          @click="handleBarCode"
          >货品条码绑定</el-button
        >

        <el-button
          type="primary"
          size="mini"
          icon="iconfont icon-dayin"
          @click="importPoint"
        >货品条码录入打印</el-button>
        <el-button
          type="primary"
          size="mini"
          icon="iconfont icon-fenlei"
          @click="BatchClassify"
          >批量分类</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-baocun"
          @click="save"
          >排序保存</el-button
        >
        <el-button
          type="primary"
          class="el-icon-bottom"
          @click="downloadTemp"
          size="mini"
          >下载模板</el-button
        >
        <el-upload
          style="margin-left:15px;float:right"
          ref="upload"
          class="upload"
          action
          :on-change="handleChange"
          :on-remove="handleRemove"
          :auto-upload="false"
          :show-file-list="false"
          accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        >
          <el-button
            type="primary"
            class="iconfont icon-excel"
            size="mini"
            :disabled="userLimit('fInport')"
          >导入excel</el-button>
        </el-upload>
      </div>
    </div>

    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      v-fit-columns
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%"
      :row-key="getRowKeys"
      :data="tableData"
      @selection-change="handleSelectionChange"
      @row-dblclick="dblclick"
    >
      <el-table-column type="selection" width="50"> </el-table-column>
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
          :column-key="item.fColumn"
        >
          <template slot-scope="scope">
            <!-- <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 1 ? true : false"
              disabled
            ></el-checkbox> -->
            <div v-if="item.fColumn == 'fState1'">
              {{ scope.row[item.fColumn] == 1 ? "上架" : "下架" }}
            </div>
            <div v-else-if="item.fColumn == 'fIsBatchManage'">
              {{ scope.row[item.fColumn] == 1 ? "是" : "否" }}
            </div>
            <div v-else-if="item.fColumn == 'fIsShelfLife'">
              {{ scope.row[item.fColumn] == 1 ? "是" : "否" }}
            </div>
            <div v-else-if="item.fColumn == 'fState'">
              {{ scope.row[item.fColumn] == 1 ? "正常" : "废弃" }}
            </div>
            <input
              v-else-if="item.fColumn == 'fSort'"
              v-model="scope.row[item.fColumn]"
              type="text"
            />
            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="220">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click.stop="handleDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel')"
            >删除</el-button>

            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row, scope.$index)"
              :disabled="userLimit('fEdit')"
            >修改</el-button>
            <el-button type="text" size="small" @click="ImageUpload(scope.row, scope.$index)">图片上传</el-button>
          </div>
        </template>
      </el-table-column>
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

    <!-- 批量修改货品分类 -->
    <el-dialog title="收货地址" :visible.sync="dialogFormVisible" width="30%">
      <AlertSelect @input="getInputValue"></AlertSelect>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">
          <i class="iconfont icon-quxiao"></i>取 消
        </el-button>
        <el-button size="mini" type="primary" @click="saveCategory">
          <i class="iconfont icon-baocun"></i>保存
        </el-button>
      </div>
    </el-dialog>
    <!-- 上传图片  -->
    <el-dialog
      title="上传图片"
      :visible.sync="dialogVisible"
      @close="closeDialog"
      width="30%"
    >
      <el-upload
        class="avatar-uploader"
        action="#"
        list-type="picture-card"
        :on-success="handleSuccess"
        :before-upload="beforerUpload"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :on-change="onChange"
        :file-list="fileListArray"
        ref="upload"
      >
        <i slot="default" class="el-icon-plus avatar-uploader-icon"></i>
        <div slot="file" slot-scope="{ file }">
          <img class="avatar" :src="file.url" alt ref="uploadImg" />
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
              <i class="el-icon-zoom-in"></i>
            </span>
            <span v-if="!disabled" class="el-upload-list__item-delete" @click="handlerRemove(file)">
              <i class="el-icon-delete"></i>
            </span>
          </span>
        </div>
      </el-upload>
      <el-dialog :visible.sync="fDialogVisible">
        <img width="100%" :src="dialogImageUrl" alt />
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="closeDialog">
          <i class="iconfont icon-quxiao"></i>取 消
        </el-button>
        <el-button size="mini" type="primary" @click="saveImage">
          <i class="iconfont icon-baocun"></i>保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import AlertSelect from "./AlertSelect";
import {
  addformSaveData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  imPortExcel,
  exportData,
  InportImage,
  collectionData
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功
  //   importExcel:excel导出      strType:导入excel类型字段
  props: ["fTableView", "tableName", "isSaveSuccess", "strType", "importExcel"],
  components: {
    AlertSelect
  },
  data() {
    return {
      getRowKeys(row) {
        return row.fID;
      },
      dialogFormVisible: false, //货品分类弹窗
      dialogVisible: false, //图片上传弹窗
      fDialogVisible: false, //图片预览
      searchData: [], //查询的数据
      tableHeadData: [], //表头数据
      searchWhere: [], //搜索条件
      fTableViewData: "", //获取表格内容TableView的值,在获取headData中获取
      BatchList: [], //复选框选中的数据
      tableData: [], //表格数据
      pageNum: 1, // 当前页数
      pageSize: 10, // 每页条数
      total: 0, // 总条数
      asData: {}, //查询的数据
      endData: {}, //查询范围值数据
      startData: {},
      newArr: [],
      fileTemp: null, //excel
      categroyID: "", //货品类型id
      currentRow: {}, //当前行数据
      dialogImageUrl: "", //图片预览路径
      imageFile: null, //图片上传文件
      fileListArray: [],
      disabled: false,
      tableHeight: document.body.clientHeight,
      sqlConn: sessionStorage.getItem("sqlConn"),
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId
    };
  },
  methods: {
    ImageUpload(row, index) {
      this.currentRow = row;
      this.dialogVisible = true;
    },
    handleExceed(files) {
      console.log(files, "files限制");
      this.$message.warning(
        `当前限制选择 1个文件，本次选择了 ${files.length} 个文件`
      );
    },
    closeDialog() {
      this.imageFile = null;
      this.dialogVisible = false;
      this.$refs.upload.clearFiles();
    },
    //上传成功的回调
    handleSuccess(res, file) {
      console.log(res, file, "handleSuccess");
    },
    beforerUpload(file) {
      this.imageFile = file;
      console.log(file, "beforerUpload");
      const isLt2M = file.size / 1024 / 1024 < 1;
      // console.log(isLt2M);
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 1MB!");
      }
      return isLt2M;
    },
    onChange(file) {
      // console.log(file);
      const tempFile = file.raw;
      const type = tempFile.type;
      const size = tempFile.size;
      // 获取旧名字后缀
      let oldName = tempFile.name.split(".");
      const newName = this.currentRow.fID + "." + oldName[1];
      let uploadFile = new File([tempFile], newName, { type, size });
      this.imageFile = uploadFile;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.fDialogVisible = true;
    },
    handlerRemove(file) {
      this.$refs.upload.clearFiles();
      this.importFile = null;
    },
    async saveImage() {
      let res = await InportImage({
        strType: "GoodsImageFile",
        file: this.imageFile
      });
      if (res.state) {
        this.$set(this.currentRow, "fImageFile", this.imageFile.name);
        let result = batchDelete(this.tableHeadData, [this.currentRow]);
        let res = await addformSaveData([
          {
            lstSaveData: [
              {
                TableName: this.tableName,
                IdentityColumn: null,
                InsertRow: null,
                UpdateRow: result.arr,
                DeleteRow: null,
                Columns: result.columns
              }
            ]
          },
          { userDes: this.userDes, userId: this.userId }
        ]);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

        if (res.State) {
          this.$message.success("上传成功!");
          this.dialogVisible = false;
          this.imageFile = null;
        }
      }
    },
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData, "表头1");

        let searchArr = [];
        searchArr = this.tableHeadData.filter(element => {
          return element.fQureyCol == 1;
        });
        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        let arr = [];
        ColumnArr.forEach((element, index) => {
          this.tableHeadData.forEach((item, index) => {
            if (item.fColumn == element) {
              let obj = {
                fColumnDes: item.fColumnDes,
                fColumn: item.fColumn,
                fComputer: item.fComputer,
                fDataType: item.fDataType
              };

              arr.push(obj);
            }
          });
        });
        console.log(arr, "搜索");
        this.searchData = JSON.parse(JSON.stringify(arr));
      } else {
        this.$message.error(res.Message);
      }
    },

    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
      } else if (item[val] == 1) {
        item[val] = 0;
      }
    },

    //查询
    search() {
      this.pageNum=1
      this.getTableData();
    },
    searchCommon() {
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];
            if (result instanceof Date) {
              result = timeCycle(result);
            }
            if (result.constructor == Boolean && result == true) {
              result = 1;
            }
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: result
            };
            this.searchWhere.push(obj);
          }
          // else if(!this.asData[element.fColumn]&&element.fColumn=="fState1"){
          //    let obj = {
          //     Computer: "=",
          //     DataFile: element.fColumn,
          //     Value: 0
          //   };
          //   this.searchWhere.push(obj);
          // }
        });
      }
      let startobj = {};
      let endobj = {};
      let arr = [];
      for (const key in this.startData) {
        for (const Ikey in this.endData) {
          if (Ikey == key) {
            startobj = {
              Computer: ">=",
              DataFile: key,
              Value: this.startData[key]
            };
            endobj = {
              Computer: "<=",
              DataFile: key,
              Value: this.endData[Ikey]
            };

            arr.push(startobj);
            arr.push(endobj);
          }
        }
      }
      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }
    },
    //获取table表格内容数据
    async getTableData() {
      this.searchCommon();
      let res = await getTableBodyData(
        this.fTableViewData,
        this.searchWhere,
        this.pageNum,
        this.pageSize
      );
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        console.log(this.tableData, "表体内容");
      } else {
        this.$message.error(res.Message);
      }
      this.total = res.TTLPage;
    },
    //新增
    addPopRight() {
      this.$emit("openDrawer", this.tableHeadData);
    },
    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },
    //货品条码绑定
    handleBarCode() {
      this.$emit("openBarCode");
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },
    //批量删除
    BatchDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        let result = batchDelete(this.tableHeadData, this.BatchList);
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            let res = await addformSaveData([
              {
                lstSaveData: [
                  {
                    TableName: this.tableName,
                    IdentityColumn: null,
                    InsertRow: null,
                    UpdateRow: null,
                    DeleteRow: result.arr,
                    Columns: result.columns
                  }
                ]
              },
              { userDes: this.userDes, userId: this.userId }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("删除成功!");
              this.getTableData();
            } else {
              this.$message.error(res.errstr);
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

    //修改
    handleEdit(row, index) {
      this.$emit("openEditDrawer", row, this.tableHeadData);
    },
    //删除
    handleDelete(row, index) {
      let currentRow = JSON.parse(JSON.stringify(row));
      let resultData = addParams(this.tableHeadData, row);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let res = await addformSaveData([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: null,
                  InsertRow: null,
                  UpdateRow: null,
                  DeleteRow: [resultData.arr],
                  Columns: resultData.columns
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("删除成功!");
            this.getTableData();
          } else {
            this.$message.error(res.Message);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    getInputValue(val) {
      this.categroyID = val;
    },
    //分类保存
    async saveCategory() {
      this.BatchList.forEach(item => {
        this.$set(item, "fProductType", this.categroyID);
        this.$set(item, "fIsShelfLife", 1);
        this.$set(item, "fIsBatchManage", 1);
        if (item.fState1 == true) {
          this.$set(item, "fState1", 1);
        } else {
          this.$set(item, "fState1", 0);
        }
      });
      let result = batchDelete(this.tableHeadData, this.BatchList);
      let res = await addformSaveData([
        {
          lstSaveData: [
            {
              TableName: this.tableName,
              IdentityColumn: null,
              InsertRow: null,
              UpdateRow: result.arr,
              DeleteRow: null,
              Columns: result.columns
            }
          ]
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res);
      if (res.State) {
        this.$message.success("修改成功!");
        this.dialogFormVisible = false;
        this.getTableData();
      } else {
        this.$message.error(res.Message);
      }
    },
    BatchClassify() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要批量分类的数据!");
      } else {
        this.dialogFormVisible = true;
      }
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData();
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getTableData();
    },
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    // excel导入
    handleChange(file, fileList) {
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        if (
          this.fileTemp.type ==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          this.fileTemp.type == "application/vnd.ms-excel"
        ) {
          this.importFile(this.strType, this.fileTemp);
        } else {
          this.$message({
            type: "warning",
            message: "附件格式错误，请删除后重新上传！"
          });
        }
      } else {
        this.$message({
          type: "warning",
          message: "请上传附件！"
        });
      }
    },

    handleRemove(file, fileList) {
      this.fileTemp = null;
    },
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Goods")) {
        window.location.href = `${tempUrl}/ImportTempModFile/货品导入模板.xlsx`;
      }
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });

      if (res.state) {
        this.$message.success("导入成功!");
        this.getTableData();
      } else {
        this.$message.error(res.message);
      }
    },

    //货品条码录入打印
    importPoint() {
      this.$emit("openDailog");
    },
    async save() {
      this.tableData.forEach(item => {
        if (item.fState1 == true) {
          this.$set(item, "fState1", 1);
        } else {
          this.$set(item, "fState1", 0);
        }
      });
      let tableHeadData = [
        {
          fColumn: "fID",
          fColumnDes: "ID",
          fDataType: "int"
        },
        {
          fColumn: "fSort",
          fColumnDes: "排序",
          fDataType: "string"
        }
      ];
      let res = await collectionData([
        {
          TableName: "t_Product",
          headData: tableHeadData,
          updateData: this.tableData
        }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
 
      if (res.State) {
        this.$message.success("保存成功!");
        this.getTableData();
      } else {
        this.$message.error(res.Message);
      }
    }
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.getTableData();
      }
    }
  },
  created() {
    this.getTableHeadData();
  }
};
</script>
<style lang="scss" scoped>
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
.avatar-uploader {
  text-align: center;
}
/deep/ .avatar-uploader .el-upload {
  border: 1px dashed #777 !important;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
/deep/ .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  line-height: 148px;
  text-align: center;
}
.avatar {
  width: 148px;
  height: 148px;
  display: block;
}
</style>
