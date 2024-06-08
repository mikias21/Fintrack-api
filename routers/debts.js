const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Debt = require("../models/Debts");

router.get("/debts", async (req, res) => {
  try {
    const debts = await Debt.find();
    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching debts", error });
  }
});

router.get("/debts/:id", async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }
    res.status(200).json(debt);
  } catch (error) {
    res.status(500).json({ message: "Error fetching debt", error });
  }
});

router.post("/debts", async (req, res) => {
  const { debt_amount, debt_date, debt_from, debt_comment } = req.body;

  const newDebt = new Debt({
    _id: uuidv4(),
    debt_amount,
    debt_date,
    debt_from,
    debt_comment,
  });

  try {
    const savedDebt = await newDebt.save();
    res.status(201).json(savedDebt);
  } catch (error) {
    res.status(500).json({ message: "Error creating debt", error });
  }
});

router.put("/debts/:id", async (req, res) => {
  const { debt_amount, debt_date, debt_from, debt_comment } = req.body;

  try {
    const updatedDebt = await Debt.findByIdAndUpdate(
      req.params.id,
      {
        debt_amount,
        debt_date,
        debt_from,
        debt_comment,
        expense_date_time: Date.now(), // Update the date time
      },
      { new: true }
    );

    if (!updatedDebt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    res.status(200).json(updatedDebt);
  } catch (error) {
    res.status(500).json({ message: "Error updating debt", error });
  }
});

router.delete("/debts/:id", async (req, res) => {
  try {
    const deletedDebt = await Debt.findByIdAndDelete(req.params.id);

    if (!deletedDebt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    res.status(200).json({ message: "Debt deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting debt", error });
  }
});

module.exports = router;
