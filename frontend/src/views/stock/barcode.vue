<template>
  <el-dialog
    v-loading="loading"
    :element-loading-text="loadingText"
    :visible.sync="visible"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    title="二维码"
  >
    <q-r-code ref="qrcode"></q-r-code>
  </el-dialog>
</template>

<script>
import QRCode from "@/components/QRCode";

export default {
  name: "Barcode",
  components: { QRCode },

  computed: {
    title() {
      if (this.stock.good) {
        return `${this.stock.good.provider.name} --- ${this.stock.good.code} --- ${this.stock.size}`;
      } else {
        return "";
      }
    },
  },
  data() {
    return {
      loading: false,
      loadingText: "",
      visible: false,
      // stock: {},
    };
  },

  mounted() {
    this.$bus.$on("commit", (data) => {
      if (this.visible) {
        this.$parent.delayLoad();
        this.visible = false;
      }
    });
  },

  beforeDestroy() {
    this.$bus.$off("commit");
  },

  methods: {
    show(stock) {
      // this.stock = { ...stock };
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.qrcode.genCode(stock);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
</style>