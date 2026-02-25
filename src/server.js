require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");
const sessionRoutes = require("./routes/sessions");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/v1/sessions", sessionRoutes);

// Central error handler — catches anything thrown/passed via next(err)
app.use((err, _req, res, _next) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  // Duplicate key (e.g. same session id posted twice)
  if (err.code === 11000) {
    return res.status(409).json({ error: "A session with this id already exists" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

// Wrap async route handlers so unhandled promise rejections reach the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Re-wrap all routes with asyncHandler (simpler than patching each controller)
app._router.stack.forEach((layer) => {
  if (layer.name === "router") {
    layer.handle.stack.forEach((routeLayer) => {
      if (routeLayer.route) {
        routeLayer.route.stack.forEach((handler) => {
          handler.handle = asyncHandler(handler.handle);
        });
      }
    });
  }
});

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
