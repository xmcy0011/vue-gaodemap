<template>
  <div class="full">
    <MapComponent ref="baseMap"/>
    <el-button class="menu" icon="el-icon-time" type="primary" round>
      <router-link to="/History" style="color:white; text-decoration: none;">历史轨迹</router-link>
    </el-button>
  </div>
</template>

<script>
// @ is an alias to /src
import MapComponent from "../components/Map.vue";

export default {
  name: "home",
  components: {
    MapComponent
  },
  data() {
    return {
      isDestroyed: false,
      isLoaded: false // 第一次加载，自定移动地图中心为第一人所在地
    };
  },
  // ------------------------------------------------------------
  // 状态管理 start
  computed: {
    needClearMarker() {
      return this.$store.state.live.needClearMarker;
    }
  },
  watch: {
    needClearMarker: function () {
      map.clear();
    }
  },
  // 状态管理 end
  // ------------------------------------------------------------
  mounted() {
    // 每5秒更新一次所有人的位置
    setTimeout(this.queryAll, 5 * 1000);
  },
  destroyed() {
    this.isDestroyed = true;
    // 重置状态
    let userList = window.userList;
    if (userList !== undefined) {
      userList.forEach(element => {
        element.setIsAddInMap(false);
      });
    }
  },
  methods: {
    /*
     * 查询实时位置
     */
    queryAll() {
      if (this.isDestroyed) {
        console.log("当前页面已销毁，中断查询实时位置");
        return;
      }

      let baseMap = this.$refs.baseMap;
      let userList = window.userList;
      let hostName = this.$store.state.config.locationServer;
      let _this = this;

      if (userList !== undefined && userList.length > 0) {
        let queryParam = [];
        for (let i = 0; i < userList.length; i++) {
          queryParam.push(userList[i].getUserName());
        }
        let url = "http://" + hostName + "/LiveLocation/query_jsonp";
        $.ajax({
          url: url,
          type: "GET",
          dataType: "jsonp",
          jsonp: "callback",
          data: { device_id_arr: JSON.stringify(queryParam) },
          timeout: 3000,
          success: function (data, textStatus, jqXHR) {
            if (data.location_list.length === 0) {
              return;
            }
            // 显示位置
            for (let i = data.location_list.length - 1; i >= 0; i--) {
              for (let j = userList.length - 1; j >= 0; j--) {
                if (userList[j].getUserName() === data.location_list[i].device_id) {
                  // 火星坐标
                  let lon = parseFloat(data.location_list[i].lng);
                  let lat = parseFloat(data.location_list[i].lat);
                  let gcj02 = [lon, lat];

                  // 不再中国的视为非法经纬度，不显示
                  if (!_this._isInChina(gcj02[0], gcj02[1])) {
                    continue;
                  }

                  // 保存该用户的相关信息
                  let location = userList[j].getLocation();
                  let curLocation = data.location_list[i];
                  _this._saveLocationInfo(location, curLocation);
                  location.setLng(gcj02[0]);
                  location.setLat(gcj02[1]);

                  // 该用户没有加载到地图上，加载进去
                  if (userList[j].getIsAddInMap() === false) {
                    let userInfo = {
                      uid: userList[j].getUserName(), // 唯一标志
                      locationType: location.getLocationType(), // 获取当前定位结果来源
                      locationMode: location.getLocationMode(), // 获取当前定位结果来源
                      gpsAccuracyStatus: location.getGpsAccuracyStatus(), // GPS的当前状态
                      trustedLevel: location.getTrustedLevel(), // 定位结果的可信度
                      accuracy: location.getAccuracy(), // 精度信息，单位:米
                      speed: location.getSpeed(), // 速度
                      direct: location.getDirect(), // 方向
                      status: location.getStatus(), // 定位状态
                      time: location.getTime(), // 定位时间
                      address: location.getAddress() // 地址
                    };

                    let marker = baseMap.add(
                      location.getLng(),
                      location.getLat(),
                      userList[j].getDisplayName(),
                      userInfo
                    );
                    if (marker !== null) {
                      userList[j].setMarker(marker); // 在地图上添加一个覆盖物
                      userList[j].setIsAddInMap(true); // 标识该用户已加载到地图
                    } else {
                      console.error("位置加载到地图失败！");
                    }
                  } else {
                    // 用户已加载到地图，更新覆盖物信息
                    baseMap.update(
                      userList[j].getMarker(),
                      location.getLng(),
                      location.getLat(),
                      location
                    );
                  }
                }
              }
            }

            if (!_this.isLoaded) {
              for (let i = 0; i < userList.length; i++) {
                let item = userList[i].getLocation();
                if (_this._isInChina(item.getLng(), item.getLat())) {
                  _this.isLoaded = true;
                  baseMap.panTo(item.getLng(), item.getLat());
                  break;
                }
              }
            }
          },
          error: function (xhr, textStatus) {
            console.log("查询实时位置错误！" + textStatus);
          },
          complete: function () { }
        });
      } else {
        baseMap.clear();
      }

      // 实时更新位置（页面销毁后，停止更新）
      if (!this.isDestroyed) {
        setTimeout(this.queryAll, 5 * 1000);
      }
    },
    _saveLocationInfo(location, curLocation) {
      location.setTime(curLocation.time !== "" ? curLocation.time.substring(0, 19) : "未知");
      location.setSpeed(curLocation.speed !== "" ? curLocation.speed : "未知");
      location.setDirect(curLocation.direct !== "" ? curLocation.direct : "未知");
      location.setAddress(curLocation.poi_name !== "" ? curLocation.poi_name : "未知");
      location.setAccuracy(curLocation.accuracy !== "" ? curLocation.accuracy : "未知");

      // 定位结果
      if (curLocation.code !== "") {
        if (parseInt(curLocation.code) === 0) {
          location.setStatus("成功");
        } else {
          location.setStatus("失败：" + curLocation.msg);
        }
      }

      // GPS信号
      if (curLocation.gps_accuracy_status !== "") {
        switch (parseInt(curLocation.gps_accuracy_status)) {
          case 0:
            location.setGpsAccuracyStatus("卫星信号弱");
            break;
          case 1:
            location.setGpsAccuracyStatus("卫星信号强");
            break;
          case 2:
            location.setGpsAccuracyStatus("卫星状态未知");
            break;
          default:
            location.setGpsAccuracyStatus("卫星状态未知");
            break;
        }
      }

      // 定位模式
      if (curLocation.loc_mode !== "") {
        switch (parseInt(curLocation.loc_mode)) {
          case 0:
            location.setLocationMode("低功耗定位");
            break;
          case 1:
            location.setLocationMode("仅用设备定位");
            break;
          case 2:
            location.setLocationMode("高精度定位");
            break;
          default:
            location.setLocationMode("未知");
            break;
        }
      }

      // 定位结果来源
      if (curLocation.loc_type !== "") {
        switch (parseInt(curLocation.loc_type)) {
          case 1:
            location.setLocationType("GPS定位");
            break;
          case 2:
            location.setLocationType("前次定位");
            break;
          case 4:
            location.setLocationType("缓存定位");
            break;
          case 5:
            location.setLocationType("Wifi定位");
            break;
          case 6:
            location.setLocationType("基站定位");
            break;
          case 8:
            location.setLocationType("离线定位");
            break;
          default:
            location.setLocationType("未知");
            break;
        }
      }

      // 定位结果可信度
      if (curLocation.trusted_level !== "") {
        switch (parseInt(curLocation.trusted_level)) {
          case 1:
            location.setTrustedLevel("非常可信");
            break;
          case 2:
            location.setTrustedLevel("可信度一般");
            break;
          case 3:
            location.setTrustedLevel("可信度较低");
            break;
          case 4:
            location.setTrustedLevel("非常不可信");
            break;
          default:
            location.setTrustedLevel("未知");
            break;
        }
      }
    },
    /**
     * 检测是否在中国
     */
    _isInChina(lon, lat) {
      return lon >= 73 && lon <= 135 && lat >= 4 && lat <= 53;
    }
  }
};
</script>

<style scoped>
.full {
  width: 100%;
  height: 100%;
}
.menu {
  position: absolute;
  left: 20px;
  top: 20px;
}
</style>
