const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const Expense = require("../models/Expenses");
const User = require("../models/User");
const {validateNumericAmount, validateDateInputs} = require("../utils/validators");
const EXPENSE_REASON = ['FOOD AND DRINKS', 'CLOTHING', 'INTERNET', 'GOING OUT', 'OTHERS'];

router.get("/expenses/:user_id", async (req, res) => {
  try {
    const expenses = await Expense.find({ user_id: req.params.user_id });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error });
  }
});

router.get("/expenses/:id/:user_id", async (req, res) => {
  try {
    const expense = await Expense.find({
      _id: req.params.id,
      user_id: req.params.user_id,
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error });
  }
});

router.post("/expenses", async (req, res) => {
  const {
    expense_amount,
    expense_date,
    expense_reason,
    expense_comment,
    user_id,
  } = req.body;

  // validate income_amount
  const expenseAmountValidation = validateNumericAmount(expense_amount);
  if(!expenseAmountValidation["verdict"]){
    return res.status(400).json({message: expenseAmountValidation["message"]});
  }

  // validate income_date
  const dateValidation = validateDateInputs(expense_date);
  if(!dateValidation["verdict"]){
    return res.status(400).json({message: dateValidation["message"]});
  }

  // validate income_reason
  let reason = expense_reason.trim().toUpperCase();
  let foundReason = false;
  EXPENSE_REASON.forEach(item => {
    if(item.trim() === reason) foundReason = true;
  });
  if(!foundReason){
    return res.status(400).json({message: "Invalid reason selected, choose from the list."})
  }

  // Validate user ID
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(404).json({message: "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable finding user record. Try again in a bit."});
  }

  const newExpense = new Expense({
    _id: uuidv4(),
    expense_amount,
    expense_date,
    expense_reason,
    expense_comment,
    user_id,
  });

  // Check user id

  try {
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error });
  }
});

// When this route is used, input has to be validated
router.put("/expenses/:id", async (req, res) => {
  const { expense_amount, expense_date, expense_reason, expense_comment } =
    req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        expense_amount,
        expense_date,
        expense_reason,
        expense_comment,
        expense_date_time: Date.now(), // Update the date time
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error });
  }
});

router.delete("/expenses/:id/:user_id", async (req, res) => {
  const { id, user_id } = req.params;

  // Validate user ID
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(404).json({message: "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable finding user record. Try again in a bit."});
  }

  // Validate Income ID
  try {
    const expense = await Expense.find({
      _id: id,
      user_id: user_id,
    });
    if (expense.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching income", error });
  }

  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
});

module.exports = router;
