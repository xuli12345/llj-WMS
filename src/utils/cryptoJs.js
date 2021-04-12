import cryptoJs from "crypto-js";
let a = sessionStorage.getItem("user") || "{}";
let desCode = JSON.parse(a).userDes || "123456";

let encryKey = decryptDesCbc(desCode, "d#s87@28se45&i(p");

// 加密
function encryptDesCbc(message, keyStr) {
  var key = cryptoJs.enc.Utf8.parse(keyStr);
  var iv = cryptoJs.enc.Utf8.parse(keyStr);
  let option = {
    iv,
    mode: cryptoJs.mode.CBC,
    padding: cryptoJs.pad.Pkcs7
  };
  let encrypted = cryptoJs.AES.encrypt(message, key, option);
  return encrypted.toString();
}
//AES解密，cbc模式
function decryptDesCbc(message, encryKey) {
  var keyHex = cryptoJs.enc.Utf8.parse(encryKey);
  var ivHex = cryptoJs.enc.Utf8.parse(encryKey);
  var decrypted = cryptoJs.AES.decrypt(message, keyHex, {
    iv: ivHex,
    mode: cryptoJs.mode.CBC,
    padding: cryptoJs.pad.Pkcs7
  });
  return decrypted.toString(cryptoJs.enc.Utf8);
}
export {
  encryptDesCbc, //AES加密，CBC模式
  decryptDesCbc //AES解密，CBC模式
};
