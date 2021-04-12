<template>
  <div>
    <div class="page">
      <div class="time">
        <span style="width:100px">预约日期：</span>
        <el-date-picker
          v-model="value"
          type="date"
          placeholder="选择日期时间"
          @change="change"
        >
        </el-date-picker>
      </div>
      <div class="buttons">
        <el-button type="warning" round>已预约</el-button>
        <!-- <el-button type="primary" round>已预检</el-button> -->
        <el-button round style="background:yellow">收货中</el-button>
        <el-button type="success" round>完成</el-button>
      </div>
      <div class="right" style="position: absolute; right: 30px;">
        <el-button type="primary" round @click="search">刷新</el-button>
      </div>
    </div>
    <div style="width:99%">
      <div class="table-head">
        <table>
          <thead>
            <colgroup>
              <col span="2" style="width: 100px;" />
              <col />
            </colgroup>
            <tr>
              <th v-for="(item, index) in tableHeadData" :key="index">
                {{ item.fColumnDes }}
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="table-body">
        <table>
          <colgroup>
            <col span="2" style="width: 100px;" />
            <col />
          </colgroup>
          <tbody>
            <tr v-for="(item1, idx) in tableData" :key="idx">
              <td class="flex-center-center fTime">
                {{ item1.StartTime }}~{{ item1.EndTime }}
              </td>
              <td
                style="position: relative;"
                v-for="(item, index) in headData"
                :key="index"
                @dblclick="dblclick(item, item1)"
              >
                <div v-for="(item2, i) in BackTableData" :key="i">
                  <div
                    class="content "
                    :style="{
                      background:
                        item2.fStateName == '已预约'
                          ? '#ebb563'
                          : item2.fStateName == '已预检'
                          ? '#65b1ff'
                          : item2.fStateName == '进行中'
                          ? '#ffff00'
                          : item2.fStateName == '已上架'
                          ? '#85ce61'
                          : ''
                    }"
                    @dblclick.stop="dblclick(item, item2)"
                    v-if="
                      item.fColumnDes == item2.fDockName &&
                        isDuringDate(
                          changeTime(item1.StartTime),
                          changeTime(item1.EndTime),
                          item2.fEndTime
                        )
                    "
                  >
                    <p>预约单号:{{ item2.fOrderNo }}</p>
                    <p>供应商:{{ item2.fSupplierName }}</p>
                    <p>定单数:{{ item2.fOrdcnt }}</p>
                    <p>收货件数:{{ item2.fQtystr }}</p>
                    <p>托盘数:{{ item2.fPalletcnt }}</p>
                    <p>预约人:{{ item2.fCreaterCode }}</p>
                    <p>状态:{{ item2.fStateName }}</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- 新增预约 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="isDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="false"
        :selectArr="selectArr"
        :time="value"
        :StartTime="StartTime"
        :EndTime="EndTime"
        :Dock="Dock"
      ></CreatFrom>
    </el-drawer>
    <!-- 修改预约 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      direction="rtl"
      :before-close="handleEditClose"
      v-if="newisDestory"
    >
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="false"
        :selectArr="selectArr"
        :rowData="editForm"
        :batchDelTableName="batchDelTableName"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { compare } from "@/utils/common";
