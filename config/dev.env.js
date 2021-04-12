"use strict";
const merge = require("webpack-merge");
const prodEnv = require("./prod.env");

module.exports = {
  NODE_ENV: '"development"',
  ENV_CONFIG: "'dev'",
  BASE_API: "'http://36.133.192.67:8003/api/'" 
  //BASE_API: "'http://8.129.208.95:8012/api/'"  //测试
};
