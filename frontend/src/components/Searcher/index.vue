<template>
  <span>
  <el-input
    style="width: 300px"
    prefix-icon="el-icon-search"
    @input="input"
    @change="search"
    v-model="value"
    clearable
    :disabled="disable"
    placeholder="输入关键字搜索"
  />
<!--    <svg-icon icon-class="question" class-name="question"/>-->
  </span>
</template>

<script>
export default {
  name: 'index',
  props: {
    debounce: {
      default: 500,
      type: Number
    },
    disable: Boolean,
    searchText: {
      default: '',
      type: String
    }
  },
  data() {
    return {
      timer: null,
      value: '',
      lastSearchText: ''
    }
  },
  mounted() {
    this.value = this.searchText
  },

  methods: {
    input(value) {
      value = value.trim()
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.lastSearchText = value
        this.$emit('search', value)
      }, this.debounce)
    },

    search(value) {
      value = value.trim()
      if (value === this.lastSearchText) return
      if (this.timer) clearTimeout(this.timer)
      this.$emit('search', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.question {
  margin-left: 10px;
  line-height: 40px;
  font-size: 23px;
  color: #DCDFE6;
  text-align: center;
}

</style>
