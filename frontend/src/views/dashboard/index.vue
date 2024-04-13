<template>
  <div class="dashboard-container">
    <div class="dashboard-text">欢迎您 {{ name }}</div>

    <el-row type="flex" :gutter="20" style="margin-top: 40px">
      <el-col class="sect" :span="12">
        <el-row :gutter="20">
          <el-col :span="8">
            <data-card title="总库存" :value="stockCount"/>
          </el-col>
          <el-col :span="8">
            <data-card title="今日入库" :value="amountPurchaseToday"/>
          </el-col>
          <el-col :span="8">
            <data-card title="今日出库" :value="amountSaleToday"/>
          </el-col>
        </el-row>

        <el-row>
          <el-card id="warning-panel" shadow="always" style="padding: 10px" body-style="display: flex; flex-direction: column">
            <el-button id="thresh-btn" type="text" @click="setWarnThresh">设置告警阈值</el-button>
            <span style="font-size: 18px; font-family: 'Microsoft YaHei',serif; font-weight: bold; align-self: center; margin: 10px 0 20px 0">库存告警</span>
            <el-table
              :max-height="700"
              :data="lowStock"
              style="width: 100%"
            >
              <el-table-column
                align="center"
                prop="good.code"
                label="货号"/>
              <el-table-column
                align="center"
                prop="good.color"
                label="颜色"/>
              <el-table-column
                align="center"
                prop="size"
                label="尺码"/>
              <el-table-column
                align="center"
                prop="amount"
                label="数量"/>
            </el-table>
          </el-card>
        </el-row>

      </el-col>
      <el-col class="sect" :span="12">
        <el-row>
          <el-card shadow="always">
            <div class="chart" style="height: 620px" id="stock-detail"></div>
          </el-card>
        </el-row>
        <el-row>
          <el-card shadow="always">
            <div class="chart" id="purchase-and-sale"></div>
          </el-card>
        </el-row>
      </el-col>

    </el-row>

    <!-- <el-row :gutter="20">
      <el-col :span="8"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="8"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="16"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
    </el-row> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { queryAllStocks } from '@/api/stock'
import { queryPurchases } from '@/api/purchase'
import { querySales } from '@/api/sale'
import moment from 'moment'
import DataCard from './dataCard.vue'

