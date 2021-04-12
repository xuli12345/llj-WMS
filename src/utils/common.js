// import { chunk } from "./index.js";
import { checkDecimal } from "@/utils/validate";
/**
 *  动态表单验证规则
 *
 */
export function creatRules(data) {
  //  console.log(data)
  let rules = {};
  data.forEach((item, index) => {
    let rulesArr = [];
    if (item.fNotNull === 1) {
      switch (item.fDataType) {
        case "string":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            },
            { type: "string", message: "请输入字符串", trigger: "blur" },
            {
              max: item.fLength,
              message: "长度不能大于" + item.fLength,
              trigger: "blur"
            }
          ];
          rules[item.fColumn] = rulesArr;
          break;
        case "bit":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            }
          ];
          rules[item.fColumn] = rulesArr;
          // case "datetime":
          //   rulesArr = [
          //     {
          //       required: true,
          //       message: item.fColumnDes + "不能为空",
          //       trigger: "blur"
          //     },
          //     {  message: "请输入时间" }
          //   ];
          //   rules[item.fColumn] = rulesArr;
          break;
        case "int":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            },
            { type: "number", message: "请输入数字" }
          ];
          rules[item.fColumn] = rulesArr;
          break;
        case "decimal":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            },
            { validator: checkDecimal, message: "请输入数字" }
          ];
          rules[item.fColumn] = rulesArr;
          break;
      }
    } else if (item.fNotNull == 0) {
      switch (item.fDataType) {
        case "string":
          rulesArr = [
            { type: "string", message: "请输入字符串", trigger: "blur" },
            {
              max: item.fLength,
              message: "长度不能大于" + item.fLength,
              trigger: "blur"
            }
          ];
          break;
          // case "int":
          //   rulesArr = [
          //     { type: "number", message: "请输入数字", trigger: "blur" }
          //   ];
          //   rules[item.fColumn] = rulesArr;
          break;
        case "decimal":
          rulesArr = [{ validator: checkDecimal, message: "请输入数字" }];
          rules[item.fColumn] = rulesArr;
          break;
      }
    }
  });
  return rules;
}

/**
 *
 *   设置表单默认值
 *
 */
export function defaultForm(tableHead) {
  var obj = {};
  let userInfo = JSON.parse(sessionStorage.getItem("user"));
  tableHead.forEach(element => {
    if (element.fDataType == "datetime") {
      if (element.fColumn == "fCreateDate" || element.fColumn == "fLogintime") {
        obj[element.fColumn] = new Date();
      } else {
        obj[element.fColumn] = null;
      }
    } else if (
      //库位管理中要控制的字段
      (element.fDataType == "bit" && element.fColumn == "fIsPutOnArea") ||
      element.fColumn == "fIsAllocationArea" ||
      element.fColumn == "fIsWorkingArea"
    ) {
      obj[element.fColumn] = false;
    } else if (element.fDataType == "bit") {
      obj[element.fColumn] = true;
    } else if (element.fColumn == "fCountry") {
      obj[element.fColumn] = "中国";
    } else if (element.fColumn == "fCreaterCode") {
      obj[element.fColumn] = userInfo.usercode;
    } else if (element.fNeedSave == 1 && element.fColumn == "fCreater") {
      obj[element.fColumn] = userInfo.userId;
    } else if (element.fNeedSave == 1 && element.fColumn == "fModifier") {
      obj[element.fColumn] = userInfo.userId;
    } else if (element.fNeedSave == 1 && element.fVisible == 0) {
      obj[element.fColumn] = 0;
    } else if (element.fNeedSave == 1 && element.fDataType == "string") {
      obj[element.fColumn] = "";
    } else {
    }
  });

  return obj;
}

/**
 *  增删改查传递的参数
 *
 */

export function addParams(tableHead, rowData) {
  let arr = [];
  let columns = tableHead.map((item, index) => {
    return {
      ColumnName: item.fColumn,
      ColumnType: item.fDataType
    };
  });
  columns.forEach(element => {
    for (const key in rowData) {
      if (element.ColumnName == key) {
        let obj = {
          Key: element.ColumnName,
          Value: rowData[key]
        };
        arr.push(obj);
      }
    }
  });

  return {
    arr,
    columns
  };
}
/**
 *  增删改查批量删除的参数
 *
 */
export function batchDelete(tableHead, batchList) {
  // let tableHeadLength = tableHead.length;
  let arr = [];
  let columns = tableHead.map((item, index) => {
    return {
      ColumnName: item.fColumn,
      ColumnType: item.fDataType
    };
  });
  batchList.forEach(item => {
    let OneArr = [];
    columns.forEach(element => {
      for (const key in item) {
        let obj = {};
        if (element.ColumnName == key) {
          obj = {
            Key: element.ColumnName,
            Value: item[key]
          };
          OneArr.push(obj);
        }
      }
    });
    arr.push(OneArr);
  });
  return {
    arr,
    columns
  };
}


