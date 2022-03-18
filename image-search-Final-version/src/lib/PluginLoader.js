import fs from 'fs'
import path from 'path'
import compose from 'koa-compose'

function getDirs(srcPath) {
  return fs.readdirSync(srcPath).filter(file => {
    return fs.statSync(path.join(srcPath, file)).isDirectory()
  })
}

module.exports = (srcpath, filename = 'index.js') => {
  const plugins = {}
  const dirs = getDirs(srcpath)
  const list = []

  for (const name of dirs) {
    let fn = require(path.join(srcpath, name, filename))

    if (typeof fn !== 'function' && typeof fn.default === 'function') {
      fn = fn.default
    } else {
      throw (new Error('plugin must be a function!'))
    }

    plugins[name] = fn

    list.push(function (ctx, next) {
      return fn(ctx, next) || next()
    })
  }

  return compose(list)
}
