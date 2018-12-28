<!-- 轨迹回放组件 -->
<template>
  <div class="full">
    <div id="map-container" class="full"></div>
    <div class="main" v-show="this.$store.state.history.showMarkerAnimation">
      <div class="center">
        <el-tooltip
          class="item"
          effect="dark"
          content="适用于车辆，当其沿着道路行驶时，根据位置和朝向、速度、时间等修正轨迹"
          placement="top"
        >
          <el-checkbox id="chbEnabledAutoCorrected" v-model="enabledAutoCorrected">纠偏</el-checkbox>
        </el-tooltip>
        <!-- <div id="speedslider" class="block">
          <span class="demonstration">速度</span>
          <el-slider v-model="speed" :min="5" :max="99"></el-slider>
        </div>-->
        <div id="progresslabel" class="text-primary">
          <span style="margin-top:14px;">{{ curRoute }} / {{ routeLength }}</span>
        </div>
        <el-button
          round
          id="start-animation"
          @click="startAnimation"
          icon="el-icon-caret-right"
          type="primary"
        >{{ buttonText }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import AMap from "AMap";

export default {
  data() {
    return {
      map: null, // 地图实例对象
      marker: null, // 轨迹回放的当前进度覆盖物
      polyline: null, // 轨迹回放线条
      passedPolyline: null, // 回放过的线条
      animating: false,

      points: null, // 原始的点数组，里面有详细的信息
      routeCoords: [],
      routeLength: 0,
      curRoute: 0,
      speed: 60,
      now: 0,

      buttonText: "开 始",
      enabledAutoCorrected: true,
      center: null
    };
  },
  components: {},
  computed: {
    showMarkerAnimation() {
      return this.$store.state.history.showMarkerAnimation;
    }
  },
  watch: {
    showMarkerAnimation: function () {
      if (this.$store.state.history.showMarkerAnimation === false) {
        this.clear();
      }
    }
  },

  mounted() {
    this.init();
    // 测试代码
    // setTimeout(() => {
    //   let points = [];
    //   for (let j = 0; j <= 50; j++) {
    //     points.push({ lng: 121, lat: 31 + 0.005 * j });
    //   }
    //   this.open(points);
    //   setTimeout(() => {
    //     let points = [];
    //     for (let j = 0; j <= 10; j++) {
    //       points.push({ lng: 121 + 0.005 * j, lat: 31 });
    //     }
    //     this.open(points);
    //   }, 5000);
    // }, 2000);
  },

  methods: {
    init() {
      this.map = new AMap.Map("map-container", {
        resizeEnable: true,
        mapStyle: "amap://styles/whitesmoke",
        zoom: 17,
        center: [120.729577, 31.265226]
      });
      // 绘制覆盖物
      this.marker = new AMap.Marker({
        map: this.map,
        visible: false, // 默认不可见
        icon: "static/img/car.png",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true,
        angle: -90
      });
      // 绘制轨迹
      this.polyline = new AMap.Polyline({
        map: this.map,
        showDir: true,
        strokeColor: "#28F", // 线颜色
        // strokeOpacity: 1,  // 线透明度
        strokeWeight: 6 // 线宽
        // strokeStyle: "solid"  // 线样式
      });
      // 回放过的线条
      this.passedPolyline = new AMap.Polyline({
        map: this.map,
        // path: lineArr,
        strokeColor: "#AF5", // 线颜色
        // strokeOpacity: 1,  // 线透明度
        strokeWeight: 6 // 线宽
        // strokeStyle: "solid" // 线样式
      });
      // 回放过，设置线条
      this.marker.on('moving', e => {
        this.passedPolyline.setPath(e.passedPath);
        this.curRoute = e.passedPath.length;

        // 显示当前时间
        this.marker.setLabel({
          // 修改label相对于maker的位置
          offset: new AMap.Pixel(-7, -20),
          content: "<div class='info'>" + this.points[e.passedPath.length - 1].time.substring(10, 19) + "</div>"
        });
      });

      this.map.setFitView();
    },
    open(points) {
      if (points.length === 0) {
        return;
      }

      // direct:"113.0"
      // lat:"31.305335"
      // lng:"121.465958"
      // loc_mod:"1"
      // speed:"0.0"
      // time:"2018-05-15 09:36:32.000000"
      this.points = points;
      this.clear();

      for (let i = 0; i < points.length; i++) {
        let lng = parseFloat(points[i].lng);
        let lat = parseFloat(points[i].lat);

        // 在中国的才有效，经度73-135，维度4-53
        if (lng >= 73 && lng <= 135 && lat >= 4 && lat <= 53) {
          this.routeCoords.push([lng, lat]);
        }
      }
      // 更新进度
      this.curRoute = 0;
      this.routeLength = this.routeCoords.length;

      // 复位小车在轨迹开始处
      this.map.panTo(this.routeCoords[0]);
      this.marker.setPosition(this.routeCoords[0]);
      this.marker.show();

      // 绘制线条
      this.polyline.setPath(this.routeCoords);
    },
    clear() {
      this.passedPolyline.setPath([]);
      this.routeCoords = [];
      this.routeLength = 0;
      this.curRoute = 0;
    },
    /**
     * 开始回放
     */
    startAnimation() {
      if (this.animating) {
        this.stopAnimation(false);
      } else {
        this.animating = true;
        this.now = new Date().getTime();
        this.buttonText = "停 止";
        this.marker.moveAlong(this.routeCoords, 200);
      }
    },
    /**
     * 停止回放
     * @param {boolean} ended end of animation.
     */
    stopAnimation(ended) {
      this.animating = false;
      this.buttonText = "开 始";
      this.marker.stopMove();
    }
  }
};
</script>
<style scoped>
.full {
  width: 100%;
  height: 100%;
}
.main {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  width: 400px;
  height: 70px;
  margin: auto;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  border-collapse: separate;
  opacity: 0.7;
}
.main:hover {
  opacity: 1;
}
.center {
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: auto;
  width: 300px;
  height: 50px;
  position: absolute;
  display: flex;
  flex-direction: row;
}
.text-primary {
  margin-top: 15px;
}
.info {
  position: relative;
  top: 0;
  right: 0;
  min-width: 0;
}
#start-animation {
  top: 0px;
  bottom: 0px;
  margin: auto;
  height: 30px;
}
#progresslabel {
  margin-left: 5px;
  margin-right: 5px;
  width: 200px;
  text-align: center;
}
#speedslider {
  width: 100px;
  margin-left: 20px;
}
#chbEnabledAutoCorrected {
  margin-top: 15px;
  margin-right: 1px;
}
</style>
