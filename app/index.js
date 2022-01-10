const Koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body')

const app = new Koa();
const router = new Router()

router.get("/", async (ctx)=> {
  ctx.body = { message: "Hello World!" }
})

app.use(router.routes()).use(router.allowedMethods())

app.use

app.listen(3001)

