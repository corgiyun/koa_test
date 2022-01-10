const Koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body');
const path = require('path');
const parameter = require('koa-parameter');
const koaStatic = require('koa-static')
const mongoose = require('mongoose')
const routing = require('./routes')

const app = new Koa();
const router = new Router()
const { connectionStr } = require('./config')

mongoose.connect(
  connectionStr, // 数据库地址
  { userUnifiedTopology: true, useNewUrlParse: true },
  ()=> console.log('mongoose 连接成功!')
)
mongoose.connection.on('error', console.error)

app.use(koaStatic(path.join(__dirname, "public"))) // 静态资源

app.use(error({ // 错误处理
  postFormat: (e, {stack, ...rest})=> {
    process.env.NODE_ENV = "production" ? rest : {stack, ...rest}
  }
}))

app.use(koaBody({ // 处理 post 请求和图片上传
  multipart: true, // 支持文件上传
  encoding: 'gzip',
  formidable: {
    uploadDir: path.join(__dirname, 'public/uploads'), // 设置文件上传目录
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
    onFileBegin: (name, file)=> { // 上传文件前的设置
      console.log(name);
      console.log(file);
    }
  }
}))

app.use(parameter(app)) // 参数校验

routing(app) // 路由处理

// router.get("/", async (ctx)=> {
//   ctx.body = { message: "Hello World!" }
// })


app.listen(3001, ()=> console.log("程序启动在3001端口了！"))

