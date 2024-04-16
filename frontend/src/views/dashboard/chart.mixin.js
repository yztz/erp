export default {
  data() {
    return {
      chart: null // used to store chart obj
    }
  },
  mounted() {
    this.chart = this.$echarts.init(this.$refs.chart)
    this.$bus.$on('chart-update', () => {
      this.refresh()
    })
    window.addEventListener('resize', this.chart.resize)
    this.refresh()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.chart.resize)
    this.$bus.$off('chart-update')
  },
  methods: {
    refresh() {
      this.chart.setOption(this.chartOption)
    },
  },

}
