const User = require("../models/userModel"); // Check your spelling: userModal vs userModel
const bcrypt = require("bcryptjs");
const generateTokenAndSetCookie = require("../utils/generateToken");
const userModal = require("../models/userModel");

// ==============================================
// 1. SIGNUP
// ==============================================
exports.Signup = async (req, res) => {
  try {
    // 1. Get Confirm Password from body
    const { fullname, username, email, password, confirmPassword, phone } =
      req.body;

    // 2. Fallback: If username is missing, generate it from email
    const finalUsername = username || email.split("@")[0];
    const finalFullname = fullname || "User"; // Fallback if name is missing

    if (!email || !password || !finalUsername) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 3. BACKEND MATCH CHECK
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 4. BACKEND STRENGTH CHECK
    // Regex: At least 8 chars, 1 upper, 1 lower, 1 number, 1 special char
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 chars long and include uppercase, lowercase, number, and symbol.",
      });
    }

    // 5. Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 6. Hash & Save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullname: finalFullname,
      username: finalUsername,
      email,
      password: hashedPassword,
      phone,
    });

    generateTokenAndSetCookie(res, newUser._id);

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 2. LOGIN
// ==============================================
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify Password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Generate Token & Set Cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 3. LOGOUT
// ==============================================
exports.Logout = (req, res) => {
  // Clear the cookie by setting it to expire immediately
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// ==============================================
// 4. ME (Check Auth Status)
// ==============================================
exports.Me = async (req, res) => {
  const user = await userModal
    .findById(req.user._id)
    .select("-password -__v -updatedAt");

  res.status(200).json({
    success: true,
    user,
  });
};

// ==============================================
// 5. reset-password (Forgot Password)
// ==============================================
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // TODO: Generate OTP or Reset Token and send email
    // Example:
    // const token = crypto.randomBytes(32).toString("hex");
    // await saveTokenToDBOrRedis(token);
    // sendEmail(user.email, token);

    return res.status(200).json({
      success: true,
      message: "Password reset instructions sent to email",
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
