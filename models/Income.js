const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const incomeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  income_amount: {
    type: Number,
    required: true,
  },
  income_date: {
    type: String,
    required: true,
  },
  income_reason: {
    type: String,
    required: true,
  },
  income_comment: {
    type: String,
    default: "",
  },
  update_from: {
    type: String,
    default: "INC",
  },
  income_date_time: {
    type: Date,
    default: Date.now,
  },
});

const Income = mongoose.model("Income", incomeSchema, "incomes");

module.exports = Income;
