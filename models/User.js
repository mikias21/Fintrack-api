const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  user_name: {
    type: String,
  },
  user_password: {
    type: String,
  },
  signin_date_time: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
