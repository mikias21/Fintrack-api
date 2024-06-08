const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const debtSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  debt_amount: {
    type: Number,
    required: true,
  },
  debt_date: {
    type: String,
    required: true,
  },
  debt_from: {
    type: String,
    required: true,
  },
  debt_comment: {
    type: String,
    default: "",
  },
  debt_paid: {
    type: Boolean,
    default: false,
  },
  update_from: {
    type: String,
    default: "DEBT",
  },
  debt_date_time: {
    type: Date,
    default: Date.now,
  },
});

const Debt = mongoose.model("Debt", debtSchema, "debts");

module.exports = Debt;
