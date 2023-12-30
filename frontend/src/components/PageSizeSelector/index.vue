<template>
  <div class="selector-container">
    <el-select :value="value" slot="prepend" placeholder="请选择" @change="select">
      <el-option v-for="o in options" :key="o.value" :label="o.label" :value="o.value"></el-option>
    </el-select>
    <div class="tip-container">
      <span>个 / 页</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'index',
  props: {
    value: Number
  },
  data() {
    return {
      options: [
        {label: '5', value: 5},
        {label: '10', value: 10},
        {label: '15', value: 15},
        {label: '20', value: 20},
      ]
    }
  },
  methods: {
    select(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.selector-container {
  display: flex;
}
.tip-container {
  display: flex;
  justify-content: center;
  width: 70px;
  border-radius: 0 4px 4px 0;
  line-height: 40px;
  height: 40px;
  font-size: 14px;
  border: 1px solid #DCDFE6;
  border-left: none;
}

::v-deep .el-select input {
  width: 66px;
  border-radius: 4px 0 0 4px;

}
</style>
