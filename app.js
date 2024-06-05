const express = require("express");

// Local
const connectDB = require("./database/connection");
const expensesRouter = require("./routers/expenses");
const incomesRouter = require("./routers/incomes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Use the expenses router
app.use("/api/v1", expensesRouter);
app.use("/api/v1", incomesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
