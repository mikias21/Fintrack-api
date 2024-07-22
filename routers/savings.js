const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Saving = require("../models/Savings");
const SavingExpense = require("../models/SavingExpenses");

router.get("/savings/:user_id", async (req, res) => {
  try {
    const savings = await Saving.find({ user_id: req.params.user_id });
    res.status(200).json(savings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching savings", error });
  }
});

router.get("/savings/:id/:user_id", async (req, res) => {
  try {
    const saving = await Saving.find({
      _id: req.params.id,
      user_id: req.params.user_id,
    });
    if (!saving) {
      return res.status(404).json({ message: "Saving not found" });
    }
    res.status(200).json(saving);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saving", error });
  }
});

router.post("/savings", async (req, res) => {
  const { saving_amount, saving_date, saving_comment, user_id } = req.body;

  const newSaving = new Saving({
    _id: uuidv4(),
    saving_amount,
    saving_date,
    saving_comment,
    user_id,
  });

  try {
    const savedSaving = await newSaving.save();
    res.status(201).json(savedSaving);
  } catch (error) {
    res.status(500).json({ message: "Error creating saving", error });
  }
});

router.put("/savings/:id", async (req, res) => {
  const { saving_amount, saving_date, saving_comment } = req.body;

  try {
    const updatedSaving = await Saving.findByIdAndUpdate(
      req.params.id,
      {
        saving_amount,
        saving_date,
        saving_comment,
        saving_date_time: Date.now(), // Update the date time
      },
      { new: true }
    );

    if (!updatedSaving) {
      return res.status(404).json({ message: "Saving not found" });
    }

    res.status(200).json(updatedSaving);
  } catch (error) {
    res.status(500).json({ message: "Error updating saving", error });
  }
});

router.delete("/savings/:id/:user_id", async (req, res) => {
  const { id, user_id } = req.params;
  try {
    const deltedSaving = await Saving.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });

    if (!deltedSaving) {
      return res.status(404).json({ message: "Saving not found" });
    }

    res.status(200).json({ message: "Saving deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting saving", error });
  }
});

router.put("/saving/deduct/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { spending_amount, spending_comment, spending_date } = req.body;
  const savings = await Saving.find({ user_id });
  if (savings.length > 0) {
    const totalSavings = savings.reduce((sum, saving) => {
      return sum + saving.saving_amount;
    }, 0);
    if (spending_amount > totalSavings) {
      res
        .status(404)
        .json({ message: "Your spending amount is higher than your savings." });
    } else {
      const newSavingExpense = new SavingExpense({
        _id: uuidv4(),
        user_id,
        spending_amount,
        spending_date,
        spending_comment,
      });

      try {
        const savedSavingExpense = await newSavingExpense.save();
        res.status(201).json(savedSavingExpense);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Unable to deduct from saving.", error });
      }
    }
  } else {
    res.status(404).json({ message: "You have no savings." });
  }
});

module.exports = router;
