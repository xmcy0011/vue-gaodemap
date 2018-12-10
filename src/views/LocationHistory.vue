<template>
  <div class="full">
    <Player ref="player"></Player>
    <!--条件输入区-->
    <div class="inputArea">
      <TraceSelect ref="traceSelect"></TraceSelect>
      <TrailSummList v-show="this.$store.state.history.showSummy" id="trailSummList" ref="trailSummList"></TrailSummList>
    </div>
    <el-button class="menu" icon="el-icon-back" type="primary" round>
      <router-link to="/" style="color:white; text-decoration: none;">返回</router-link>
    </el-button>
  </div>
</template>

<script>
import TraceDateSelect from "../components/TraceDateSelect";
import TraceList from "../components/TraceList";
import Player from "../components/TracePlayer";

export default {
  data() {
    return {};
  },

  components: { TraceDateSelect, TraceList, Player },

  computed: {
    trailList() {
      return this.$store.state.history.trailList;
    }
  },
  watch: {
    trailList: function() {
      let list = this.$store.state.history.trailList;
      // 加载历史轨迹
      this.$refs.player.open(list);
    }
  },
  mounted() {},

  methods: {}
};
</script>
<style scoped>
.inputArea {
  position: absolute;
  right: 10px;
  top: 20px;
  opacity: 0.7;
  display: flex;
  flex-direction: column;
}
.inputArea:hover {
  opacity: 1;
  z-index: 999;
}
#trailSummList {
  position: absolute;
  top: 110px;
  right: 0px;
  width: 280px;
}
.menu {
  position: absolute;
  left: 20px;
  top: 20px;
}
.full {
  width: 100%;
  height: 100%;
}
</style>
