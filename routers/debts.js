const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Debt = require("../models/Debts");

router.get("/debts/:user_id", async (req, res) => {
  try {
    const debts = await Debt.find({ user_id: req.params.user_id });
    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching debts", error });
  }
});

router.get("/debts/:id/:user_id", async (req, res) => {
  try {
    const userId = req.query.user_id;
    const debt = await Debt.find({
      _id: req.params.id,
      user_id: req.params.user_id,
    });
    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }
    res.status(200).json(debt);
  } catch (error) {
    res.status(500).json({ message: "Error fetching debt", error });
  }
});

router.post("/debts", async (req, res) => {
  const { debt_amount, debt_date, debt_from, debt_comment, user_id } = req.body;

  const newDebt = new Debt({
    _id: uuidv4(),
    debt_amount,
    debt_date,
    debt_from,
    debt_comment,
    user_id,
  });

  try {
    const savedDebt = await newDebt.save();
    res.status(201).json(savedDebt);
  } catch (error) {
    res.status(500).json({ message: "Error creating debt", error });
  }
});

router.put("/debts/:id/:user_id", async (req, res) => {
  const { debt_amount, debt_date, debt_from, debt_comment } = req.body;
  const { id, user_id } = req.params;

  try {
    const updatedDebt = await Debt.findOneAndUpdate(
      { _id: id, user_id: user_id },
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

router.put("/debts/pay/:id/:user_id", async (req, res) => {
  const { id, user_id } = req.params;

  try {
    const debt = await Debt.findOne({ _id: id, user_id: user_id });
    const { debt_paid_amount, debt_paid_date } = req.body;

    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    if (debt_paid_amount > debt.debt_amount) {
      return res.status(400).json({
        message: "The amount you are paying is more than the money you owe",
      });
    } else {
      debt.debt_amount -= debt_paid_amount;
    }

    if (debt.debt_amount == 0) {
      debt.debt_paid = true;
    } else {
      debt.debt_paid = false;
    }

    debt.debt_paid_details = [
      ...debt.debt_paid_details,
      { paid_amount: debt_paid_amount, paid_date: debt_paid_date },
    ];

    const updatedDebt = await debt.save();

    res.status(200).json(updatedDebt);
  } catch (error) {
    res.status(500).json({ message: "Error updating debt", error });
  }
});

router.delete("/debts/:id/:user_id", async (req, res) => {
  const { id, user_id } = req.params;

  try {
    const deletedDebt = await Debt.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });

    if (!deletedDebt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    res.status(200).json({ message: "Debt deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting debt", error });
  }
});

module.exports = router;
