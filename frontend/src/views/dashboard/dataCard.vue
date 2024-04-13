<template>
    <el-card shadow="always">
        <div class="card-wrapper">
            <span class="title">{{title}}</span>
            <span class="value">{{value}}</span>
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
  width: 75%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 30px;
}

.el-card {
  min-width: 250px;
}

.value {
  font-size: 40px;
}


::v-deep .el-card__body {
  padding: 0;
  height: 150px;
  display: flex;
  justify-content: center;
}
</style>
