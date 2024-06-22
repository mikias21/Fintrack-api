const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Income = require("../models/Income");

router.get("/incomes/:user_id", async (req, res) => {
  try {
    const incomes = await Income.find({ user_id: req.params.user_id });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching incomes", error });
  }
});

router.get("/incomes/:id/:user_id", async (req, res) => {
  try {
    const income = await Income.find({
      _id: req.params.id,
      user_id: req.params.user_id,
    });
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: "Error fetching income", error });
  }
});

router.post("/incomes", async (req, res) => {
  const { income_amount, income_date, income_reason, income_comment, user_id } =
    req.body;

  const newIncome = new Income({
    _id: uuidv4(),
    income_amount,
    income_date,
    income_reason,
    income_comment,
    user_id,
  });

  try {
    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    res.status(500).json({ message: "Error creating income", error });
  }
});

router.put("/incomes/:id", async (req, res) => {
  const { income_amount, income_date, income_reason, income_comment } =
    req.body;

  try {
    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      {
        income_amount,
        income_date,
        income_reason,
        income_comment,
        income_date_time: Date.now(), // Update the date time
      },
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: "Error updating income", error });
  }
});

router.delete("/incomes/:id/:user_id", async (req, res) => {
  const { id, user_id } = req.params;

  try {
    const deletedIncome = await Income.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });

    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting income", error });
  }
});

module.exports = router;
