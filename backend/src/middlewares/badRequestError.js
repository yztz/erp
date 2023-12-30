module.exports = () => {
  return async(ctx, next) => {
    try {
      await next()
    } catch (e){
      // console.log
      // console.log(ctx.response.status)
      if (ctx.request.url === '/api/auth/local' && ctx.response.status === 404) {
        e.message = '账号或密码错误'
      }
      // console.log(e)
      throw e
    }
  }
}
