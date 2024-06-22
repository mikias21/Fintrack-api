const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Expense = require("../models/Expenses");

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

  const newExpense = new Expense({
    _id: uuidv4(),
    expense_amount,
    expense_date,
    expense_reason,
    expense_comment,
    user_id,
  });

  try {
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error });
  }
});

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
