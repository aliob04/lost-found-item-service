require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      type TEXT,
      title TEXT,
      description TEXT,
      category TEXT,
      location TEXT,
      contact TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

initDb();

app.get("/", (req, res) => {
  res.json({ service: "item-service", status: "running", database: "connected" });
});

app.post("/items", async (req, res) => {
  const { type, title, description, category, location, contact } = req.body;

  const result = await pool.query(
    `INSERT INTO items (type, title, description, category, location, contact)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [type, title, description, category, location, contact]
  );

  const item = result.rows[0];

  await fetch(`${process.env.MATCHING_URL}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  res.json({ message: "Item reported successfully", item });
});

app.get("/items", async (req, res) => {
  const result = await pool.query("SELECT * FROM items ORDER BY id DESC");
  res.json(result.rows);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Item service running on port ${PORT}`));
