<template>
  <div class="barcode-container">
    <el-button
      ref="refresh"
      @click="refresh"
      icon="el-icon-refresh-right"
      class="renew"
    ></el-button>
    <goods-selector ref="selector" @submit="genCode" />

    <q-r-code style="margin-top: 50px" v-show="this.goods" ref="qrcode"></q-r-code>
  </div>
</template>

<script>
import GoodsSelector from '@/components/GoodSelector'
import QRCode from '@/components/QRCode';

export default {
  components: { GoodsSelector, QRCode },

  data() {
    return {
      goods: null
    };
  },

  mounted() {
    this.refresh()
  },

  methods: {
    refresh() {
      this.$refs.selector.renew();
    },

    genCode(goods) {
      this.goods = goods
      this.$refs.qrcode.genCode(goods)
    },
  },
};
</script>

<style lang="scss" scoped>
.barcode-container {
  padding: 20px;
}

.renew {
  margin-bottom: 20px;
}

.subcontainer {
  margin-top: 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
