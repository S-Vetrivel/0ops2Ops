const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { enqueueMedia } = require("../services/mediaService");

// --- Configuration: Country Digit Rules ---
const COUNTRY_RULES = {
  "+91": { country: "IN", digits: 10 },
  "+1": { country: "US", digits: 10 },
  "+44": { country: "UK", digits: 10 },
  "+61": { country: "AU", digits: 9 },
  "+81": { country: "JP", digits: 10 },
  "+49": { country: "DE", digits: 11 },
};

// --- Helper: Password Strength Validator ---
const isPasswordStrong = (password) => {
  const strongRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  return strongRegex.test(password);
};

// --- 1. EXISTING: Personal Info Update ---
exports.PersonalInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, countryCode, phone, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (fullName && fullName.trim().length > 0) {
      user.fullname = fullName.trim();
    }

    if (countryCode && phone) {
      const countryRule = COUNTRY_RULES[countryCode];
      if (!countryRule) {
        return res.status(400).json({
          success: false,
          message: `Invalid or unsupported country code: ${countryCode}`,
        });
      }

      const cleanPhone = phone.toString().replace(/\D/g, "");
      if (cleanPhone.length !== countryRule.digits) {
        return res.status(400).json({
          success: false,
          message: `Invalid phone format. ${countryRule.country} numbers must be exactly ${countryRule.digits} digits.`,
        });
      }
      user.phone = `${countryCode} ${cleanPhone}`;
    }

    if (password && password.length > 0) {
      if (!isPasswordStrong(password)) {
        return res.status(400).json({
          success: false,
          message:
            "Password is too weak. Must contain 8+ characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --- 2. NEW: Profile Picture Upload ---
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    // Add Job to Queue
    // We pass "User" as the model and "profilePicture" as the field to update
    await enqueueMedia(req.file, req.user._id, "User", "profilePicture");

    res.status(200).json({
      success: true,
      message: "Profile picture upload started. Processing in background...",
    });
  } catch (error) {
    console.error("Profile Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
