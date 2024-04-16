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
          <el-card id="warning-panel" shadow="always">
            <warning-panel :stocks="stocks"/>
          </el-card>
        </el-row>

      </el-col>
      <el-col class="sect" :span="12">
        <el-row>
          <el-card shadow="always">
            <store-chart style="height: 620px" :stocks="stocks" class="chart"/>
          </el-card>
        </el-row>
        <el-row>
          <el-card shadow="always">
            <p-s-chart :purchases7="purchases7" :sales7="sales7" class="chart"/>
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
import StoreChart from "@/views/dashboard/StoreChart";
import PSChart from "@/views/dashboard/PSChart";
import WarningPanel from "@/views/dashboard/WarningPanel";

export default {
  components: {WarningPanel, PSChart, StoreChart, DataCard },
  name: 'Dashboard',

  computed: {
    ...mapGetters(['name']),

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
  },

  data() {
    return {
      stocks: [],
      sales7: [],
      purchases7: [],
    }
  },

  mounted() {
    this.load().then(() => {
      this.$bus.$on('commit', () => {
        this.load()
      })
    })
  },

  beforeDestroy() {
    this.$bus.$off('commit')
  },

  methods: {

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

      this.$nextTick(()=>{
        this.$bus.$emit('chart-update')
      })
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

.chart {
  width: 100%;
  height: 400px;
  padding: 10px;
}


::v-deep .el-card__body {
  padding: 0;
  //height: 200px;
}
</style>
