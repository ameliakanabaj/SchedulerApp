const express = require("express");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const app = express();
const PORT = process.env.PORT || 8083;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    console.error("Error connecting with database:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/", (req, res) => {
  console.log("hello", req.method);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
