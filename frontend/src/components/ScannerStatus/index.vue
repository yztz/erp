<template>
  <div class="scanner-wrapper">
    <p v-if="scanner"><span class="circle green"> </span>扫码器连接成功</p>
    <p v-else>
      <span class="circle red"> </span>扫码器连接失败
      <el-button
        style="margin-left: 7px"
        type="text"
        icon="el-icon-refresh-right"
        @click="connectScanner"
        >重试</el-button
      >
    </p>
  </div>
</template>

<script>
export default {
  name: "ScannerStatus",
  sockets: {
    "barcode.result": function (data) {
      this.scanner = true
      this.handleScan(data)
    },
    "barcode.commit": function () {
      this.scanner = true
      this.handleCommit()
    },
    "barcode.found": function () {
      this.$message.success("扫码器连接成功");
      this.scanner = true;
    },
  },
  data() {
    return {
      scanner: false
    }
  },

  mounted() {
    this.connectScanner()
  },

  methods: {
    handleScan(data) {
      let obj = JSON.parse(data)
      this.$bus.$emit('scan', obj)
    },

    handleCommit() {
      this.$bus.$emit('commit')
    },

    connectScanner() {
      this.$socket.emit("barcode.discover");
    },
  }

};
</script>

<style lang="scss" scoped>

.scanner-wrapper {
  display: flex;
  align-items: center;
}

.circle {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 7px;
  margin-left: 5px;
}

.green {
  background-color: rgb(32, 202, 32);
}

.red {
  background-color: red;
}
</style>
