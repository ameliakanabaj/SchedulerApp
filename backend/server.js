const express = require("express");
const fs = require('fs');
const https = require('https');
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const dbService = require("./src/services/db.service");

const healthRoutes = require("./src/routes/health.routes");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");

const app = express();
const PORT = process.env.PORT || 8083;

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Scheduler API is running.");
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint Not Found", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR HANDLER]:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

let key;
let cert;

if (fs.existsSync('/ssl/privkey.pem') && fs.existsSync('/ssl/fullchain.pem')) {
  key = fs.readFileSync('/ssl/privkey.pem');
  cert = fs.readFileSync('/ssl/fullchain.pem');
} else if (process.env.SSL_KEY && process.env.SSL_CERT) {
  key = process.env.SSL_KEY.replace(/\\n/g, '\n');
  cert = process.env.SSL_CERT.replace(/\\n/g, '\n');
} else {
  throw new Error("No SSL key/cert found");
}

https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`HTTPS running on ${PORT}`);
});
