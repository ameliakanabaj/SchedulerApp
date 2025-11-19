const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

const errorHandler = require("./middlewares/errorHandler.middleware");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = require("./services/prisma");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const organizationRoutes = require("./routes/organization.routes");
const shiftRoutes = require("./routes/shift.routes");
const availabilityRoutes = require("./routes/availability.routes");
const assignmentRoutes = require("./routes/assignment.routes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://www.scheduler.pl"
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

app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR HANDLER]:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
