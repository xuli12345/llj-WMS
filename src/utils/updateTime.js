import moment from "moment";


export function timeCycle(val) {
  return  moment(new Date(val)).format("YYYY-MM-DD HH:mm:ss");
}

export function updateTime(val) {
  return  moment(val).format("YYYY-MM-DD");
}
export function updateTime1(val) {
  return  moment(val).format("YYYYMMDD");
}