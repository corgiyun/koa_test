const User = require("../models/users");
const jsonwebtoken = require("jsonwebtoken");
// const PRIVATE_KEY = fs.readFileSync("../rsa.private");
const { secret } = require("../config");
class UserController {
  async find(ctx) {
    // 查询用户列表分业
    const { per_page = 10 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const prePage = Math.max(per_page * 1, 1);
    ctx.body = await User.find({ name: new RegExp(ctx.query.q) })
      .limit(prePage)
      .skip(page * prePage);
  }

  async findById(ctx) {
    // 根据 id 查询特定用户信息
    const { fields } = ctx.query;
    const selectFields =
      fields &&
      fields
        .split(";")
        .filter((f) => f)
        .map((f) => "+" + f)
        .join("");
    const populateStr =
      fields &&
      fields
        .split(";")
        .filter((f) => f)
        .map((f) => {
          if (f === "employments") {
            return "employments.company employments.job";
          }
          if (f === "eductions") {
            return "educations.school educations.major";
          }
          return f;
        })
        .join("");

    const user = await User.findById(ctx.params.id)
      .select(selectFields)
      .populate(populateStr);
    if (!user) {
      ctx.throw(404, "用户不存在!!");
    }
    ctx.body = user;
  }

  async create(ctx) {
    // 创建用户
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true },
    });
    const { name } = ctx.request.body;
    const repeatedUser = await User.findOne({ name });
    if (repeatedUser) {
      ctx.throw(409, "用户名已存在");
    }
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
  }

  async checkOwner(ctx, next) {
    // 判断用户身份合法性
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }

  async update(ctx) {
    // 更新用户信息
    ctx.verifyParams({
      name: { type: "string", required: false },
      password: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      gender: { type: "string", required: false },
      headline: { type: "string", required: false },
      locations: { type: "array", itemType: "string", required: false },
      business: { type: "string", required: false },
    });
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user;
  }

  async delete(ctx) {
    // 删除用户
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.status = 204;
  }

  async login(ctx) {
    // 登录
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true },
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) {
      ctx.throw(401, "用户名或密码不正确");
    }
    const { _id, name } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, {
      expiresIn: "1d",
    });
    ctx.body = { token };
  }

  async checkUserExist(ctx, next) {
    // 查询用户是否存在
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在!!!");
      await next();
    }
  }
}

module.exports = new UserController();
