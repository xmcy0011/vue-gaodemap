<template>
  <div id="MapApp"></div>
</template>

<script>
import AMap from "AMap";
console.log(AMap);

export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "Welcome to Your Vue.js App"
    };
  },
  mounted() {
    const map = new AMap.Map("MapApp", {
      zoom: 15,
      center: [116.39, 39.9]
    });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#MapApp {
  width: 800px;
  height: 600px;
}
</style>
