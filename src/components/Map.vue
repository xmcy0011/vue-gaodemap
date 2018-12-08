<template>
  <div class="full">
    <div id="map-container"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import AMap from "AMap";

export default {
  name: "home",
  data() {
    return {
      map: null,
      infoWindow: null,
      infoWindowMarker: null
    };
  },
  mounted() {
    this.map = new AMap.Map("map-container", {
      mapStyle: "amap://styles/whitesmoke",
      zoom: 15,
      center: [120.729577, 31.265226]
    });

    // 创建 infoWindow 实例
    this.infoWindow = new AMap.InfoWindow();

    /*
    // 单元测试代码
    setTimeout(() => {
      console.log("this.add()");
      let marker = this.add(120.729577, 31.265226, "设备1", {
        uid: "test1", // 唯一标志
        locationType: null, // 获取当前定位结果来源，如网络定位结果，详见定位类型表 https://lbs.amap.com/api/android-location-sdk/guide/utilities/location-type
        gpsAccuracyStatus: "强", // GPS的当前状态
        trustedLevel: null, // 定位结果的可信度
        accuracy: "100米", // 精度信息，单位:米
        speed: null, // 速度
        direct: null, // 方向
        status: null, // 定位状态
        time: "2018-12-08 16:43:01", // 定位时间
        address: null // 地址
      });

      setTimeout(
        m => {
          console.log("this.update()");
          this.update(m, 120.729577, 31.267226, "2018-12-08 17:00:32", null, null, null);

          setTimeout(() => {
            console.log("this.clear()");
            this.clear();
          }, 5000);
        },
        5000,
        marker
      );
    }, 2000);
    */
  },
  methods: {
    /**
     * 平滑的移动地图到某个点
     * @lon：经度
     * @lat：维度
     */
    panTo(lon, lat) {
      this.map.panTo([lon, lat]);
    },
    showWindow(uid) { },
    /**
     * 添加一个覆盖物
     * @lon：经度
     * @lat：维度
     * @text：要显示的文本
     * @descObject：覆盖物的各种描述信息 {
        uid: uid, // 唯一标志
        locationType: null, // 获取当前定位结果来源，如网络定位结果，详见定位类型表 https://lbs.amap.com/api/android-location-sdk/guide/utilities/location-type
        gpsAccuracyStatus: null, // GPS的当前状态
        trustedLevel: null, // 定位结果的可信度
        accuracy: accuracy, // 精度信息，单位:米
        speed: speed, // 速度
        direct: direct, // 方向
        status: status, // 定位状态
        time: time, // 定位时间
        address: null, // 地址
      }
     * @return marker
     */
    add(lon, lat, text, descObject) {
      // 小三角、和阴影
      const content = `<div class="test_triangle_border">
                        <div class="popup">
                          <em></em><span></span>test01
                        </div>
                       </div>`;
      let marker = new AMap.Marker({
        content: content, // 自定义点标记覆盖物内容
        position: [lon, lat],
        title: text,
        offset: new AMap.Pixel(-75, -72),
        extData: descObject
      });

      // 绑定鼠标点击事件
      let _this = this;
      marker.on("click", function (e) {
        _this._onClickMarker(this, _this, false);
      });
      this.map.add(marker);
      return marker;
    },
    /**
     * 更新覆盖物的坐标
     * @marker：覆盖物
     * @newLon：新的经度
     * @newLat：新的维度
     */
    update(marker, newLon, newLat, time, speed, direct, status) {
      marker.setPosition([newLon, newLat]);
      // 保存自定义信息
      let data = marker.getExtData();
      if (data === undefined || data === null) {
        return;
      }
      data.time = time;
      data.speed = speed;
      data.direct = direct;
      data.status = status;
      marker.setExtData(data);

      // 此时得更新infoWindow
      if (marker === this.infoWindowMarker && this.infoWindow.getIsOpen()) {
        this._onClickMarker(marker, this, true);
      }
    },
    /**
     * 清楚所有覆盖物
     */
    clear() {
      this.infoWindow.close();
      this.infoWindowMarker = null;
      this.map.clearMap();
    },
    /**
     * 覆盖物点击，弹出信息窗口
     */
    _onClickMarker(marker, _this, update) {
      let info = marker.getExtData();
      let content = _this._getInfoWindowContent(info,
        marker.getTitle(),
        marker.getPosition().getLng(),
        marker.getPosition().getLat());

      // 显示信息窗口
      _this.infoWindowMarker = marker;
      _this.infoWindow.setContent(content.join(""));

      if (update) {
        _this.infoWindow.setPosition(marker.getPosition());
      } else {
        _this.infoWindow.open(_this.map, marker.getPosition());
      }
    },
    /**
     * 获取信息框内显示的内容
     */
    _getInfoWindowContent(data, text, lng, lat) {
      // 构建信息窗体中显示的内容
      var info = [];
      info.push("<div class='input-card content-window-card'>");
      info.push("<div style=\"padding:7px 0px 0px 0px;\"><p class='input-item' style='font-size:18px;margin-top:7px;'>" + text + "</p>");
      info.push("<p class='input-item'>" + "定位类型 : " + (data.locationType !== null ? data.locationType : "未知") + "</p>");
      info.push("<p class='input-item'>" + "GPS状态 ：" + (data.gpsAccuracyStatus !== null ? data.gpsAccuracyStatus : "未知") + "</p>");
      info.push("<p class='input-item'>" + "定位结果可信度 : " + (data.trustedLevel !== null ? data.trustedLevel : "未知") + "</p>");
      info.push("<p class='input-item'>" + "精度 : " + (data.accuracy !== null ? data.accuracy : "未知") + "</p>");
      info.push("<p class='input-item'>" + "速度 : " + (data.speed !== null ? data.speed : "未知") + "</p>");
      info.push("<p class='input-item'>" + "方向 : " + (data.direct !== null ? data.direct : "未知") + "</p>");
      info.push("<p class='input-item'>" + "定位状态 : " + (data.status !== null ? data.status : "未知") + "</p>");
      info.push("<p class='input-item'>" + "定位时间 : " + (data.time !== null ? data.time : "未知") + "</p>");
      info.push("<p class='input-item'>" + "地址 : " + (data.address !== null ? data.address : "未知") + "</p>");
      info.push("<p class='input-item'>" + "经纬度 : " + (lng + "," + lat) + "</p>");

      info.push("<div class='row'><button type='button' class='btn btn-default'>语音通话</button>");
      info.push("<button type='button' class='btn btn-default'>视频查看</button>");
      info.push("<button type='button' class='btn btn-default'>历史轨迹</button></div>");
      info.push("</div></div>");

      return info;
    }
  }
};
</script>

