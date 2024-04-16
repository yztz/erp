import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control


// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.config.productionTip = false

import VueSocketIO from 'vue-socket.io'
import socket from '@/socket'

const SOCKETIO = new VueSocketIO({
  debug: false, // true开启
  connection: socket, // 里面写socket服务器地址
  // 使用vuex
  // vuex: {
  //   store,
  //   // 定义vuex函数的时候，用来区分普通函数还是socket函数。
  //   actionPrefix: 'SOCKET_',
  //   mutationPrefix: 'SOCKET_'
  // },
  options: {
    autoConnect: false // 关闭自动连接，一般是在用户登录过后才进行手动连接
  },
})

Vue.use(SOCKETIO)

// echarts
import * as echarts from 'echarts/core'
import { BarChart, LinesChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { SVGRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  SVGRenderer,
  LegendComponent,
  DataZoomComponent
])


new Vue({
  el: '#app',
  router,
  store,
  beforeCreate(){
    Vue.prototype.$bus = this//安装全局事件总线
    Vue.prototype.$echarts = echarts//安装全局事件总线
    // 面板模式常量
    Vue.prototype.$DEAL_PURCHASE = 0
    Vue.prototype.$DEAL_SALE = 1
  },
  render: h => h(App)
})
