<template>
  <div class="qr-container">
    <div class="qr-wrapper" id="qr-wrapper">
      <canvas ref="barcode" id="barcode"></canvas>
      <div class="info-container">
        <div class="line">
          <span class="title">货号:</span><span class="value">{{ code }}</span>
        </div>
        <div class="line">
          <span class="title">颜色:</span><span class="value">{{ color }}</span>
        </div>
        <div class="line">
          <span class="title">尺寸:</span><span class="value">{{ size }}</span>
        </div>
      </div>
    </div>

    <div class="op-container">
      <el-button type="primary" @click="saveCode"
        >保存<i class="el-icon-download el-icon--right"></i
      ></el-button>
      <el-button style="margin-left: 50px" type="primary" @click="print"
        >打印<i class="el-icon-printer el-icon--right"></i
      ></el-button>
    </div>
  </div>
</template>

<script>
import generateQR from "@/utils/qrcode";
import printJS from "print-js";

export default {
  name: "QRCode",
  directives: {
    print,
  },
  computed: {
    code() {
      return this.stock.good?.code || "(null)";
    },
    color() {
      return this.stock.good?.color || "(null)";
    },
    size() {
      return this.stock.size || "(null)";
    },
  },
  data() {
    return {
      stock: {},
    };
  },
  methods: {
    genCode(stock) {
      this.stock = { ...stock };
      generateQR(this.$refs.barcode, stock);
    },
    saveCode() {
      // console.log(this.$refs.canvas);
      var canvas = this.$refs.barcode;

      // 创建一个图像的Data URL
      var dataURL = canvas.toDataURL("image/png");
      // 创建一个新的a元素
      var downloadLink = document.createElement("a");
      // 设置它的href属性为Data URL
      downloadLink.href = dataURL;
      // 设置下载的文件名
      downloadLink.download = `${this.code}-${this.color}-${this.size}.png`;
      // 模拟点击a元素
      downloadLink.click();
    },
    print() {
      // let el = document.querySelector("#qr-wrapper")
      printJS({
        printable: "qr-wrapper",
        type: "html",
        // maxWidth: 378,
        style: `
          .qr-wrapper {width: 100mm !important;height: 50mm !important;display: flex;justify-content: center;align-items: center;}
          .op-container {margin-top: 10px;display: flex;justify-content: center;}
          .info-container {margin-left: 20px;display: flex;flex-direction: column;font-size: 1.1rem;color: black;font-weight: bold;}
          .line {margin-bottom: 10px;}
          .value {margin-left: 10px;}
        `,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.qr-container {
  display: flex;
  flex-direction: column;

  align-items: center;
}

.qr-wrapper {
  // width: 100%;
  width: 100mm;
  display: flex;
  justify-content: center;
}

.op-container {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.info-container {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  font-size: 1.1rem;
  color: black;
  font-weight: bold;
}
.line {
  margin-bottom: 10px;
}

.value {
  margin-left: 10px;
}
</style>