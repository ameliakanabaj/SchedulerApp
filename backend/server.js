const express = require("express");
const fs = require('fs');
const https = require('https');
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); 
const errorHandler = require("./src/middlewares/errorHandler.middleware");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const prisma = require("./src/services/prisma");

const healthRoutes = require("./src/routes/health.routes");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const organizationRoutes = require("./src/routes/organization.routes");
const shiftRoutes = require("./src/routes/shift.routes");
const availabilityRoutes = require("./src/routes/availability.routes");
const assignmentRoutes = require("./src/routes/assignment.routes");

const app = express();
const PORT = process.env.PORT || 8083;

app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://scheduler-app-iota.vercel.app"
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/availabilities", availabilityRoutes);
app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Scheduler API is running.");
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint Not Found", path: req.originalUrl });
});

app.use(errorHandler);

let key;
let cert;

if (fs.existsSync('ssl/key.pem') && fs.existsSync('ssl/cert.pem')) {
  key = fs.readFileSync('ssl/key.pem');
  cert = fs.readFileSync('ssl/cert.pem');
} else if (process.env.SSL_KEY && process.env.SSL_CERT) {
  key = process.env.SSL_KEY.replace(/\\n/g, '\n');
  cert = process.env.SSL_CERT.replace(/\\n/g, '\n');
} else {
  throw new Error("No SSL key/cert found");
}

https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`HTTPS running on ${PORT}`);
});
