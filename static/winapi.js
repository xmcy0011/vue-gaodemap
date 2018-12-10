// Chrome49一下，使用es6语法，必须声明
// 否则，客户端将无法调用相关js函数
"use strict";

// Chrome49一下，使用es6语法，必须声明
// 否则，客户端将无法调用相关js函数
"use strict";

var userList = [];

/**
 * 添加一个需要在地图上显示的用户
 * @param {[userName]} 用户名
 * @param {[displayName]} 在地图上显示的文字
 */
function mapAdd(userName, displayName) {
  let list = userList;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].getUserName() === userName) {
      return;
    }
  }
  let userInfo = new UserInfo(userName, displayName);
  list.push(userInfo);
}

/**
 * 清楚所有显示的用户
 * @return void
 */
function mapClear() {
  if (userList !== undefined) {
    userList = [];
  }
  window.vm.$store.state.live.needClearMarker = true;
  console.log(window.vm.$store.state.live.needClearMarker);
}

/**
 * 构造Location对象的实例
 */
function Location() {
  this.lng = 0; // 经度
  this.lat = 0; // 纬度

  this.direct = null; // 方向
  this.speed = null; // 速度
  this.time = null; // 定时的时间

  this.locationType = null; // 获取当前定位结果来源，如网络定位结果，详见定位类型表 https://lbs.amap.com/api/android-location-sdk/guide/utilities/location-type
  this.gpsAccuracyStatus = null; // GPS的当前状态
  this.trustedLevel = null; // 定位结果的可信度
  this.accuracy = null; // 精度信息，单位:米
  this.address = null; // 地址

  this.getLocationType = function () {
    return this.locationType;
  };
  this.setLocationType = function (value) {
    this.locationType = value;
  };

  this.getGpsAccuracyStatus = function () {
    return this.gpsAccuracyStatus;
  };
  this.setGpsAccuracyStatus = function (value) {
    this.gpsAccuracyStatus = value;
  };

  this.getTrustedLevel = function () {
    return this.trustedLevel;
  };
  this.setTrustedLevel = function (value) {
    this.trustedLevel = value;
  };

  this.getAccuracy = function () {
    return this.accuracy;
  };
  this.setAccuracy = function (value) {
    this.accuracy = value;
  };

  this.getAddress = function () {
    return this.address;
  };
  this.setAddress = function (value) {
    this.address = value;
  };

  this.setLng = function (lng) {
    this.lng = lng;
  };
  this.setLat = function (lat) {
    this.lat = lat;
  };

  this.getLng = function () {
    return this.lng;
  };
  this.getLat = function () {
    return this.lat;
  };

  this.getDirect = function () {
    return this.direct;
  };
  this.setDirect = function (value) {
    this.direct = value;
  };

  this.getSpeed = function () {
    return this.speed;
  };
  this.setSpeed = function (value) {
    this.speed = value;
  };

  this.setTime = function (value) {
    this.time = value;
  };
  this.getTime = function () {
    return this.time;
  };
}

/**
 * 构造UserInfo对象的实例
 * @param {[userName]} 用户名
 * @param {[displayName]} 在地图上显示的文字
 */
function UserInfo(userName, displayName) {
  this.userName = userName;
  this.displayName = displayName;

  this.location = new Location(); // 初始化其定位信息
  this.isAddInMap = false; // 是否已加载到地图上
  this.marker = null; // 其对应在地图上显示的覆盖物对象

  this.getDisplayName = function () {
    return this.displayName;
  };
  this.getUserName = function () {
    return this.userName;
  };
  this.getLocation = function () {
    return this.location;
  };

  this.getIsAddInMap = function () {
    return this.isAddInMap;
  };
  this.setIsAddInMap = function (value) {
    this.isAddInMap = value;
  };

  this.getMarker = function () {
    return this.marker;
  };
  this.setMarker = function (value) {
    this.marker = value;
  };
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
function DateFormat(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "h+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    "S": date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  }
  return fmt;
}
