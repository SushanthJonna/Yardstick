import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Other"];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ amount: "", description: "", date: "", category: "Other" });
  const [budgetForm, setBudgetForm] = useState({ category: "Food", amount: "", month: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    const res = await axios.get("http://localhost:5000/api/transactions");
    setTransactions(res.data);
  };

  const fetchBudgets = async () => {
    const res = await axios.get("http://localhost:5000/api/budgets");
    setBudgets(res.data);
  };

  const handleAddTransaction = async () => {
    const { amount, description, date } = form;
    if (!amount || !description || !date) {
      setError("All fields required");
      return;
    }
    await axios.post("http://localhost:5000/api/transactions", form);
    setForm({ amount: "", description: "", date: "", category: "Other" });
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/transactions/${id}`);
    fetchTransactions();
  };

  const handleAddBudget = async () => {
    if (!budgetForm.amount || !budgetForm.month) return;
    await axios.post("http://localhost:5000/api/budgets", budgetForm);
    setBudgetForm({ category: "Food", amount: "", month: "" });
    fetchBudgets();
  };

  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString("default", { month: "short" });
    const found = acc.find((x) => x.month === month);
    if (found) found.total += t.amount;
    else acc.push({ month, total: t.amount });
    return acc;
  }, []);

  const categoryData = CATEGORIES.map((cat) => {
    const total = transactions
      .filter((t) => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, value: total };
  });

  const getMonth = (date) => new Date(date).toLocaleString("default", { month: "short" });

  const budgetCompare = budgets.map((b) => {
    const spent = transactions
      .filter((t) => t.category === b.category && getMonth(t.date) === b.month)
      .reduce((sum, t) => sum + t.amount, 0);
    return { category: b.category, month: b.month, budget: b.amount, spent };
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Personal Finance Visualizer</h2>

      <div>
        <input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={handleAddTransaction}>Add Transaction</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <h3>Transactions</h3>
      <ul>
        {transactions.map((t) => (
          <li key={t._id}>
            ₹{t.amount} - {t.description} - {t.category} - {t.date}
            <button onClick={() => handleDelete(t._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Monthly Expenses Bar Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Category Pie Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
            {categoryData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <h3>Set Budget</h3>
      <input type="number" placeholder="Amount" value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: Number(e.target.value) })} />
      <input type="text" placeholder="Month (e.g. Jan)" value={budgetForm.month} onChange={(e) => setBudgetForm({ ...budgetForm, month: e.target.value })} />
      <select value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <button onClick={handleAddBudget}>Add Budget</button>

      <h3>Budget vs Actual</h3>
      <ul>
        {budgetCompare.map((b, i) => (
          <li key={i}>{b.month} - {b.category} | Budget: ₹{b.budget} | Spent: ₹{b.spent}</li>
        ))}
      </ul>
    </div>
  );
}
