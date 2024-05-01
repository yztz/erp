<template>
  <div ref="chart"></div>
</template>

<script>
import chartMixin from "@/views/dashboard/chart.mixin";

export default {
  name: "StoreChart",
  props: {
    stocks: Array
  },
  mixins: [chartMixin],

  mounted() {
    // this.chart.on('click', (params)=>{
    //   // if (params.componentType != 'series'
    //   console.log(params)
    // })
  },

  methods: {

  },
  computed: {
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

      return {sizes, amounts, titles}
    },
    // 商品按数量排序后的一一对应的数量数组、标题数组
    stockTitlesAndAmounts() {
      let {amounts: amountsObj, titles: titlesObj} = this.stockGroupByGood
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

      return {ids: amounts.map(item => item[0]), amounts: amounts.map(item => item[1]), titles}
    },
    chartOption() {
      let {sizes} = this.stockGroupByGood
      let {ids, titles} = this.stockTitlesAndAmounts
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
          top: 0,
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
          formatter: function (params) {
            let result = '<div class="tooltip-title">' + params[0].axisValue + '</div>'
            params.forEach(function (item) {
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
  },

}
</script>

<style scoped>

</style>