//判断用户是否有权限，将按钮是否禁用
export function userLimit(strVal) {
  let url = window.location.hash.substring(2);
  // console.log(url,'路径')
  let urlMenu = JSON.parse(sessionStorage.getItem("dynamicMenuRoutes"));

  let limitMeta = {};
  urlMenu.forEach(ele => {
    if (ele.path == url) {
      limitMeta = ele.meta;
    }
  });
  let userLimit = JSON.parse(sessionStorage.getItem("userLimit"));
  let disabled = true;

  if (userLimit.length > 0) {
    // disabled = userLimit.some(element => {
    //   return  element.fModID == limitMeta.menuId && element[strVal] == 0;
    // });
    userLimit.forEach(element => {
      if (element.fModID == limitMeta.menuId && element[strVal] == 1) {
        disabled = false;
      }
    });
  }
  return disabled;
  // return false
}

//处理数据是修改的，还是新增的，还是删除的
//传入的参数  （原来的数据，现在的数据）
//返回一个数组，[修改，新增，删除]
export function handelData(BackData, NowData) {
  let that = this;
  let Back = JSON.parse(JSON.stringify(BackData));
  let Now = JSON.parse(JSON.stringify(NowData));
  let update = [],
    insert = [],
    deleted = [],
    common = [];

  //获取原来的和现在的公有数据fMstID
  //公有数据就是修改的数据
  Back.forEach(item => {
    Now.forEach(child => {
      if (item.fID == child.fID) {
        common.push(child);
      }
    });
  });
  //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
  common.forEach(item1 => {
    // console.log(item1);
    Now.forEach((item2, idx2) => {
      if (item1.fID == item2.fID) {
        Now.splice(idx2, 1);
      }
    });
  });
  //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
  common.forEach(child1 => {
    Back.forEach((child2, idx2) => {
      if (child1.fID == child2.fID) {
        Back.splice(idx2, 1);
      }
    });
  });
  if (common.length < 1) {
    common = null;
  }
  if (Now.length < 1) {
    Now = null;
  }
  if (Back.length < 1) {
    Back = null;
  }
  return [common, Now, Back];
}

//根据fsort进行排序
export function compare(obj1, obj2) {
  let val1 = obj1.fSort;
  let val2 = obj2.fSort;
  // console.log(val1,val2)
  if (val1 < val2) {
    return -1;
  } else if (val1 > val2) {
    return 1;
  } else {
    return 0;
  }
}