<style>
.full {
  width: 100%;
  height: 100%;
}
#map-container {
  width: 100%;
  height: 100%;
}

.input-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border-radius: 0.25rem;
  width: 18rem;
  border-width: 0;
  border-radius: 0.4rem;
  box-shadow: 0 2px 6px 0 rgba(114, 124, 245, 0.5);
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  padding: 0.75rem 1.25rem;
}

.input-item {
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  font-size: 13px;
  height: 24px;
  line-height: 16.8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
}

.content-window-card {
  position: relative;
  width: 18rem;
  padding: 0 0 0 0.5rem;
  box-shadow: none;
  bottom: 0;
  left: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  line-height: 1.5;
  color: #111213;
}

.content-window-card p {
  height: 0.8rem;
}

.btn {
  display: inline-block;
  margin: 4px;
  width: 80px;
  height: 30px;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none;
  border: 1px solid transparent;
  white-space: nowrap;
}
.btn:hover {
  color: #333;
  text-decoration: none;
}
.btn:active {
  outline: 0;
  background-image: none;
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.btn-default {
  color: #333;
  background-color: #fff;
  border-color: #ccc;
}

/*自定义图标样式*/
.test_triangle_border .popup {
  width: 80px;
  background: #027cf6;
  padding: 5px 5px 7px 5px;
  color: #ffffff;
  text-align: center;
  border-radius: 4px;
  position: absolute;
  top: 30px;
  left: 30px;
}
/*向下*/
.test_triangle_border span {
  display: block;
  width: 0;
  height: 0;
  border-width: 8px 8px 0;
  border-style: solid;
  border-color: #027cf6 transparent transparent; /*黄 透明 透明 */
  position: absolute;
  bottom: -8px;
  left: 37px;
}
/*小阴影*/
.test_triangle_border em {
  width: 10px;
  height: 5px;
  margin: 3px;
  background: #646464;
  opacity: 0.5;
  border-radius: 50% / 50%;
  position: absolute;
  bottom: -14px;
  left: 37px;
}
</style>
