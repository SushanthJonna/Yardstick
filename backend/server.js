// === Backend (server.js) ===
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/finance")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  amount: Number,
  description: String,
  date: String,
  category: String,
});
const Transaction = mongoose.model("Transaction", transactionSchema);

// Budget Schema
const budgetSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  month: String,
});
const Budget = mongoose.model("Budget", budgetSchema);

// API Routes
app.get("/api/transactions", async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

app.post("/api/transactions", async (req, res) => {
  const t = new Transaction(req.body);
  await t.save();
  res.json(t);
});

app.delete("/api/transactions/:id", async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get("/api/budgets", async (req, res) => {
  const budgets = await Budget.find();
  res.json(budgets);
});

app.post("/api/budgets", async (req, res) => {
  const b = new Budget(req.body);
  await b.save();
  res.json(b);
});

// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));
