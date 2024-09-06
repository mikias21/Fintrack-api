const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const Saving = require("../models/Savings");
const SavingExpense = require("../models/SavingExpenses");
const {validateToken} = require('../utils/middleWares');
const {validateNumericAmount, validateDateInputs} = require("../utils/validators");

router.get("/savings/", validateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const savings = await Saving.find({ user_id });
    res.status(200).json(savings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching savings", error });
  }
});

router.get("/savings/:id/", validateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const saving = await Saving.find({
      _id: req.params.id,
      user_id,
    });
    if (!saving) {
      return res.status(404).json({ message: "Saving not found" });
    }
    res.status(200).json(saving);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saving", error });
  }
});

router.post("/savings", validateToken, async (req, res) => {
  const user_id = req.user.id;
  const { saving_amount, saving_date, saving_comment} = req.body;

  // validate saving_amount
  const savingAmountValidation = validateNumericAmount(saving_amount);
  if(!savingAmountValidation["verdict"]){
    return res.status(400).json({message: savingAmountValidation["message"]});
  }

  // validate saving_date
  const dateValidation = validateDateInputs(saving_date);
  if(!dateValidation["verdict"]){
    return res.status(400).json({message: dateValidation["message"]});
  }

  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(404).json({message: "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({message: "Unable finding user record. Try again in a bit."});
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
    res.status(500).json({message: "Error creating saving", error });
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

router.delete("/savings/:id/", validateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  // Validate user ID
  try {
    const user = await User.find({ _id: user_id });
    if(user.length === 0){
      return res.status(404).json({message: "Invalid user ID, try again later."})
    }
  } catch (error) {
    return res.status(500).json({message: "Unable finding user record. Try again in a bit."});
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

module.exports = router;
