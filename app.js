const express = require("express");
const mongoose = require("mongoose");

// Local
const connectDB = require("./database/connection");
const Expense = require("./models/Expenses");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Sample data
const sampleData = {
  expense_amount: 12.1,
  expense_date: "02/06/2024",
  expense_reason: "Testing",
  expense_comment: "Testing",
};

app.get("/", async (req, res) => {
  try {
    const newExpense = new Expense(sampleData);
    console.log("New expense to be saved:", newExpense);

    const savedExpense = await newExpense.save();
    console.log("Saved expense:", savedExpense);

    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ message: "Error creating expense", error });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
