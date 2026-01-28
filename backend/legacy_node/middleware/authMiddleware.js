const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const generateTokenAndSetCookie = require("../utils/generateToken");

// 1. Change function signature to accept options (default is empty object)
const protect =
  ({ admin = false } = {}) =>
  async (req, res, next) => {
    try {
      // 2. Read token from cookie
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }

      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find user
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // ============================================================
      // 5. ADMIN CHECK (New Logic)
      // ============================================================
      // If admin:true was passed, check if the user's role is 'admin'
      // Note: Ensure your database field is actually named 'role'.
      // If it is 'userRole', change 'req.user.role' to 'req.user.userRole'.
      if (admin && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized as admin" });
      }

      // ============================================================
      // 6. ROLLING SESSION / AUTO-REFRESH
      // ============================================================
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const timeRemaining = decoded.exp - nowInSeconds;

      if (timeRemaining < sevenDaysInSeconds) {
        generateTokenAndSetCookie(res, req.user._id);
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  };

module.exports = { protect };
