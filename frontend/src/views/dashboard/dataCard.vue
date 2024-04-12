<template>
    <el-card shadow="always">
        <div class="card-wrapper">
            <span class="title">{{title}}</span>
            <span class="value" style="margin-left: 30px;">{{value}}</span>
            </div>
    </el-card>
</template>

<script>

export default {
  name: "DataCard",
  props: {
    title: String,
    value: Number
  },



};
</script>

<style lang="scss" scoped>

.card-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.value {
  font-size: 40px;
}



::v-deep .el-card__body {
  padding: 0;
  height: 200px;
}
</style>
