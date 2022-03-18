import dayjs from 'dayjs'

// 格式化时间
const formatTime = time => dayjs(time).format('YYYY-MM-DD HH:mm:ss')

// 处理成功响应
const success = ({ctx, data = null, msg = 'OK'}) => {
  ctx.body = {
    status: 200,
    data: data,
    msg
  }
  ctx.status = 200
}

// 请求错误
const error = ({ctx, data = null, msg = 'ERROR'}) => {
  ctx.body = {
    status: 210,
    data: data,
    msg
  }
}

module.exports = {
  formatTime,
  success,
  error
}
