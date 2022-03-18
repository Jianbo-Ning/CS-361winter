module.exports = function () {
  return async (ctx, next) => {
    await next({ctx})
  }
}
