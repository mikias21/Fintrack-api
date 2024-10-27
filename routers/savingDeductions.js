const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const Saving = require("../models/Savings");
const SavingExpense = require("../models/SavingExpenses");
const {validateToken} = require('../utils/middleWares');
const {validateNumericAmount, validateDateInputs} = require("../utils/validators");

router.put("/deduct/", validateToken, async (req, res) => {
    const user_id = req.user.id;
    const { spending_amount, spending_comment, spending_date } = req.body;

    // Validate user id
    try {
        const user = await User.find({ _id: user_id });
        if(user.length === 0){
        return res.status(404).json({message: "Invalid user ID, try again later."})
        }
    } catch (error) {
        return res.status(500).json({message: "Unable finding user record. Try again in a bit."});
    }

    // validate amount
    const spendingAmountValidation = validateNumericAmount(spending_amount);
    if(!spendingAmountValidation["verdict"]){
        return res.status(400).json({message: spendingAmountValidation["message"]});
    }

    // validate date
    const dateValidation = validateDateInputs(spending_date);
    if(!dateValidation["verdict"]){
        return res.status(400).json({message: dateValidation["message"]});
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
        res.status(400).json({ message: "Please specify proper amount." });
        }

        if (totalSavings < spending_amount) {
        res
            .status(400)
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
  
router.delete("/deduct/:deduct_id", validateToken, async (req, res) => {
    const { deduct_id } = req.params;
    const user_id = req.user.id;

    // Validate user id
    try {
        const user = await User.find({ _id: user_id });
        if(user.length === 0){
        return res.status(404).json({message: "Invalid user ID, try again later."})
        }
    } catch (error) {
        return res.status(500).json({message: "Unable finding user record. Try again in a bit."});
    }

    // Validate deduction id
    try {
        const deduction = await SavingExpense.find({ _id: deduct_id });
        if(deduction.length === 0){
        return res.status(404).json({message: "Spending record not found."})
        }
    } catch (error) {
        return res.status(500).json({message: "Unable finding spending record. Try again in a bit."});
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
  
router.get("/deduct/", validateToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        const savingsExpenses = await SavingExpense.find({
        user_id,
        });
        res.status(200).json(savingsExpenses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching saving expenses", error });
    }
});
  
router.get("/deduct/:id", validateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        const savingExpense = await SavingExpense.find({
        _id: req.params.id,
        user_id,
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