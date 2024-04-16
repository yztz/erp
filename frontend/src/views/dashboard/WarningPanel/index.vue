<template>
  <div class="warning-panel-container">
    <el-button id="thresh-btn" type="text" @click="setWarnThresh">设置告警阈值 ( {{stockThreshold}} ) </el-button>
    <span
      style="font-size: 18px; font-family: 'Microsoft YaHei',serif; font-weight: bold; align-self: center; margin: 10px 0 20px 0"
    >库存告警</span>
    <el-table
      :max-height="700"
      :data="lowStock"
      style="width: 100%"
    >
      <el-table-column
        align="center"
        prop="good.code"
        label="货号"
      />
      <el-table-column
        align="center"
        prop="good.color"
        label="颜色"
      />
      <el-table-column
        align="center"
        prop="size"
        label="尺码"
      />
      <el-table-column
        align="center"
        prop="amount"
        label="数量"
      />
    </el-table>
  </div>
</template>

<script>
import {defaultStockThreshold} from "@/settings";
export default {
  name: "WarningPanel",
  props: {
    stocks: Array
  },
  data(){
    return {
      stockThreshold: -1
    }
  },
  computed: {
    lowStock() {
      return this.stocks.filter(item => item.amount <= this.stockThreshold).sort((a, b) => (a.amount - b.amount))
    },
  },
  mounted() {
    this.getWarnThresh()
    // this.$bus.$on('chart-update', () => {
    //   this.refresh()
    // })
  },
  methods: {
    getWarnThresh() {
      this.stockThreshold = Number.parseInt(localStorage.getItem('stockThreshold') || defaultStockThreshold)
    },
    setWarnThresh() {
      this.$prompt('请输入新的告警阈值', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^-?[0-9]+$/,
        inputErrorMessage: '格式不正确',
      }).then(({ value }) => {
        localStorage.setItem('stockThreshold', value)
        this.getWarnThresh()
        this.$message({
          type: 'success',
          message: '设置成功',
        })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '取消'
        // });
      })
    },
  }
}
</script>

<style lang="scss" scoped>

.warning-panel-container {
  position: relative;
  padding: 10px;
  display: flex;
  flex-direction: column;

  #thresh-btn {
    position: absolute;
    right: 20px;
    top: 0;
  }
}

</style>
