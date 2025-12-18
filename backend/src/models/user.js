const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MODELNAME = "user";

const Schema = new mongoose.Schema(
  {
    _id: { type: String },

    email: { type: String, unique: true, required: true, trim: true },
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    password: String,
    last_login_at: { type: Date, default: Date.now },
    captured: { type: [Number], default: [] },
    resetCode: { type: String, default: null },
    resetCodeExpires: { type: Date, default: null },
  },
  { timestamps: true, _id: false }
);

Schema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;