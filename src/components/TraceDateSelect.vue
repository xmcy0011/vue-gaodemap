<!-- 输入框，包含选择用户名和开始和结束时间 -->
<template>
  <el-tabs type="border-card" v-model="selectedTab">
    <!--普通搜索，选择用户和时间段-->
    <el-tab-pane label="普通搜索" name="first">
      <div class="flex">
        <el-select class="flex-item" v-model="$store.state.history.selectedUser" clearable placeholder="姓名" visible-change="UserSelectVisibleChanged">
          <el-option v-for="item in userList" :key="item.userName" :label="item.nickName" :value="item.userName">
          </el-option>
        </el-select>
        <el-select class="flex-item" v-model="selectedTimeSpan" clearable placeholder="时间范围">
          <el-option v-for="item in timeSpanList" :key="item.label" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-button style="margin-left:50px;" class="flex-item" type="primary" icon="el-icon-search" @click="SearchHistorySummy">搜索</el-button>
      </div>
    </el-tab-pane>
    <el-tab-pane label="简单搜索" name="second">
      <div class="flex">
        <el-select class="flex-item" v-model="$store.state.history.selectedUser" clearable placeholder="姓名" visible-change="UserSelectVisibleChanged">
          <el-option v-for="item in userList" :key="item.userName" :label="item.nickName" :value="item.userName">
          </el-option>
        </el-select>
        <el-date-picker style="margin-left:10px;" v-model="selectedTimeSpan2" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions">
        </el-date-picker>
        <el-button style="margin-left:50px;" class="flex-item" type="primary" icon="el-icon-search" @click="SearchHistorySummy">搜索</el-button>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  data() {
    return {
      selectedTab: "first", // 当前选择的tab页
      userList: [], // 用户列表。{userName,nickName}

      timeSpanList: [
        {
          value: "0",
          label: "今天"
        },
        {
          value: "1",
          label: "昨天"
        },
        {
          value: "3",
          label: "近三天"
        },
        {
          value: "7",
          label: "近一周"
        },
        {
          value: "31",
          label: "近一月"
        }
      ],
      selectedTimeSpan: null,

      // 简单搜索
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      selectedTimeSpan2: ""
    };
  },

  components: {},

  computed: {},

  mounted() {
    this.UserSelectVisibleChanged(true);
  },

  methods: {
    UserSelectVisibleChanged(visible) {
      if (!visible) {
        return;
      }
      this.userList = [];

      let list = window.userList;
      if (list != null && list.length > 0) {
        for (const index in list) {
          let user = {
            userName: list[index].getUserName(),
            nickName: list[index].getDisplayName()
          };
          this.userList.push(user);
          // 从其他页面跳转过来
          if (this.$route.params.userName !== null && this.$route.params.userName === user.userName) {
            this.$store.state.history.selectedUser = user.userName;
          }
        }
      }
      console.log("userName:" + this.$route.params.userName);

      // 说明是跳转过来的，自动查询最近一周的
      if (this.$route.params.userName !== null && this.$route.params.userName !== undefined && this.$route.params.userName !== "") {
        this.selectedTimeSpan = this.timeSpanList[3].value;
        this.SearchHistorySummy();
      }
    },
    ValidInput() {
      if (this.$store.state.history.selectedUser === null || this.$store.state.history.selectedUser === "") {
        this.$message.error("请选择用户！");
        return false;
      }
      if (this.selectedTab === "first" && (this.selectedTimeSpan === null || this.selectedTimeSpan === "")) {
        this.$message.error("请选择时间范围！");
        return false;
      } else if (this.selectedTab === "second" && (this.selectedTimeSpan2 === null || this.selectedTimeSpan2 === "")) {
        this.$message.error("请选择时间范围！");
        return false;
      }
      return true;
    },
    GetQuerySummaryUrl() {
      let beginTime = new Date();
      let endTime = new Date();
      if (this.selectedTab === "first") {
        endTime = DateFormat(endTime, "yyyy-MM-dd hh:mm:ss");
        // 减去选择的天数
        if (this.selectedTimeSpan === "0") {
          // 今天从0点开始
          beginTime = DateFormat(beginTime, "yyyy-MM-dd") + " 00:00:00";
        } else {
          beginTime.setTime(beginTime.getTime() - 3600 * 1000 * 24 * parseInt(this.selectedTimeSpan));
          beginTime = DateFormat(beginTime, "yyyy-MM-dd hh:mm:ss");
        }
      } else if (this.selectedTab === "second") {
        beginTime = DateFormat(this.selectedTimeSpan2[0], "yyyy-MM-dd hh:mm:ss");
        endTime = DateFormat(this.selectedTimeSpan2[1], "yyyy-MM-dd hh:mm:ss");
      }
      console.log("beginTime:" + beginTime + ",endTime:" + endTime);
      return { device_id: this.$store.state.history.selectedUser, begin_time: beginTime, end_time: endTime };
    },
    /**
     * 根据日期字符串获取星期几
     * @param dateString 日期字符串（如：2016-12-29），为空时为用户电脑当前日期
     * @returns {String}
     */
    GetWeek(dateString) {
      let dateArray = dateString.split("-");
      let date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
      // let weeks = new Array("日", "一", "二", "三", "四", "五", "六");
      // return "星期" + weeks[date.getDay()];
      return "周" + "日一二三四五六".charAt(date.getDay);
    },
    SearchHistorySummy() {
      if (this.ValidInput() === false) {
        this.$store.state.history.trailDateList = [];
        this.$store.state.history.showSummy = false;
        return;
      }

      let hostName = this.$store.state.config.locationServer;
      let url = "http://" + hostName + "/HistoryLocation/query_groupby_date";

      this.$store.state.history.trailDateList = [];
      this.$store.state.history.showSummy = false;
      this.$store.state.history.showMarkerAnimation = false;

      let parameter = this.GetQuerySummaryUrl();
      $.ajax({
        url: url,
        data: parameter,
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

          // -----------------
          // 按日期聚类
          // -----------------
          let dateList = [];
          for (const key in data.list) {
            const trailInfo = data.list[key];
            // 日期 星期几？
            let dateStr = trailInfo.date + " " + this.GetWeek(trailInfo.date) + "(" + trailInfo.total_count + ")";

            // 加入到列表中，注意去重
            dateList.push({
              title: dateStr,
              date: trailInfo.date,
              totalCount: trailInfo.total_count,
              trailTimeList: [] // 某天下面的轨迹条数列表
            });
          }

          // 提交到store中
          this.$store.state.history.trailDateList = dateList;
          this.$store.state.history.showSummy = true;
        },
        error: errorData => {
          console.log(errorData);
          this.$alert("查询失败：" + errorData.statusText, "错误", {
            confirmButtonText: "确定"
          });
        }
      });
    }
  }
};
</script>
<style scoped>
.flex {
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.flex-item {
  margin-left: 10px;
  max-width: 100px;
}
</style>
