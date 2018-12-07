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
      map: null
    };
  },
  mounted() {
    this.map = new AMap.Map("map-container", {
      mapStyle: "amap://styles/whitesmoke",
      zoom: 15,
      center: [120.729577, 31.265226]
    });

    setTimeout(() => {
      console.log("this.add()");
      let marker = this.add(120.729577, 31.265226, "test1", "设备1", 500);

      setTimeout(
        m => {
          console.log("this.update()");
          this.update(m, 120.729577, 31.267226);
        },
        5000,
        marker
      );
    }, 2000);
  },
  methods: {
    /**
     * 平滑的移动地图到某个点
     * @lon：经度
     * @lat：维度
     */
    panTo(lon, lat) {
      this.map.panTo(lon, lat);
    },
    showWindow(uid) {},
    /**
     * 添加一个覆盖物
     * @lon：经度
     * @lat：维度
     * @uid：唯一标识
     * @text：要显示的文本
     * @time：时间
     * @accuracy：精度
     * @speed：速度
     * @direct：方向
     * @status：状态
     * @return marker
     */
    add(lon, lat, uid, text, time, accuracy, speed, direct, status) {
      const content = `<div class="test_triangle_border">
                        <div class="popup">
                          <em></em><span></span>test01
                        </div>
                       </div>`;
      let marker = new AMap.Marker({
        content: content, // 自定义点标记覆盖物内容
        position: [lon, lat],
        offset: new AMap.Pixel(-75, -72),
        // 自定义式数据
        extData: {
          uid: uid,
          time: time,
          accuracy: accuracy,
          speed: speed,
          direct: direct,
          status: status
        }
      });
      this.map.add(marker);

      console.log(marker.getExtData());

      return marker;
    },
    /**
     * 更新覆盖物的坐标
     * @marker：覆盖物
     * @newLon：新的经度
     * @newLat：新的维度
     */
    update(marker, newLon, newLat, time, accuracy, speed, direct, status) {
      marker.setPosition([newLon, newLat]);

      // 保存自定义信息
      let data = marker.getExtData();
      marker.setExtData({
        uid: data.uid,
        time: time,
        accuracy: accuracy,
        speed: speed,
        direct: direct,
        status: status
      });
    },
    /**
     * 清楚所有覆盖物
     */
    clear() {}
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
