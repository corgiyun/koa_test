const Koa = require("koa");
const koaBody = require("koa-body");
const path = require("path");
const parameter = require("koa-parameter");
const koaStatic = require("koa-static");
const mongoose = require("mongoose");
const routing = require("./routes");
const error = require("koa-json-error");

const app = new Koa();
const { connectionStr } = require("./config");

mongoose.connect(
  connectionStr, // 数据库地址
  {
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    useNewUrlParser: true,
  },
  () => console.log("mongoose 连接成功!")
);
mongoose.connection.on("error", console.error);

app.use(koaStatic(path.join(__dirname, "public"))); // 静态资源

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*'); // 允许跨域
  ctx.set('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,HEAD,PUT,DELETE'); // 支持的方法
  ctx.set('Access-Control-Allow-Credentials', 'true'); // 允许传入Cookie
  ctx.set('Access-Control-Max-Age', 2592000); // 过期时间一个月
  // 如果有特殊的请求头，直接响应
  if (ctx.get('Access-Control-Request-Headers')) {
      ctx.set('Access-Control-Allow-Headers', ctx.get('Access-Control-Request-Headers'));
  }
  // FIX：浏览器某些情况下没有带Origin头
  ctx.set('Vary', 'Origin');

  // 如果是 OPTIONS 请求，则直接返回
  if (ctx.method === 'OPTIONS') {
      ctx.status = 204;
      return;
  }

  await next();
});

app.use(
  error({
    // 错误处理
    postFormat: (e, { stack, ...rest }) => {
      process.env.NODE_ENV = "production" ? rest : { stack, ...rest };
    },
  })
);

app.use(
  koaBody()
);

app.use(parameter(app)); // 参数校验

routing(app); // 路由处理

app.listen(3000, () => console.log("程序启动在3000端口了！"));
