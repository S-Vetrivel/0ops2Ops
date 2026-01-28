const express = require("express");
const router = express.Router();
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library"); // 1. Import Google Library
const generateTokenAndSetCookie = require("../utils/generateToken");
const { protect } = require("../middleware/authMiddleware");
const {
  Login,
  Signup,
  Logout,
  Me,
  resetPassword,
} = require("../controllers/authControllers");
const { findOrCreateGoogleUser } = require("../services/authService"); // 2. Import Helper

// Initialize Google Client for One Tap verification
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==============================================
// 1. MANUAL AUTH ROUTES
// ==============================================
router.post("/signup", Signup);
router.post("/login", Login);
router.get("/logout", Logout);
router.get("/me", protect(), Me);
router.post("/reset-password", resetPassword);

// ==============================================
// 2. GOOGLE OAUTH ROUTES (Standard Redirect)
// ==============================================

// A. Trigger Route
router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

// B. Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    // req.user is populated by Passport strategy

    // 1. Use Utility to Set Cookie
    generateTokenAndSetCookie(res, req.user._id);

    // 2. Redirect to Frontend (Dashboard/Home)
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(clientUrl);
  }
);

// ==============================================
// 3. GOOGLE ONE TAP ROUTE (Popup/No-Redirect)
// ==============================================
router.post("/google/onetap", async (req, res) => {
  const { token } = req.body;

  try {
    // A. Verify the ID Token sent from Frontend
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // { email, name, picture, sub, ... }

    // B. Find or Create User (Reusing the logic)
    const user = await findOrCreateGoogleUser(payload);

    // C. Set the Cookie (CRITICAL: Matches your existing auth logic)
    generateTokenAndSetCookie(res, user._id);

    // D. Respond with User Data (Frontend updates state immediately)
    res.status(200).json({
      success: true,
      user,
      message: "Google One Tap Login Successful",
    });
  } catch (error) {
    console.error("One Tap Error:", error);
    res.status(401).json({ success: false, message: "Invalid Google Token" });
  }
});

module.exports = router;
