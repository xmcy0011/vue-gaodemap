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
import AMap from "AMap";
import MapComponent from "../components/Map.vue";

export default {
  name: "home",
  components: {
    MapComponent
  },
  data() {
    return {
      map: null
    };
  },
  mounted() {
    // 获取地图子组件
    this.map = this.$refs.baseMap;
  },
  methods: {
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
