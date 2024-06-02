const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const expenseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  expense_amount: {
    type: Number,
    required: true,
  },
  expense_date: {
    type: String,
    required: true,
  },
  expense_reason: {
    type: String,
    required: true,
  },
  expense_comment: {
    type: String,
    default: "",
  },
  expense_date_time: {
    type: Date,
    default: Date.now,
  },
});

const Expense = mongoose.model("Expense", expenseSchema, "expenses");

module.exports = Expense;