import { updateTime, timeCycle } from "@/utils/updateTime";
import {
  tableBodyData,
  addformSaveData,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
import CreatFrom from "./components/FormTable";
import EditFormTable from "./components/EditFormTable";
export default {
  components: {
    CreatFrom,
    EditFormTable
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      isDestory: false,
      newisDestory: false,
      value: new Date(),
      tableHeadData: [],
      headData: [],
      BackTableData: [],
      editForm: {},
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_RGBookReg_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_RGBookReg_Item", "fMstID"],
      batchDelTableName: [
        {
          Key: "t_RGBookReg_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      selectArr: [
        // {
        //   fName: "fDockName",
        //   fUrl: "v_Dock",
        //   fDes: "fDockName",
        //   fID: "fID",
        //   fAuto: ["fDockID"],
        //   fAutoID: ["fDockID"],
        //   isShowSel: false
        // },
        {
          fName: "fSupplierName",
          fUrl: "v_Supplier",
          fDes: "fSupplierName",
          fID: "fID",
          fAuto: ["fSupplierID", "fItemOrderState"],
          fAutoID: ["fSupplierID", "fItemOrderState"],
          isShowSel: true
        },
        {
          fName: "fStateName",
          fUrl: "v_Type_RGBookRegState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fState"],
          fAutoID: ["fState"],
          isShowSel: false
        }
      ],
      tableData: [
        { StartTime: "00:00", EndTime: "00:30" },
        { StartTime: "00:30", EndTime: "01:00" },
        { StartTime: "01:00", EndTime: "01:30" },
        { StartTime: "01:30", EndTime: "02:00" },
        { StartTime: "02:00", EndTime: "02:30" },
        { StartTime: "02:30", EndTime: "03:00" },
        { StartTime: "03:00", EndTime: "03:30" },
        { StartTime: "03:30", EndTime: "04:00" },
        { StartTime: "04:00", EndTime: "04:30" },
        { StartTime: "04:30", EndTime: "05:00" },
        { StartTime: "05:00", EndTime: "05:30" },
        { StartTime: "05:30", EndTime: "06:00" },
        { StartTime: "06:00", EndTime: "06:30" },
        { StartTime: "06:30", EndTime: "07:00" },
        { StartTime: "07:00", EndTime: "07:30" },
        { StartTime: "07:30", EndTime: "08:00" },
        { StartTime: "08:00", EndTime: "08:30" },
        { StartTime: "08:30", EndTime: "09:00" },
        { StartTime: "09:00", EndTime: "09:30" },
        { StartTime: "09:30", EndTime: "10:00" },
        { StartTime: "10:00", EndTime: "10:30" },
        { StartTime: "10:30", EndTime: "11:00" },
        { StartTime: "11:00", EndTime: "11:30" },
        { StartTime: "11:30", EndTime: "12:00" },
        { StartTime: "12:00", EndTime: "12:30" },
        { StartTime: "12:30", EndTime: "13:00" },
        { StartTime: "13:00", EndTime: "13:30" },
        { StartTime: "13:30", EndTime: "14:00" },
        { StartTime: "14:00", EndTime: "14:30" },
        { StartTime: "14:30", EndTime: "15:00" },
        { StartTime: "15:00", EndTime: "15:30" },
        { StartTime: "15:30", EndTime: "16:00" },
        { StartTime: "16:00", EndTime: "16:30" },
        { StartTime: "16:30", EndTime: "17:00" },
        { StartTime: "17:00", EndTime: "17:30" },
        { StartTime: "17:30", EndTime: "18:00" },
        { StartTime: "18:00", EndTime: "18:30" },
        { StartTime: "18:30", EndTime: "19:00" },
        { StartTime: "19:00", EndTime: "19:30" },
        { StartTime: "19:30", EndTime: "20:00" },
        { StartTime: "20:00", EndTime: "20:30" },
        { StartTime: "20:30", EndTime: "21:00" },
        { StartTime: "21:00", EndTime: "21:30" },
        { StartTime: "21:30", EndTime: "22:00" },
        { StartTime: "22:00", EndTime: "22:30" },
        { StartTime: "22:30", EndTime: "23:00" },
        { StartTime: "23:00", EndTime: "23:30" },
        { StartTime: "23:30", EndTime: "24:00" }
      ],
      StartTime: "",
      EndTime: "",
      Dock: {},
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    //获取表格头部数据
    async getTabelHead(baseSearchVal) {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fDockTypeName",
          Value: baseSearchVal
        },
        {
          Computer: "=",
          DataFile: "fState",
          Value: 1
        }
      ];

      let res = await getTableBodyData("v_Dock", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let data = JSON.parse(res.Data);
        this.tableHeadData = data.map(item => {
          return {
            fID: item.fID,
            fColumnDes: item.fDockName,
            fColumn: "fDockName"
          };
        });

        let obj = {
          fID: 0,
          fColumnDes: "时间/码头",
          fColumn: "fDock"
        };
        this.headData = JSON.parse(JSON.stringify(this.tableHeadData));
        // console.log(this.headData);
        this.tableHeadData.unshift(obj);
      }
    },
    //双击表格弹框
    dblclick(row, item1) {
      // console.log(row, item1, "dblclick");

      this.StartTime = item1.StartTime;
      this.EndTime = item1.EndTime;
      this.Dock = row;
      if ("fSupplierName" in item1) {
        this.$set(item1, "fBookDate", this.value);
        this.editForm = item1;
        //查看预约详情
        this.drawerValue = true;
      } else {
        //新增预约
        this.drawer = true;
      }
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    //关闭修改弹窗
    closeEditBox(val) {
      if (val) {
        // console.log(val)
        this.getBackData();
        // this.isSaveSuccess = true;
      }
      this.drawerValue = false;
    },
    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.getBackData();
      }
      this.drawer = false;
    },
    //时间
    change() {
      this.getBackData();
    },

    //获取回显的数据
    async getBackData() {
      let time = updateTime(this.value);
      // console.log(time, "时间");
      let where = [
        {
          Computer: ">=",
          DataFile: "fBookDate",
          Value: time
        }
      ];
      let res = await getTableBodyData("v_RGBookReg_Mst", where);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let data = JSON.parse(res.Data);
        console.log(data, "回显");
        this.BackTableData = data.map(item => {
          console.log(item);
          return {
            fID: item.fID,
            fOrderNo: item.fOrderNo,
            fSupplierName: item.fSupplierName,
            fOrdcnt: item.fOrdcnt,
            fQtystr: item.fQtystr,
            fTotal: item.fTotal,
            fPalletcnt: item.fPalletcnt,
            fCreaterCode: item.fCreaterCode,
            fStateName: item.fItemOrderState,
            fDockName: item.fDockName,
            fStartTime: item.fStartTime,
            fEndTime: item.fEndTime
          };
        });
      }
      console.log(this.BackTableData, "回显的数据");
    },

    //判断时间范围
    isDuringDate(beginDateStr, endDateStr, curDate) {
      var curDate = new Date(curDate);
      var beginDate = new Date(beginDateStr);
      var endDate = new Date(endDateStr);

      if (curDate > beginDate && curDate <= endDate) {
        return true;
      }
      return false;
    },
    changeTime(val) {
      let strTime = String(this.value);
      strTime = strTime.substring(0, 15);
      let curTime = strTime + " " + val + " " + "GMT+0800 (中国标准时间)";
      return curTime;
    },
    async getHeadVal() {
      let res = await getTableBodyData("v_Type_Dock");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let baseSearchVal;
        let data = JSON.parse(res.Data);
        // console.log(data);
        data.forEach(element => {
          if (element.fTypeName.includes("收货")) {
            baseSearchVal = element.fTypeName;
          }
        });
        this.getTabelHead(baseSearchVal);
        // console.log(baseSearchVal);
      }
    },
    search() {
      this.getBackData();
    }
  },

  created() {
    this.getBackData();
    this.getHeadVal();
  },

  watch: {
    drawer: function(val, old) {
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
    },
    drawerValue: function(val, old) {
      // console.log(val)
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.page {
  display: flex;
  .buttons {
    margin-left: 15px;
  }
}
.time {
  width: 280px;
  display: flex;
  flex-wrap: nowrap;
}
table {
  width: 100%;
}
thead {
  border: 1px solid #b6b1b1;
}
tbody {
  border: 1px solid #b6b1b1;
  border-top: none;
}
tr {
  display: flex;
  width: 100%;
  border-bottom: 1px solid #b6b1b1;

  .fTime {
    font-weight: 700;
  }
  th {
    flex: 1;
    border-right: 1px solid #b6b1b1;
    &:nth-last-child(1) {
      border: none;
    }
  }
  td {
    flex: 1;

    border-right: 1px solid #b6b1b1;
    &:nth-last-child(1) {
      border: none;
    }
  }
  td:hover {
    background: #cbc5c5;
  }
}
.table-head table,
.table-body table {
  width: 100%;
  border-collapse: collapse;
}
.table-head {
  padding-right: 17px;
  background-color: #cdcdcd;
  color: #000;
}
.table-body {
  width: 100%;
  height: 700px;
  overflow-y: auto;
}
// .table-body table tr:nth-child(2n + 1) {
//   background-color: #f2f2f2;
// }
</style>
