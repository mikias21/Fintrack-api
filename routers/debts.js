const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const Debt = require("../models/Debts");
const User = require("../models/User");
const {validateNumericAmount, validateDateInputs, validateStringInput} = require("../utils/validators");

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
      user_id: userId,
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

  // Validate amount
  const debtAmountValidation = validateNumericAmount(debt_amount);
  if(!debtAmountValidation["verdict"]){
    return res.status(404).json({"message": debtAmountValidation["message"]});
  }

  // Validate date
  const dateValidation = validateDateInputs(debt_date);
  if(!dateValidation["verdict"]){
    return res.status(400).json({"message": dateValidation["message"]});
  }

  // Validate from
  let debtFrom = debt_from.trim();
  if(debtFrom.length > 10)
    return res.status(404).json({"message": "Only 10 letters are allowed for From field"});
  
  const fromValidation = validateStringInput(debtFrom);
  if(!fromValidation["verdict"])
    return res.status(400).json({"message": fromValidation["message"]});

  // validate user id
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(400).json({"message": "Invalid user ID, try again later."})
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ "message": "Unable finding user record. Try again in a bit."});
  }

  const newDebt = new Debt({
    _id: uuidv4(),
    debt_amount,
    debt_date,
    debt_from: debtFrom,
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

// When this route is used, input has to be validated
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

  // validate user id
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(400).json({"message": "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({ "message": "Unable finding user record. Try again in a bit."});
  }

  // validate debt id
  try {
    const debt = await Debt.find({
      _id: id,
      user_id: user_id,
    });
    if (debt.length === 0) {
      return res.status(404).json({ message: "Debt record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching debt record", error });
  }

  try {
    const debt = await Debt.findOne({ _id: id, user_id: user_id });
    const { debt_paid_amount, debt_paid_date } = req.body;

    // validate amount
    const debtPaidAmountValidation = validateNumericAmount(debt_paid_amount);
    if(!debtPaidAmountValidation["verdict"]){
      return res.status(404).json({"message": debtPaidAmountValidation["message"]});
    }

    // validate date
    const dateValidation = validateDateInputs(debt_paid_date);
    if(!dateValidation["verdict"]){
      return res.status(400).json({"message": dateValidation["message"]});
    }

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

  // validate user id
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(400).json({"message": "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({ "message": "Unable finding user record. Try again in a bit."});
  }

  // validate debt id
  try {
    const debt = await Debt.find({
      _id: id,
      user_id: user_id,
    });
    if (debt.length === 0) {
      return res.status(404).json({ message: "Debt record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching debt record", error });
  }

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