export function handleRFIDData(BackData, NowData) {
  let that = this;
  let Back = JSON.parse(JSON.stringify(BackData));
  let Now = JSON.parse(JSON.stringify(NowData));
  let update = [],
    insert = [],
    deleted = [],
    common = [];

  //获取原来的和现在的公有数据fMstID
  //公有数据就是修改的数据
  Back.forEach(item => {
    Now.forEach(child => {
      if (item.fTagCode == child.fTagCode) {
        common.push(child);
      }
    });
  });
  //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
  common.forEach(item1 => {
    // console.log(item1);
    Now.forEach((item2, idx2) => {
      if (item1.fTagCode == item2.fTagCode) {
        Now.splice(idx2, 1);
      }
    });
  });
  //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
  common.forEach(child1 => {
    Back.forEach((child2, idx2) => {
      if (child1.fTagCode == child2.fTagCode) {
        Back.splice(idx2, 1);
      }
    });
  });
  if (common.length < 1) {
    common = null;
  }
  if (Now.length < 1) {
    Now = null;
  }
  if (Back.length < 1) {
    Back = null;
  }
  return [common, Now, Back];
}
//线路管理 增删改查的方法
export function handleVehData(BackData, NowData) {
  let that = this;
  let Back = JSON.parse(JSON.stringify(BackData));
  let Now = JSON.parse(JSON.stringify(NowData));
  let update = [],
    insert = [],
    deleted = [],
    common = [];

  //获取原来的和现在的公有数据fMstID
  //公有数据就是修改的数据
  Back.forEach(item => {
    Now.forEach(child => {
      if (item.fHrID == child.fHrID) {
        common.push(child);
      }
    });
  });
  //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
  common.forEach(item1 => {
    // console.log(item1);
    Now.forEach((item2, idx2) => {
      if (item1.fHrID == item2.fHrID) {
        Now.splice(idx2, 1);
      }
    });
  });
  //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
  common.forEach(child1 => {
    Back.forEach((child2, idx2) => {
      if (child1.fHrID == child2.fHrID) {
        Back.splice(idx2, 1);
      }
    });
  });
  if (common.length < 1) {
    common = null;
  }
  if (Now.length < 1) {
    Now = null;
  }
  if (Back.length < 1) {
    Back = null;
  }
  return [common, Now, Back];
}
//排车目录 增删改查的方法
export function handleLineListData(BackData, NowData) {
  let that = this;
  let Back = JSON.parse(JSON.stringify(BackData));
  let Now = JSON.parse(JSON.stringify(NowData));
  let update = [],
    insert = [],
    deleted = [],
    common = [];

  //获取原来的和现在的公有数据fMstID
  //公有数据就是修改的数据
  Back.forEach(item => {
    Now.forEach(child => {
      if (item.fItemID == child.fItemID) {
        common.push(child);
      }
    });
  });
  //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
  common.forEach(item1 => {
    // console.log(item1);
    Now.forEach((item2, idx2) => {
      if (item1.fItemID == item2.fItemID) {
        Now.splice(idx2, 1);
      }
    });
  });
  //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
  common.forEach(child1 => {
    Back.forEach((child2, idx2) => {
      if (child1.fItemID == child2.fItemID) {
        Back.splice(idx2, 1);
      }
    });
  });
  if (common.length < 1) {
    common = null;
  }
  if (Now.length < 1) {
    Now = null;
  }
  if (Back.length < 1) {
    Back = null;
  }
  return [common, Now, Back];
}
//排车目录主表 增删改查的方法
export function handleLineShopID(BackData, NowData) {
  let that = this;
  let Back = JSON.parse(JSON.stringify(BackData));
  let Now = JSON.parse(JSON.stringify(NowData));
  let update = [],
    insert = [],
    deleted = [],
    common = [];

  //获取原来的和现在的公有数据fMstID
  //公有数据就是修改的数据
  Back.forEach(item => {
    Now.forEach(child => {
      if (item.fShopID == child.fShopID) {
        common.push(child);
      }
    });
  });
  //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
  common.forEach(item1 => {
    // console.log(item1);
    Now.forEach((item2, idx2) => {
      if (item1.fShopID == item2.fShopID) {
        Now.splice(idx2, 1);
      }
    });
  });
  //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
  common.forEach(child1 => {
    Back.forEach((child2, idx2) => {
      if (child1.fShopID == child2.fShopID) {
        Back.splice(idx2, 1);
      }
    });
  });
  if (common.length < 1) {
    common = null;
  }
  if (Now.length < 1) {
    Now = null;
  }
  if (Back.length < 1) {
    Back = null;
  }
  return [common, Now, Back];
}
//排车目录主表 增删改查的方法
export function handleLineCarID(BackData, NowData) {
  let that = this;
  let Back = JSON.parse(JSON.stringify(BackData));
  let Now = JSON.parse(JSON.stringify(NowData));
  let update = [],
    insert = [],
    deleted = [],
    common = [];

  //获取原来的和现在的公有数据fMstID
  //公有数据就是修改的数据
  Back.forEach(item => {
    Now.forEach(child => {
      if (item.fCarID == child.fCarID) {
        common.push(child);
      }
    });
  });
  //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
  common.forEach(item1 => {
    // console.log(item1);
    Now.forEach((item2, idx2) => {
      if (item1.fCarID == item2.fCarID) {
        Now.splice(idx2, 1);
      }
    });
  });
  //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
  common.forEach(child1 => {
    Back.forEach((child2, idx2) => {
      if (child1.fCarID == child2.fCarID) {
        Back.splice(idx2, 1);
      }
    });
  });
  if (common.length < 1) {
    common = null;
  }
  if (Now.length < 1) {
    Now = null;
  }
  if (Back.length < 1) {
    Back = null;
  }
  return [common, Now, Back];
}
//配货作业货品信息  增删改查的方法
export function handleProductfOrderNo(BackData, NowData) {
  let that = this;
  let Back = JSON.parse(JSON.stringify(BackData));
  let Now = JSON.parse(JSON.stringify(NowData));
  let update = [],
    insert = [],
    deleted = [],
    common = [];

  //获取原来的和现在的公有数据fMstID
  //公有数据就是修改的数据
  Back.forEach(item => {
    Now.forEach(child => {
      if (item.fOrderNo == child.fOrderNo) {
        common.push(child);
      }
    });
  });
  //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
  common.forEach(item1 => {
    // console.log(item1);
    Now.forEach((item2, idx2) => {
      if (item1.fOrderNo == item2.fOrderNo) {
        Now.splice(idx2, 1);
      }
    });
  });
  //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
  common.forEach(child1 => {
    Back.forEach((child2, idx2) => {
      if (child1.fOrderNo == child2.fOrderNo) {
        Back.splice(idx2, 1);
      }
    });
  });
  if (common.length < 1) {
    common = null;
  }
  if (Now.length < 1) {
    Now = null;
  }
  if (Back.length < 1) {
    Back = null;
  }
  return [common, Now, Back];
}