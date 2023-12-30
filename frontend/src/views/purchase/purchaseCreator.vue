<template>
  <el-dialog
    v-loading="loading"
    :element-loading-text="loadingText"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="新建进货单"
  >

    <goods-selector ref="form" @submit="addPurchase"/>

    <el-table
      style="margin-top: 20px"
      border
      height="300px"
      empty-text="请在上方添加订单详情"
      row-key="id"
      :data="purchases.purchases"
    >
      <el-table-column align="center" prop="good.code" label="货号"/>
      <el-table-column align="center" prop="provider.name" label="供应商"/>
      <el-table-column align="center" prop="size" label="尺寸"/>
      <el-table-column align="center" prop="amount" label="数量"/>
      <el-table-column align="center" fixed="right" label="操作">
        <template v-slot="scope">
          <el-button
            @click="remove(scope.row)"
            type="danger"
            size="small"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-input style="margin-top: 20px" type="textarea" :rows="2" v-model="purchases.comment" autocomplete="off"
              placeholder="备注信息"
    />
    <el-switch style="margin-top: 20px" v-model="purchases.syncFlag" active-text="添加到库存" active-color="#13ce66"/>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close(false)">取 消</el-button>
      <el-button @click="close(true)" type="primary">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { queryPurchaseFromID, addPurchaseCollection, addPurchase } from '@/api/purchase'
import moment from 'moment/moment'
import assert from 'assert'
import * as Provider from '@/api/provider'
import * as Goods from '@/api/goods'
import GoodsSelector from '@/views/purchase/goodsSelector'

export default {
  name: 'purchaseCreator',
  components: { GoodsSelector },
  computed: {},
  data() {
    return {
      loadingText: '',
      loading: false,
      visible: false,
      purchases: this.getDefaultPurchases(),
    }
  },
  methods: {
    addPurchase(goods) {
      this.purchases.purchases.push({
        ...goods
      })
    },
    getDefaultPurchases() {
      return {
        comment: '',
        purchases: [],
        syncFlag: true
      }
    },

    remove(item) {
      // this.purchases.remove(item)
      this.purchases.purchases = this.purchases.purchases.filter(obj => obj !== item)
    },
    show() {
      this.purchases = this.getDefaultPurchases()
      this.visible = true
      this.$nextTick(() => {
        this.$refs.form.renew()
      })
    },

    close(save) {
      if (!save) {
        this.$emit('close')
        this.visible = false
        return
      }

      if (this.purchases.purchases.length === 0) {
        this.$message.warning('当前订单未包含任何商品')
        return
      }

      this.loadingText = '正在创建进货单'
      this.loading = true
      // addPurchaseCollection({ comment: this.purchases.comment }).then(res => {

      addPurchaseCollection(this.purchases).then(res => {
        let { data } = res
        console.log(res)

        setTimeout(() => {
          this.loading = false
          this.$message.success('创建成功')
          this.$emit('close')
          this.visible = false
        }, 500)
      }).catch(err => {
        this.$message.error('创建失败')
      })

    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 17px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  text-align: center;
}

</style>
