import Vue from 'vue'
import vuex from 'vuex'
import historyStore from './location_history_store'; // 引入历史轨迹的store对象
import liveStore from './location_live_store'; // 引入历史轨迹的store对象
import config from './config_store'; // 引入配置文件的store

Vue.use(vuex);

export default new vuex.Store({
  modules: {
    history: historyStore,
    live: liveStore,
    config: config
    // 其他子组件的store可以加在这里
  }
})
