<template>
  <el-dialog
    v-loading="loading"
    :element-loading-text="loadingText"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="新建库存"
  >

    <goods-selector button-title="提  交" ref="form" @submit="add"/>

  </el-dialog>
</template>

<script>
import GoodsSelector from '@/components/GoodSelector'
import { addStock } from '@/api/stock'

const MODE_NEW = 0
const MODE_EDIT = 1
export default {
  name: 'stockCreator',
  components: { GoodsSelector },
  data() {
    return {
      mode: MODE_NEW,
      visible: false,
      loading: false,
    }
  },

  computed: {
    loadingText() {
      return this.mode === MODE_NEW ? '创建中': '修改中'
    },
    loadingSuccess() {
      return this.mode === MODE_NEW ? '创建成功': '修改成功'
    },
    loadingFail() {
      return this.mode === MODE_NEW ? '创建失败': '修改失败'
    },
    title() {
      return this.mode === MODE_NEW ? '新建库存': '修改库存'
    }
  },

  methods: {

    genSubmitData(goods) {
      return {
        amount: goods.amount,
        good: goods.good.id,
        size: goods.size
      }
    },
    add(goods) {
      // console.log(goods)
      this.loading = true
      goods = this.genSubmitData(goods)
      addStock(goods).then(res=>{
        this.loading = false
        this.$message.success(this.loadingSuccess)
        this.$emit("close")
        this.visible = false
      }).catch(err=>{
        this.$message.error(this.loadingFail)
      })
    },
    show() {
      // console.log(goods)
      // this.purchases = this.getDefaultPurchases()
      // this.mode = goods ? MODE_EDIT : MODE_NEW
      this.visible = true
      this.$nextTick(() => {
        this.$refs.form.renew()
      })
    },

    // close(save) {
    //   if (!save) {
    //     this.$emit('close')
    //     this.visible = false
    //     return
    //   }
    // }
  },
}
</script>

<style scoped>

</style>
