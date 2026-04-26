require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= TEST ================= */
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

/* ================= RESTAURANTS ================= */
app.get("/restaurants", async (req, res) => {
  const [data] = await db.query("SELECT * FROM restaurants");
  res.json(data);
});

/* ================= FOOD ================= */
app.get("/food/:id", async (req, res) => {
  const [data] = await db.query(
    "SELECT * FROM foods WHERE restaurant_id=?",
    [req.params.id]
  );
  res.json(data);
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  const { name, password, phone, address } = req.body;

  const [user] = await db.query(
    "SELECT * FROM users WHERE name=?",
    [name]
  );

  if (user.length > 0) {
    return res.json({ message: "User already exists" });
  }

  await db.query(
    "INSERT INTO users (name,password,phone,address,wallet) VALUES (?,?,?,?,500)",
    [name, password, phone, address]
  );

  res.json({ message: "Registered successfully" });
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  const { name, password } = req.body;

  const [user] = await db.query(
    "SELECT * FROM users WHERE name=? AND password=?",
    [name, password]
  );

  if (user.length === 0) {
    return res.json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user: user[0] });
});

/* ================= ORDER ================= */
app.post("/order", async (req, res) => {
  const { userId, total } = req.body;

  if (!userId) {
    return res.json({ message: "Login required" });
  }

  const [user] = await db.query(
    "SELECT wallet FROM users WHERE id=?",
    [userId]
  );

  if (user[0].wallet < total) {
    return res.json({ message: "Insufficient balance" });
  }

  await db.query(
    "UPDATE users SET wallet = wallet - ? WHERE id=?",
    [total, userId]
  );

  await db.query(
    "INSERT INTO orders (user_id,total) VALUES (?,?)",
    [userId, total]
  );

  const [updatedUser] = await db.query(
    "SELECT * FROM users WHERE id=?",
    [userId]
  );

  res.json({
    message: "Order placed successfully",
    user: updatedUser[0]
  });
});

/* ================= ORDERS ================= */
app.get("/orders/:id", async (req, res) => {
  const [data] = await db.query(
    "SELECT * FROM orders WHERE user_id=?",
    [req.params.id]
  );
  res.json(data);
});

/* ================= ADMIN ================= */

// stats
app.get("/admin/stats", async (req, res) => {
  const [orders] = await db.query("SELECT SUM(total) as revenue FROM orders");
  const [users] = await db.query("SELECT COUNT(*) as users FROM users");

  res.json({
    revenue: orders[0].revenue || 0,
    users: users[0].users
  });
});

// all orders
app.get("/admin/orders", async (req, res) => {
  const [data] = await db.query("SELECT * FROM orders");
  res.json(data);
});

// users
app.get("/admin/users", async (req, res) => {
  const [data] = await db.query("SELECT id,name,wallet FROM users");
  res.json(data);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🔥 Server running on", PORT);
});