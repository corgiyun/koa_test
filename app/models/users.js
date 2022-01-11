const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userScheme = new Schema(
  {
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    avatar_url: { type: String },
    _id: { type: String },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
      required: true,
    },
    headline: { type: String },
    locations: {
      type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      select: false,
    },
    business: { type: Schema.Types.ObjectId, ref: "Topic", select: false },
  },
  { timestamps: true }
);
module.exports = model("Users", userScheme);
