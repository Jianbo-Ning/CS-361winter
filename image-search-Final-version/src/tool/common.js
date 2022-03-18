import {System} from '../config'
import crypto from 'crypto'

export const md5 = (str) => {
  // 注意参数需要为 String 类型，否则会出错
  return crypto.createHash('md5')
      .update(String(str)).digest('hex')
}
