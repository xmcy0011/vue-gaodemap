<!-- 历史轨迹缩略列表 -->
<template>
    <div class="container">
        <el-collapse accordion @change="SearchOneDayTraceList" style="max-height:600px;">
            <el-collapse-item v-for="time in $store.state.history.trailDateList" :name="time.date" :key="time.date" :title="time.title">
                <div class="item" v-for="item in time.trailTimeList" :key="item.start_time" @click="SearchDetailLocation(item.start_time,item.end_time)">
                    <div class="row">
                        <div class="row">
                            <div class="col-md-1">
                                <div class="circle start-color"></div>
                            </div>
                            <div class="col-md-9">
                                <p class="text-left">{{item.startLoc}}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-1">
                                <div class="circle end-color"></div>
                            </div>
                            <div class="col-md-9">
                                <p class="text-left">{{item.endLoc}}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-1"></div>
                            <div class="col-md-3">
                                <p class="text-left">{{item.startTime}}</p>
                            </div>
                            <div class="col-md-5">
                                <p class="text-left">{{item.timeLen}}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
export default {
  data() {
    return {};
  },

  components: {},

  computed: {},

  mounted() {},

  methods: {
    SearchOneDayTraceList(date) {
      if (date === "") {
        return;
      }
      // 如果已查询，忽略
      let colItem = null;
      for (const key in this.$store.state.history.trailDateList) {
        const item = this.$store.state.history.trailDateList[key];
        if (item.date === date) {
          if (item.trailTimeList.length === 0) {
            colItem = item;
            break;
          } else {
            return;
          }
        }
      }

      let hostName = this.$store.state.config.locationServer;
      let url = "http://" + hostName + "/HistoryLocation/query_groupby_no";
      $.ajax({
        url: url,
        data: {
          device_id: this.$store.state.history.selectedUser,
          date: date
        },
        type: "GET",
        dataType: "jsonp",
        jsonp: "callback",
        success: data => {
          console.log(data);
          if (data.error_code !== 0) {
            this.$alert("查询失败：" + data.error_msg, "错误", {
              confirmButtonText: "确定"
            });
            return;
          }
          if (data.total_count === 0) {
            this.$alert("未查询到任何结果，请更换查询条件后重试！", "错误", {
              confirmButtonText: "确定"
            });
            return;
          }

          // 显示某天下的轨迹条数
          let dateList = [];
          for (const key in data.list) {
            const trailInfo = data.list[key];
            let timeLen = parseInt(parseInt(trailInfo.total_time_len_s) / 60);
            if (timeLen === 0) {
              timeLen = "小于1分钟";
            } else {
              timeLen = timeLen + "分钟";
            }

            colItem.trailTimeList.push({
              startLoc: "起：" + trailInfo.start_lon + "," + trailInfo.start_lat,
              endLoc: "终：" + trailInfo.end_lon + "," + trailInfo.end_lat,
              startTime: trailInfo.start_time.substring(10, 19),
              timeLen: timeLen,
              start_time: trailInfo.start_time,
              end_time: trailInfo.end_time,
              total_point: trailInfo.trailInfo
            });
          }
        },
        error: errorData => {
          console.log(errorData);
          this.$alert("查询失败：" + errorData.statusText, "错误", {
            confirmButtonText: "确定"
          });
        }
      });
    },
    SearchDetailLocation(startDateTime, endDateTime) {
      console.log(startDateTime + "," + endDateTime);

      let hostName = this.$store.state.config.locationServer;
      let url = "http://" + hostName + "/HistoryLocation/query_list";
      $.ajax({
        url: url,
        data: {
          device_id: this.$store.state.history.selectedUser,
          begin_time: startDateTime,
          end_time: endDateTime
        },
        type: "GET",
        dataType: "jsonp",
        jsonp: "callback",
        success: data => {
          this.$store.state.history.showMarkerAnimation = true;
          this.$store.state.history.trailList = data.loc_list;
          console.log(data);
        },
        error: data => {
          alert(data);
        }
      });
    }
  }
};
</script>
<style scoped>
.container {
  overflow-y: auto;
  max-height: 500px;
}
.flex {
  display: flex;
  flex-direction: column;
}
.item {
  margin-left: 10px;
  padding-top: 10px;
  padding-left: 20px;
  border: 0px;
  border-top: 1px #dcdfe6 solid;
  max-height: 400px;
}
.item:hover {
  cursor: pointer;
  margin-left: 15px;
}
.circle {
  width: 12px;
  height: 12px;
  border-radius: 10px;
  margin: 3px;
  float: left;
}
.start-color {
  border: 2px green solid;
}
.end-color {
  border: 2px red solid;
}
</style>
