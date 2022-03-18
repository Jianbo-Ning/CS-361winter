import KoaRouter from 'koa-router'
import controllers from '../controllers'

const router = new KoaRouter()

router.all('/api/get', controllers.main.get)
router.all('/api/search', controllers.main.search)
router.get('/', controllers.main.index)


export default router

