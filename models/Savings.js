const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const savingSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  saving_amount: {
    type: Number,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  saving_date: {
    type: String,
    required: true,
  },
  saving_comment: {
    type: String,
    default: "",
  },
  update_from: {
    type: String,
    default: "SAVE",
  },
  saving_date_time: {
    type: Date,
    default: Date.now,
  },
});

const Saving = mongoose.model("Saving", savingSchema, "savings");

module.exports = Saving;
