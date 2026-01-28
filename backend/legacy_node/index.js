require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const fs = require("fs");
const path = require("path");
// 1. Pass the 'passport' library into your config file
require("./config/passport")(passport);

//  Database imports
const connectMongo = require("./config/connectMongo"); // Mongo

const { createServer } = require("http");
const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow requests from your frontend
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(passport.initialize());
const uploadDir = path.join(__dirname, "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📂 Created "public/uploads" directory');
} else {
  console.log('📂 "public/uploads" directory already exists');
}

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
const port = process.env.PORT || 3000;

// Bootstrap app with all DBs
(async () => {
  try {
    // CHANGED: Added connectRedis() to the Promise.all array
    await Promise.all([connectMongo()]);

    // register routes
    app.use("/api", require("./routes/index"));
    server.listen(port, "0.0.0.0", () => {
      console.log(`☑️  Sass server running on http://127.0.0.1:${port}`);
      console.log("=".repeat(process.stdout.columns || 80));
    });
  } catch (err) {
    console.error("❌ Startup failed (DB not connected):", err.message || err);
    process.exit(1); // let nodemon restart
  }
})();

// Optional: gracefully handle MongoDB disconnect
const mongoose = require("mongoose");
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected — shutting down server");
});
