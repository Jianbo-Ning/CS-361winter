import Koa2 from 'koa'
import KoaBody from 'koa-body'
import KoaStatic from 'koa-static2'
import {System} from './config'
import path from 'path'
import MainRoutes from './routes/main-routes'
import helper from './extend/helper'
import ErrorRoutesCatch from './middleware/ErrorRoutesCatch'
import Auth from './middleware/Auth'
import ErrorRoutes from './routes/error-routes'
import dayjs from 'dayjs'
import chalk from 'chalk'

const app = new Koa2()
const env = process.env.NODE_ENV || 'development' // Current mode
let start

app
    .use((ctx, next) => {
      start = new Date()
      if (ctx.request.header.host.split(':')[0] === 'localhost' || ctx.request.header.host.split(':')[0] === '127.0.0.1') {
        ctx.set('Access-Control-Allow-Origin', '*')
      } else {
        ctx.set('Access-Control-Allow-Origin', System.HTTP_server_host)
      }
      ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
      ctx.set('Access-Control-Allow-Credentials', true) // 允许带上 cookie
      return next()
    })
    .use((ctx, next) => {
      ctx.helper = helper
      return next()
    })
    .use(ErrorRoutesCatch())
    .use(KoaStatic('public', path.resolve(__dirname, '../public'))) // Webapp resource
    .use(KoaStatic('assets', path.resolve(__dirname, '../assets'))) // Static resource
    .use(Auth())
    .use(KoaBody({
      multipart: true,
      parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'], // parse GET, HEAD, DELETE requests
      formidable: {
        uploadDir: path.join(__dirname, '../assets/upload/tmp')
      },
      jsonLimit: '10mb',
      formLimit: '10mb',
      textLimit: '10mb'
    })) // Processing request
    // .use(PluginLoader(SystemConfig.System_plugin_path))
    .use(MainRoutes.routes())
    .use(MainRoutes.allowedMethods())
    .use(ErrorRoutes())

if (env === 'development') { // logger
  app.use((ctx, next) => {
    return next().then(() => {
      const ms = new Date() - start
      console.log(`[${chalk.gray(dayjs().format('YYYY-MM-DD HH:mm:ss'))}] ${chalk.cyan(getClientIP(ctx.req))} ${chalk.bold(ctx.method)} ${ctx.url} - ${chalk.green(ms + 'ms')}`)
    })
  })
}

function getClientIP(req) {
  let ip = req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || ''
  if (ip) {
    ip = ip.replace('::ffff:', '')
  }
  return ip
}


app.listen(System.API_server_port)

let address
let interfaces = require('os').networkInterfaces()
for (let devName in interfaces) {
  if (interfaces.hasOwnProperty(devName)) {
    let iFace = interfaces[devName]
    for (let i = 0; i < iFace.length; i++) {
      let alias = iFace[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        address = alias.address
      }
    }
  }
}


console.log('\n  App running at:')
console.log(`  - Local:   http://localhost:${System.API_server_port}`)
console.log(`  - Network: http://${address}:${System.API_server_port}\n`)

export default app
