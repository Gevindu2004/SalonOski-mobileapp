const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*"
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Exposes uploaded files as public URLs
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
