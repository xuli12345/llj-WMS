

import http from "@/http/http";
import { encryptDesCbc } from "@/utils/cryptoJs.js";


/**
 * 供应商经销对账数据
 * @param account 用户登录账号
 * @param contract 合同号
 */
export function getCntContractHTData(account, contract) {
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify([account, contract]))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify([account, contract]), String(userDes))
    };
    return http({
        url: '/getCntContractHTData',
        method: 'POST',
        data: obj
    })
}

/**
 * 获取合同号
 * @param account 用户登录账号
 */
export function getCntContractHTCode(account) {
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify([account]))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify([account]), String(userDes))
    };

    return http({
        url: '/getCntContractHTCode',
        method: 'POST',
        data: obj
    })
}

// 保存经销对账数据接口：saveCntContractHTData
// 参数格式：fCreater 用户代号  fHeTong 合同号
// fSupplyDate             -- 供应商提交日期
// fSupplyer                 -- 供应商提交账号
// fCaiwuDate             -- 财务确定日期
// fCaiwuer                 -- 财务确定账号
// fShangchuanDate -- 财务上传海信系统日期
// fShangchuaner      -- 财务上传账号
// fWFSTOTAL            -- 不含税金额
// fHFSTOTAL            -- 含税金额
// fSupplyCode         -- 供应商
// fQty  -- 结单金额（经销的是含税金额，代销的是fQty哪个字段的数量）
// {
//        "InsertData":[{"fYWBILLNO":"0000821","fState":1,"fHeTong":"","fCreater":""}],
//        "UpdateData":[{"fYWBILLNO":"0000821","fState":1,"fHeTong":"","fCreater":""}],
//        "DeleteData":[{"fYWBILLNO":"0000821","fState":1,"fHeTong":"","fCreater":""}],
// }
export function saveCntContractHTData(InsertData = null, UpdateData = null, DeleteData = null) {
    let objData = {
        "InsertData": InsertData,
        "UpdateData": UpdateData,
        "DeleteData": DeleteData,
    }
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify(objData))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify(objData), String(userDes))
    };
    return http({
        url: '/saveCntContractHTData',
        method: 'POST',
        data: obj
    })
}

// 供应商提前月结模块

// 获取数据接口：getSupply_tq_zxyt
// 参数：{"ParameterDes":""}

// 保存数据接口：saveSupply_tq_zxyt
// 参数：{
//               "InsertData":[{"fSupCode":"","fSupName":"","fHtCode":""}],
//               "DeleteData":[{"fSupCode":"","fSupName":"","fHtCode":""}]
//          }
export function getSupply_tq_zxyt() {
    let obj = {
        "ParameterDes": ""
    };
    return http({
        url: '/getSupply_tq_zxyt',
        method: 'POST',
        data: obj
    })
}
export function saveSupply_tq_zxyt(InsertData = null, DeleteData = null) {
    let objData = {
        "InsertData": InsertData,
        "DeleteData": DeleteData,
    }
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify(objData))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify(objData), String(userDes))
    };
    return http({
        url: '/saveSupply_tq_zxyt',
        method: 'POST',
        data: obj
    })
}

/**
 * 供应商代销对账数据接口
 * @param account 供应商代号
 * @param contract  合同号
 */
export function get_Daixiaoduizhang_zxyt(account, contract) {
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify([account, contract]))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify([account, contract]), String(userDes))
    };

    return http({
        url: '/get_Daixiaoduizhang_zxyt',
        method: 'POST',
        data: obj
    })
}
/**
 * send_DaixiaoDataTohaixin_zxyt 代销数据更新到海信接口
*参数：["0013520201"]
*传入合同号
 */
export function send_DaixiaoDataTohaixin_zxyt(account) {
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify([account]))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify([account]), String(userDes))
    };

    return http({
        url: '/send_DaixiaoDataTohaixin_zxyt',
        method: 'POST',
        data: obj
    })
}
/**
 * send_DaixiaoDataTohaixin_zxyt 代销数据更新到海信接口
*参数：["0013520201"]
*传入合同号
 */
export function clear_DaixiaoDataTohaixin_zxyt(account) {
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify([account]))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify([account]), String(userDes))
    };

    return http({
        url: '/clear_DaixiaoDataTohaixin_zxyt',
        method: 'POST',
        data: obj
    })
}
/**
 change_JinxiaoView_zxyt 视图切换接口
参数：[1]
参数1 切换回原来视图 参数2切换到知行视图 
 */
export function change_JinxiaoView_zxyt(account) {
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify([account]))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify([account]), String(userDes))
    };

    return http({
        url: '/change_JinxiaoView_zxyt',
        method: 'POST',
        data: obj
    })
}
/**
 历史记录查询
参数：{"fHetong":"合同","fDate":"上传日期"}
 */
export function getCntContractHTData_History(account,date=null) {
    let userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
    console.log(JSON.stringify({fHetong: account, datetime: date}))
    let obj = {
        ParameterDes: encryptDesCbc(JSON.stringify({"fHetong": account, "datetime": date}), String(userDes))
    };

    return http({
        url: '/getCntContractHTData_History',
        method: 'POST',
        data: obj
    })
}