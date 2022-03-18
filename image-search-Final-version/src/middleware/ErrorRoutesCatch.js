module.exports = function () {
  return async function (ctx, next) {
    return next().catch((err) => {
      switch (err.status) {
        case 401:
          ctx.status = 200
          ctx.body = {
            status: 401,
            result: {
              err: 'Authentication Error',
              errInfo: 'Protected resource, use Authorization header to get access.'
            }
          }
          break
        case 403:
          ctx.status = 200
          ctx.body = {
            status: 403,
            result: {
              err: 'No Permission',
              errInfo: 'Protected resource, no Permission to get access.'
            }
          }
          break
        default:
          throw err
      }
    })
  }
}
