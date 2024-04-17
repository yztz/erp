export default {
  methods: {
    gotoStock(goodCode) {
      this.$router.push({ name: 'Stock', params: { code: goodCode }})
    },
  },
}
