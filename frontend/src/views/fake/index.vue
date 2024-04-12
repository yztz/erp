<template>
  <div v-loading="loading" class="fake-container">

    <el-button @click="genProviders(5)">
      生成5个供应商
    </el-button>

    <el-button @click="genGoods(5)">
      生成5个商品
    </el-button>

    <el-button @click="genGoods(100)">
      生成100个商品
    </el-button>

    <el-button @click="genStock(5)">
      生成5个库存
    </el-button>
  </div>
</template>

<script>
import { fakerZH_CN as faker } from '@faker-js/faker'
import * as Provider from '@/api/provider'
import * as Goods from '@/api/goods'
import * as Stock from '@/api/stock'
import assert from 'assert'

export default {
  name: 'index',
  data() {
    return {
      loading: false
      // goodsList: [],
      // providersList: [],
    }
  },

  methods: {
    async getGoodsList() {
      let { data } = await Goods.queryAll({
        pagination: {
          limit: -1
        }
      })
      return data
    },

    async getProvidersList() {
      let { data } = await Provider.queryAll({
        pagination: {
          limit: -1
        }
      })
      return data
    },
    async genProviders(count = 5) {
      this.loading = true
      for (let i = 1; i <= count; i++) {
        // 生成供应商名称
        const name = faker.company.name()

        // 生成供应商地址
        const address = faker.location.streetAddress()

        // 生成供应商电话
        const phone = faker.phone.number()

        // 打印生成的供应商数据
        console.log(`供应商 #${i}:`)
        console.log('供应商名称:', name)
        console.log('供应商地址:', address)
        console.log('供应商电话:', phone)
        console.log('------------------------')

        let res = await Provider.add({
          name, phone, address
        })
      }
      this.loading = false
      this.$message.success("成功")
    },
    async genGoods(count = 5) {
      this.loading = true

      let providers = await this.getProvidersList()

      if (providers.length === 0) {
        this.$message.error('没有可用供应商')
        return
      }

      for (let i = 1; i <= count; i++) {
        const randomPart1 = faker.string.alphanumeric(3).toUpperCase()
        const randomPart2 = faker.number.int({ min: 100, max: 999 })
        const randomPart3 = faker.string.alphanumeric(2).toUpperCase()

        const code = `${randomPart1}-${randomPart2}-${randomPart3}`
        const color = faker.internet.color()
        const provider = providers[faker.number.int({ min: 0, max: providers.length - 1 })].id
        const purchase_price = faker.number.float({min: 0})
        const sale_price = faker.number.float({min: 0})
        const comment = faker.lorem.sentence()

        // 打印生成的供应商数据
        console.log(`商品 #${i}:`)
        console.log('商品货号:', code)
        console.log('商品颜色:', color)
        console.log('商品供应商:', provider)
        console.log('商品备注:', comment)
        console.log('商品成本:', purchase_price)
        console.log('商品售价:', sale_price)
        console.log('------------------------')

        let res = await Goods.add({
          code, color, provider, comment, sale_price, purchase_price
        })
      }
      this.loading = false
      this.$message.success("成功")

    },

    async genStock(count = 5) {
      this.loading = true
      let goods = await this.getGoodsList()
      // console.log(goods)
      if (goods.length === 0) {
        this.$message.error('没有可用商品')
        return
      }

      for (let i = 1; i <= count; i++) {

        const good = goods[faker.number.int({ min: 0, max: goods.length - 1 })].id
        const size = faker.number.float({ min: 35, max: 50, precision: 0.5 }) + ""
        const amount = faker.number.int({ min: -200, max: 500 })

        // 打印生成的供应商数据
        console.log(`库存 #${i}:`)
        console.log('库存货号ID:', good)
        console.log('库存尺寸:', size)
        console.log('库存数量:', amount)
        console.log('------------------------')

        let res = await Stock.addStock({
          good, size, amount
        })
      }
      this.loading = false
      this.$message.success("成功")

    }
  }
}
</script>

<style lang="scss" scoped>
.fake-container {
  margin: 20px;

  > *:not(:last-child) {
    margin-right: 10px;
  }
}
</style>
