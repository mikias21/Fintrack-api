const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const he = require('he');

const Income = require("../models/Income");
const User = require("../models/User");
const {validateNumericAmount, validateDateInputs} = require("../utils/validators");
const {validateToken} = require("../utils/middleWares");
const INCOME_REASON = ['SALARY', 'PART TIME GICK', 'MEAL MONEY', 'BUSINESS', 'OTHERS'];

router.get("/incomes/", validateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const incomes = await Income.find({ user_id });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching incomes", error });
  }
});

router.get("/incomes/:id", validateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const income = await Income.find({
      _id: req.params.id,
      user_id,
    });
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: "Error fetching income", error });
  }
});

router.post("/incomes", validateToken, async (req, res) => {
  const user_id = req.user.id;

  const { income_amount, income_date, income_reason, income_comment} =
    req.body;
  
  // validate income_amount
  const incomeAmountValidation = validateNumericAmount(income_amount);
  if(!incomeAmountValidation["verdict"]){
    return res.status(400).json({message: incomeAmountValidation["message"]});
  }

  // validate income_date
  const dateValidation = validateDateInputs(income_date);
  if(!dateValidation["verdict"]){
    return res.status(400).json({message: dateValidation["message"]});
  }

  // validate income_reason
  let reason = income_reason.trim().toUpperCase();
  let foundReason = false;
  INCOME_REASON.forEach(item => {
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
    return res.status(500).json({message: "Unable finding user record. Try again in a bit."});
  }

  const newIncome = new Income({
    _id: uuidv4(),
    income_amount,
    income_date,
    income_reason,
    income_comment,
    user_id,
  });

  try {
    // Check user ID
    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    res.status(500).json({ message: "Error creating income", error });
  }
});

// When this route is used, input has to be validated
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

router.delete("/incomes/:id", validateToken, async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

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
    const income = await Income.find({
      _id: id,
      user_id: user_id,
    });
    if (income.length === 0) {
      return res.status(404).json({ message: "Income not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching income", error });
  }

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
