<template>
  <div ref="chart"></div>
</template>

<script>
import moment from "moment/moment";
import chartMixin from "@/views/dashboard/chart.mixin";

export default {
  name: "PSChart",
  props: {
    purchases7: Array,
    sales7: Array,
  },
  mixins: [chartMixin],
  computed: {
    amountSale7() {
      return this.mapDateData(this.sales7)
    },
    amountPurchase7() {
      return this.mapDateData(this.purchases7)
    },
    chartOption() {
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
  methods: {
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
  }
}
</script>

<style scoped>

</style>
