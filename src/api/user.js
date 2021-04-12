//引入axios网络请求库
import http from "@/http/http";
/**
 *
 *   封装获取用户登录
 *
 */

function login(obj) {
  console.log(JSON.stringify(obj));
  return http({
    url: "http://116.63.148.241:8001/token/userLogin",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

export { login};
