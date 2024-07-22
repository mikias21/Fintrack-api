const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const savingExpenseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  spending_amount: {
    type: Number,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  spending_date: {
    type: String,
    required: true,
  },
  spending_comment: {
    type: String,
    default: "",
  },
  update_from: {
    type: String,
    default: "SAV_EXP",
  },
  spending_date_time: {
    type: Date,
    default: Date.now,
  },
});

const SavingExpense = mongoose.model(
  "savingExpenseSchema",
  savingExpenseSchema,
  "savingExpenses"
);

module.exports = SavingExpense;
