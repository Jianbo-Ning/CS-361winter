module.exports = function () {
  return function (ctx, next) {
    switch (ctx.status) {
      case 404:
        ctx.body = 'Not Found - 404'
        break
    }
    return next()
  }
}