export default {
  components: { DataCard },
  name: 'Dashboard',

  computed: {
    ...mapGetters(['name']),
    lowStock() {
      return this.stocks.filter(item=>item.amount <= this.stockThreshold)
    },
    stockCount() {
      let ans = 0
      this.stocks.forEach(item => {
        if (item.amount > 0) ans += item.amount
      })
      return ans
    },
    amountPurchaseToday() {
      let today = moment().startOf('day') // 获取今天的开始时间
      let data = this.purchases7.filter(item => moment(item.createdAt).isAfter(today))
      let ans = 0
      for (let purchase of data) {
        ans += purchase.amount
      }
      return ans
    },
    amountSaleToday() {
      let today = moment().startOf('day') // 获取今天的开始时间
      let data = this.sales7.filter(item => moment(item.createdAt).isAfter(today))
      let ans = 0
      for (let sale of data) {
        ans += sale.amount
      }
      return ans
    },

    amountSale7() {
      return this.mapDateData(this.sales7)
    },
    amountPurchase7() {
      return this.mapDateData(this.purchases7)
    },
    // 分组聚合 {尺寸:{商品:{数量}}} {商品:数量} {商品ID:商品名称（货号+颜色）}
    stockGroupByGood() {
      let amounts = {}
      let titles = {}
      let sizes = {}
      for (let stock of this.stocks) {
        if (!(stock.size in sizes)) {
          sizes[stock.size] = {}
        }
        if (!(stock.good.id in amounts)) {
          amounts[stock.good.id] = 0
        }

        sizes[stock.size][stock.good.id] = stock.amount
        amounts[stock.good.id] += stock.amount
        titles[stock.good.id] = `${stock.good.code} (${stock.good.color})`
      }

      return { sizes, amounts, titles }
    },
    // 商品按数量排序后的一一对应的数量数组、标题数组
    stockTitlesAndAmounts() {
      let { amounts: amountsObj, titles: titlesObj } = this.stockGroupByGood
      let amounts = []
      let titles = []

      for (let e of Object.entries(amountsObj)) {
        amounts.push(e)
      }
      amounts.sort((a, b) => {
        return a[1] - b[1] // 总数升序
      })
      // console.log(amounts)
      for (let [id] of amounts) {
        titles.push(titlesObj[id])
      }

      return { ids: amounts.map(item => item[0]), amounts: amounts.map(item => item[1]), titles }
    },
    stockChartOption() {
      let { sizes } = this.stockGroupByGood
      let { ids, titles } = this.stockTitlesAndAmounts
      // console.log(sizes)
      let series = []

      for (let size of Object.keys(sizes)) {
        let news = {
          name: size,
          data: [],
          type: 'bar',
          stack: 'total',
          // label: {
          //   show: true,
          // },
        }
        for (let id of ids) {
          if (id in sizes[size]) {
            news.data.push(sizes[size][id])
          } else {
            news.data.push('-')
          }
        }
        series.push(news)
      }
      // console.log(series)
      return series.length === 0 ? {
        title: {
          text: '库存盘点\n\n暂无数据',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: 28,
          },
        },
      } : {
        title: {
          text: '库存盘点',
          // textAlign: 'center',
          // left: 'center',
          padding: 20,
          left: 'center',
        },
        grid: {
          left: '3%',
          right: '3%',
          // bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          axisTick: {
            show: false,
          },
          data: titles,
        },
        series,
        legend: {
          show: true,
          bottom: 0,
        },
        dataZoom: [
          {
            type: 'inside',
            startValue: ids.length - 20,
            minValueSpan: 3,
            maxValueSpan: 20,
            orient: 'vertical',
            zoomOnMouseWheel: false,  // 关闭滚轮缩放
            moveOnMouseWheel: true, // 开启滚轮平移
            moveOnMouseMove: true,  // 鼠标移动能触发数据窗口平移
          },
          {
            type: 'slider',
            realtime: true,
            // startValue: 0,
            // endValue: 2,
            // width:  '3.5',
            height: '80%',
            orient: 'vertical',
            brushSelect: false,
            startValue: ids.length - 20,
            minValueSpan: 3,
            maxValueSpan: 20,
            // fillerColor: "rgba(154, 181, 215, 1)", // 滚动条颜色
            // borderColor: "rgba(17, 100, 210, 0.12)",
            // backgroundColor: '#cfcfcf',//两边未选中的滑动条区域的颜色
            // handleSize:0, // 两边手柄尺寸
            // showDataShadow: false,//是否显示数据阴影 默认auto
            showDetail: false, // 拖拽时是否展示滚动条两侧的文字
            top: '1%',
            right: '5',
          },
        ],
        tooltip: {
          confine: true,
          show: true,
          trigger: 'axis', // "item" || "axis"
          axisPointer: {
            type: 'cross',
          },
          formatter: function(params) {
            var result = '<div class="tooltip-title">' + params[0].axisValue + '</div>'
            params.forEach(function(item) {
              if (item.value !== '-') {
                result += '<div class="tooltip-series"><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'
                  + item.color
                  + '"></span>'
                  + '<span>'
                  + item.seriesName + ': '
                  + item.value
                  + '</span></div>'
              }
            })
            return result
          },
        },
      }
    },
    PSChartOption() {
      let dates = []
      for (let i = 6; i >= 0; i--) {
        let date = moment().subtract(i, 'days').format('MM-DD')
        dates.push(date)
      }
      return {
        title: {
          text: '近七日仓库出入库数量',
          // textAlign: 'center',
          // left: 'center',
          padding: 20,
          left: 'center',
        },
        grid: {
          top: '20%',  // 调整这个值以改变标题和图表之间的间距
        },
        legend: {
          orient: 'horizontal',
          bottom: 10,
          itemGap: 60,
        },

        tooltip: {
          show: true,
          trigger: 'axis', // "item" || "axis"
          axisPointer: {
            type: 'cross',
            snap: true,
            // label: {
            //   backgroundColor: '#283b56'
            // }
          },
        },
        xAxis: {
          axisTick: {
            alignWithLabel: true,
          },
          name: '日期',
          data: dates,
        },
        yAxis: {
          type: 'value',
          // name: '数量',
        },
        series: [
          {
            name: '入库',
            data: this.amountPurchase7,
            type: 'line',
            areaStyle: {},
          },

          {
            name: '出库',
            data: this.amountSale7,
            type: 'line',
            areaStyle: {},
          },
        ],
      }
    },
  },

  data() {
    return {
      stocks: [],
      sales7: [],
      purchases7: [],
      charts: {},
      stockThreshold: 50,
    }
  },

  mounted() {
    this.getWarnThresh()
    this.createCharts()
    this.load().then(() => {
      this.$bus.$on('commit', () => {
        this.load()
      })
    })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    this.$bus.$off('commit')
  },

  methods: {
    getWarnThresh() {
      this.stockThreshold = Number.parseInt(localStorage.getItem("stockThreshold") || 50)
    },
    setWarnThresh() {
      this.$prompt('请输入新的告警阈值', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^-?[0-9]+$/,
        inputErrorMessage: '数字不正确'
      }).then(({ value }) => {
        localStorage.setItem("stockThreshold", value)
        this.getWarnThresh()
        this.$message({
          type: 'success',
          message: '设置成功'
        });
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '取消'
        // });
      });
    },
    mapDateData(ps, days = 7) {
      // 将数据按照日期进行归类，并按日期升序
      let ans = new Array(days).fill(0)
      let today = moment().startOf('day')
      for (let { createdAt, amount } of ps) {
        ans[today.diff(moment(createdAt).startOf('day'), 'days')] += amount
      }
      ans.reverse()
      return ans
    },

    async load() {
      // stocks
      let { data: stocks } = await queryAllStocks({
        pagination: {
          limit: -1,
        },
        populate: '*',
      })
      // 7 days purchase
      let { data: purchases } = await queryPurchases({
        pagination: {
          limit: -1,
        },
        filters: {
          createdAt: {
            $gt: moment().local().subtract(7, 'days').startOf('day').toISOString(),
          },
        },
        sort: ['createdAt'],
      })
      // 7 days sale
      let { data: sales } = await querySales({
        pagination: {
          limit: -1,
        },
        filters: {
          createdAt: {
            $gt: moment().local().subtract(7, 'days').startOf('day').toISOString(),
          },
        },
        sort: ['createdAt'],
      })

      // console.log(purchases);
      // console.log(sales);
      // console.log(stocks)
      this.stocks = stocks
      this.purchases7 = purchases
      this.sales7 = sales
      this.charts.PSChart.setOption(this.PSChartOption)
      this.charts.stockChart.setOption(this.stockChartOption)
    },
    createCharts() {
      // 出入库折线堆叠图
      this.charts.PSChart = this.$echarts.init(document.querySelector('#purchase-and-sale'))
      // 库存详情
      this.charts.stockChart = this.$echarts.init(document.querySelector('#stock-detail'))
      window.addEventListener('resize', this.resizeCharts)
    },
    resizeCharts() {
      for (let [key, value] of Object.entries(this.charts)) {
        value.resize()
      }
    },
  },
}
</script>

<style lang="scss" scoped>


.el-row {
  .sect {
    min-width: 700px;
  }

  margin-bottom: 20px;
  flex-wrap: wrap;

  //&:last-child {
  //  margin-bottom: 0;
  //}
}

.dashboard {
  &-container {
    position: relative;
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

.card-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.chart {
  width: 100%;
  height: 400px;
}

#warning-panel {
  position: relative;

  #thresh-btn {
    position: absolute;
    right: 15px;
    top: 0;
  }
}

::v-deep .el-card__body {
  padding: 0;
  //height: 200px;
}
</style>
