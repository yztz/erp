<template>
  <div class="dashboard-container">
    <div class="dashboard-text">欢迎您 {{ name }}</div>

    <el-row :gutter="20" style="margin-top: 40px">
      <el-col :span="4">
        <data-card title="总库存" :value="stockCount"/>
      </el-col>
      <el-col :span="4">
        <data-card title="今日入库" :value="amountPurchase"/>
      </el-col>
      <el-col :span="4">
        <data-card title="今日出库" :value="amountSale"/>
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
import { mapGetters } from "vuex";
import SvgIcon from "@/components/SvgIcon";
import {queryAllStocks} from '@/api/stock'
import {queryPurchases} from '@/api/purchase'
import {querySales} from '@/api/sale'
import moment from 'moment';
import DateCard from './dataCard.vue'
import dataCard from './dataCard.vue';


export default {
  components: { dataCard },
  name: "Dashboard",

  mounted() {
    // console.log("mounted");
    this.load()
  },
  comments: [DateCard],

  computed: {
    ...mapGetters(["name"]),
    stockCount() {
      let ans = 0;
      this.stocks.forEach(item => {
        if (item.amount > 0) ans += item.amount
      })
      return ans
    },
    amountPurchase() {
      let ans = 0;
      for (let purchase of this.purchases) {
        ans += purchase.amount
      }
      return ans
    },
    amountSale() {
      let ans = 0;
      for (let sale of this.sales) {
        ans += sale.amount
      }
      return ans
    },
    amountDelta() {
      return this.amountPurchase - this.amountSale
    }
  },

  data() {
    return {
      stocks: [],
      sales: [],
      purchases: [],
    }
  },

  beforeDestroy() {
    console.log("destroyed");
  },

  methods: {
    async load() {

      // stocks
      let {data: stocks} = await queryAllStocks({
        pagination: {
          limit: -1,
        },
      })
      // tody purchase
      let {data: purchases} = await queryPurchases({
        pagination: {
          limit: -1,
        },
        filters: {
          createdAt: {
            $gt: moment().local().startOf('day').toISOString()
          }
        }
      })

      let {data: sales} = await querySales({
        pagination: {
          limit: -1,
        },
        filters: {
          createdAt: {
            $gt: moment().local().startOf('day').toISOString()
          }
        }
      })

      // console.log(purchases);
      // console.log(sales);
      this.stocks = stocks
      this.purchases = purchases
      this.sales = sales
    },
    

  },
};
</script>

<style lang="scss" scoped>
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

.stock-val {
  font-size: 40px;
}


.bg-img {
  // left: 10px;
  position: relative;
  height: 100%;
  object-fit: fit;
  opacity: 0.5;
}

::v-deep .el-card__body {
  padding: 0;
  height: 200px;
}
</style>
