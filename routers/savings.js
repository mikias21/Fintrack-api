const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const Saving = require("../models/Savings");
const SavingExpense = require("../models/SavingExpenses");
const {validateNumericAmount, validateDateInputs} = require("../utils/validators");

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

  // validate saving_amount
  const savingAmountValidation = validateNumericAmount(saving_amount);
  if(!savingAmountValidation["verdict"]){
    return res.status(404).json({"message": savingAmountValidation["message"]});
  }

  // validate saving_date
  const dateValidation = validateDateInputs(saving_date);
  if(!dateValidation["verdict"]){
    return res.status(400).json({"message": dateValidation["message"]});
  }

  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(400).json({"message": "Invalid user ID, try again later."})
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ "message": "Unable finding user record. Try again in a bit."});
  }

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
    res.status(500).json({ "message": "Error creating saving", error });
  }
});

// When this route is used, input has to be validated
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

  // Validate user ID
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(400).json({"message": "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({ "message": "Unable finding user record. Try again in a bit."});
  }

  // Validate Saving ID
  try {
    const saving = await Saving.find({
      _id: id,
      user_id: user_id,
    });
    if (saving.length === 0) {
      return res.status(404).json({ message: "Saving Record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching saving", error });
  }

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

  // Validate user id
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(400).json({"message": "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({ "message": "Unable finding user record. Try again in a bit."});
  }

  // validate amount
  const spendingAmountValidation = validateNumericAmount(spending_amount);
  if(!spendingAmountValidation["verdict"]){
    return res.status(404).json({"message": spendingAmountValidation["message"]});
  }

  // validate date
  const dateValidation = validateDateInputs(spending_date);
  if(!dateValidation["verdict"]){
    return res.status(400).json({"message": dateValidation["message"]});
  }

  const savings = await Saving.find({ user_id });
  const savingsExpenses = await SavingExpense.find({
    user_id,
  });

  if (savings.length > 0) {
    const totalSavingExpense = savingsExpenses.reduce((sum, saving) => {
      return sum + saving.spending_amount;
    }, 0);

    const totalSavings =
      savings.reduce((sum, saving) => {
        return sum + saving.saving_amount;
      }, 0) - totalSavingExpense;

    if (spending_amount <= 0) {
      res.status(404).json({ message: "Please specify proper amount." });
    }

    if (totalSavings < spending_amount) {
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

router.delete("/saving/deduct/:user_id/:deduct_id", async (req, res) => {
  const { user_id, deduct_id } = req.params;

  // Validate user id
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(400).json({"message": "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({ "message": "Unable finding user record. Try again in a bit."});
  }

  // Validate deduction id
  try {
    const deduction = await SavingExpense.find({ _id: deduct_id });
    if(deduction.length === 0){
      return res.status(400).json({"message": "Spending record not found."})
    }
  } catch (error) {
    return res.status(500).json({ "message": "Unable finding spending record. Try again in a bit."});
  }

  try {
    const deleteDeduction = await SavingExpense.findOneAndDelete({
      _id: deduct_id,
      user_id,
    });

    if (!deleteDeduction) {
      res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
});

router.get("/saving/deduct/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const savingsExpenses = await SavingExpense.find({
      user_id,
    });
    res.status(200).json(savingsExpenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saving expenses", error });
  }
});

router.get("/saving/deduct/:user_id/:id", async (req, res) => {
  try {
    const savingExpense = await SavingExpense.find({
      _id: req.params.id,
      user_id: req.params.user_id,
    });
    if (!savingExpense) {
      return res.status(404).json({ message: "Saving expense not found" });
    }
    res.status(200).json(savingExpense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saving expense", error });
  }
});

module.exports = router;
