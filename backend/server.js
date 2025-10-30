const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const errorHandler = require("./src/middlewares/errorHandler.middleware");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const dbService = require("./src/services/db.service");

const healthRoutes = require("./src/routes/health.routes");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const organizationRoutes = require("./src/routes/organization.routes");
const shiftRoutes = require("./src/routes/shift.routes");
const availabilityRoutes = require("./src/routes/availability.routes");
const assignmentRoutes = require("./src/routes/assignment.routes");

const app = express();
const PORT = process.env.PORT || 8083;

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

app.listen(PORT, () => console.log(`[API] Server has started on: ${PORT}`));
