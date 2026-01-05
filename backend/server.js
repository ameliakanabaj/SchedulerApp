const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); 
const errorHandler = require("./src/middlewares/errorHandler.middleware");
const { swaggerUi, swaggerSpec } = require("./swagger");
const cronService = require("./src/services/cron.service");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const prisma = require("./src/services/prisma");

const healthRoutes = require("./src/routes/health.routes");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const organizationRoutes = require("./src/routes/organization.routes");
const shiftRoutes = require("./src/routes/shift.routes");
const availabilityRoutes = require("./src/routes/availability.routes");
const assignmentRoutes = require("./src/routes/assignment.routes");
const scheduleRoutes = require("./src/routes/schedule.routes");

const app = express();
const PORT = process.env.PORT || 8083;

app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://www.scheduler.pl"
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/availabilities", availabilityRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/schedules", scheduleRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Scheduler API is running.");
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint Not Found", path: req.originalUrl });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend HTTP running on ${PORT}`);
  cronService.init();
});
