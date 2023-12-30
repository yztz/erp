<template>
  <div class="selector-container">
    <el-form :rules="rules" label-position="left" label-width="80px" ref="form" :model="goods">

      <el-form-item prop="provider" label="供应商">
        <el-select value-key="id" style="width: 100%" filterable :loading="loadingProviders" @change="providerSelected"
                   v-model="goods.provider"
                   placeholder="请选择供应商"
        >
          <el-option
            v-for="item in providersList"
            :key="item.id"
            :label="item.name"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="good" label="商品">
        <el-select value-key="id" style="width: 100%" filterable :loading="loadingGoods" v-model="goods.good"
                   placeholder="请选择货号"
        >
          <el-option
            v-for="item in goodsList"
            :key="item.id"
            :label="item.code"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="size" label="尺寸">
        <el-input v-model="goods.size" placeholder="S, M, L, XL, 36, 37, 41..."/>
      </el-form-item>

      <el-form-item prop="amount" label="数量">
        <el-input-number :min="1" v-model="goods.amount"></el-input-number>
      </el-form-item>
    </el-form>

    <div class="purchase-options">
      <el-button style="width: 100%" @click="addGoods" type="primary">{{ buttonTitle }}</el-button>
      <!--      <el-button @click="closeEditor(true)" type="primary">确 定</el-button>-->
    </div>
  </div>
</template>

<script>
import * as Goods from '@/api/goods'
import * as Provider from '@/api/provider'
import assert from 'assert'

export default {
  name: 'goodsSelector',
  props: {
    buttonTitle: {
      type: String,
      default: '添 加'
    }
  },
  data() {
    return {
      goods: this.getDefaultGoods(),
      goodsList: [],
      providersList: [],
      loadingGoods: false,
      loadingProviders: false,
      rules: {
        amount: { required: true, message: '该字段不能为空', trigger: 'change' },
        size: [
          { required: true, message: '该字段不能为空', trigger: 'change' },
          { min: 1, message: '长度至少为1', trigger: 'change' }
        ],
        provider: { required: true, message: '该字段不能为空', trigger: 'change' },
        good: { required: true, message: '该字段不能为空', trigger: 'change' }
      }
    }
  },

  methods: {
    renew(goods) {
      // this.$refs.form.clearValidate()
      this.goods = goods || this.getDefaultGoods()
      this.getProvidersList()
    },

    getDefaultGoods() {
      return {
        provider: null,
        amount: 1,
        size: '',
        good: null
      }
    },
    providerSelected(item) {
      if (item) {
        this.clearGoodsList()
        this.getGoodsList()
      }
    },

    clearGoodsList() {
      this.goodsList = []
      this.goods.good = null
    },

    getGoodsList() {
      this.loadingText = '正在获取商品'
      this.loadingGoods = true
      Goods.queryAll({
        filters: {
          provider: {
            id: {
              $eq: this.goods.provider.id
            }
          }
        }
      }).then(res => {
        console.log(res)
        this.goodsList = res.data
        this.loadingGoods = false
      }).catch(err => {
        this.$message.error('加载货号列表失败')
      })
    },

    getProvidersList() {
      this.loadingText = '正在获取供应商'
      this.loadingProviders = true
      Provider.queryAll({
        pagination: {
          limit: -1
        }
      }).then(res => {
        let { data, meta: { pagination } } = res
        assert(pagination.total <= pagination.limit)
        this.providersList = data
        this.loadingProviders = false
      }).catch(err => {
        this.$message.error('加载供应商列表失败')
      })
    },

    addGoods() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', this.goods)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
