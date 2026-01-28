import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  ChevronDown,
  AlertCircle,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
} from "lucide-react";
import { MOCK_USER_META } from "../constants";
import GoogleIcon from "../../GoogleIcon";
import Modal from "@/components/layout/Modal";
import { UpdatePersonalInfo } from "../../../services/api";

// 1. Country Codes Configuration
const COUNTRY_CODES = [
  { code: "+91", country: "IN", digits: 10 },
  { code: "+1", country: "US", digits: 10 },
  { code: "+44", country: "UK", digits: 10 },
  { code: "+61", country: "AU", digits: 9 },
  { code: "+81", country: "JP", digits: 10 },
  { code: "+49", country: "DE", digits: 11 },
];

export default function PersonalInfoTab({ theme, user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Change Detection & Password Strength State
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // ---------------------------------------------------------
  // 2. SMART PHONE EXTRACTION LOGIC
  // ---------------------------------------------------------
  const initialData = useMemo(() => {
    const rawPhone = user?.phone || "";

    // Default fallback
    let extractedCode = "+91";
    let extractedNumber = "";

    // Try to find a matching country code at the start of the string
    const foundCountry = COUNTRY_CODES.find((c) => rawPhone.startsWith(c.code));

    if (foundCountry) {
      extractedCode = foundCountry.code;
      // Remove the code from the start and trim whitespace
      extractedNumber = rawPhone.replace(foundCountry.code, "").trim();
    } else if (rawPhone) {
      // If data exists but no code matches, put everything in number (user corrects it)
      extractedNumber = rawPhone;
    }

    return {
      fullName: user?.fullname || "Alex Doe",
      email: user?.email,
      countryCode: extractedCode,
      phone: extractedNumber,
    };
  }, [user]);

  const [formData, setFormData] = useState({
    ...initialData,
    password: "",
  });

  // --- Password Strength Logic ---
  const checkStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-gray-500/20";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-400";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-500/20";
    }
  };

  // --- Change Detection Effect ---
  useEffect(() => {
    const isNameChanged = formData.fullName !== initialData.fullName;
    const isCountryChanged = formData.countryCode !== initialData.countryCode;
    const isPhoneChanged = formData.phone !== initialData.phone;
    const isPasswordChanged = formData.password.length > 0;

    setHasChanges(
      isNameChanged || isCountryChanged || isPhoneChanged || isPasswordChanged
    );
  }, [formData, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) setError("");

    // Number validation
    if (name === "phone" && !/^\d*$/.test(value)) return;

    // Password Strength Calc
    if (name === "password") {
      setPasswordStrength(checkStrength(value));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Pre-Save: Validate & Calculate Changes
  const handlePreSave = (e) => {
    e.preventDefault();
    setError("");

    if (!hasChanges) return;

    // --- Validation ---
    if (!formData.fullName.trim()) {
      setError("Full Name cannot be empty.");
      return;
    }

    const selectedCountry = COUNTRY_CODES.find(
      (c) => c.code === formData.countryCode
    );

    if (selectedCountry) {
      const cleanNumber = formData.phone.trim();
      if (cleanNumber.length !== selectedCountry.digits) {
        setError(
          `Invalid Format: ${selectedCountry.country} numbers must be exactly ${selectedCountry.digits} digits.`
        );
        return;
      }
    }

    // --- Calculate Specific Changes for Modal ---
    const changes = {};
    if (formData.fullName !== initialData.fullName) {
      changes["Full Name"] = formData.fullName;
    }

    // Compare combined phone strings
    const oldFullPhone =
      `${initialData.countryCode}${initialData.phone}`.replace(/\s/g, "");
    const newFullPhone = `${formData.countryCode}${formData.phone}`.replace(
      /\s/g,
      ""
    );

    if (oldFullPhone !== newFullPhone) {
      changes["Mobile Number"] = `${formData.countryCode} ${formData.phone}`;
    }

    if (formData.password.length > 0) {
      if (passwordStrength < 3) {
        setError("Password is too weak. Must meet at least 3 criteria.");
        return;
      }
      changes["Password"] = "******** (Hidden)";
    }

    setPendingChanges(changes);
    setIsModalOpen(true);
  };

  // 4. Final Save (Triggered from Modal)
  const handleFinalConfirm = async () => {
    setIsLoading(true);

    try {
      // 1. Prepare Payload
      const payload = {
        fullName: formData.fullName,
        countryCode: formData.countryCode,
        phone: formData.phone,
      };

      // Only include password if it was changed
      if (formData.password && formData.password.length > 0) {
        payload.password = formData.password;
      }

      // 2. Call API
      const response = await UpdatePersonalInfo(payload);

      // 3. Handle Response
      if (response.success) {
        // Update Global Context
        // Priority: Use the fresh user object from backend response.
        // Fallback: Use local state if backend didn't return the user object.
        if (setUser) {
          if (response.user) {
            setUser(response.user);
          } else {
            setUser((prev) => ({
              ...prev,
              fullname: formData.fullName,
              phone: `${formData.countryCode} ${formData.phone}`,
            }));
          }
        }

        // Success Cleanup
        setIsModalOpen(false);
        setIsEditing(false);
        setError(""); // Clear any previous errors
        setFormData((prev) => ({ ...prev, password: "" })); // Clear password field
      } else {
        // API returned success: false (Toast is handled in UpdatePersonalInfo)
        // You can set a local error here if you want text to appear above the button
        // setError(response.message);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setFormData({ ...initialData, password: "" });
      setError("");
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          Personal Details
        </h2>
        <button
          onClick={toggleEdit}
          disabled={isLoading}
          className="text-xs font-bold uppercase tracking-widest underline opacity-60 hover:opacity-100 disabled:opacity-30"
        >
          {isEditing ? "Cancel" : "Edit Details"}
        </button>
      </div>

      <form onSubmit={handlePreSave} className="space-y-8">
        {/* --- Full Name --- */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1 opacity-50">
            <User size={14} />
            <label className="text-[10px] font-bold uppercase tracking-widest">
              Full Name
            </label>
          </div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full bg-transparent border-b py-3 text-lg focus:outline-none focus:border-current transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ borderColor: theme.navbar?.border }}
          />
        </div>

        {/* --- Email (Read Only) --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 opacity-50">
              <Mail size={14} />
              <label className="text-[10px] font-bold uppercase tracking-widest">
                Email Address
              </label>
            </div>
            {(user?.googleId || user?.emailVerified) && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              disabled={true}
              className="w-full bg-transparent border-b py-3 text-lg focus:outline-none focus:border-current transition-colors opacity-60 cursor-not-allowed pr-8"
              style={{ borderColor: theme.navbar?.border }}
            />
            {user?.googleId && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                <GoogleIcon />
              </div>
            )}
          </div>
        </div>

        {/* --- Password (New Field) --- */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1 opacity-50">
            <Lock size={14} />
            <label className="text-[10px] font-bold uppercase tracking-widest">
              New Password
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder={
                isEditing ? "Enter new password to change" : "••••••••••••"
              }
              className="w-full bg-transparent border-b py-3 text-lg focus:outline-none focus:border-current transition-colors disabled:opacity-70 disabled:cursor-not-allowed pr-10"
              style={{ borderColor: theme.navbar?.border }}
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 p-2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          {/* Password Strength Meter */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isEditing && formData.password.length > 0 ? "auto" : 0,
              opacity: isEditing && formData.password.length > 0 ? 1 : 0,
            }}
            className="overflow-hidden"
          >
            <div className="flex gap-1 h-1 mt-3">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    passwordStrength >= level
                      ? getStrengthColor()
                      : "bg-gray-500/20"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-50">
                Password Strength
              </span>
              {passwordStrength < 3 && (
                <span className="text-[9px] text-orange-500 font-bold">
                  Weak
                </span>
              )}
              {passwordStrength >= 3 && (
                <span className="text-[9px] text-green-500 font-bold">
                  Strong
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* --- Phone Number --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 opacity-50">
              <Phone size={14} />
              <label className="text-[10px] font-bold uppercase tracking-widest">
                Mobile Number
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <div className="relative w-28">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent border-b py-3 text-lg focus:outline-none focus:border-current appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    borderColor: theme.navbar?.border,
                    color: theme.text,
                  }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option
                      key={c.country}
                      value={c.code}
                      style={{
                        backgroundColor: theme.bg,
                        color: theme.text,
                      }}
                    >
                      {c.country} ({c.code})
                    </option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <ChevronDown size={14} />
                </div>
              </div>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="0000000000"
                maxLength={15}
                className="flex-1 bg-transparent border-b py-3 text-lg focus:outline-none focus:border-current transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  borderColor: error ? "#ef4444" : theme.navbar?.border,
                  color: error ? "#ef4444" : "inherit",
                }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wide mt-1"
              >
                <AlertCircle size={12} />
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* --- Save Button --- */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6 flex flex-col md:flex-row md:justify-end"
          >
            <button
              type="submit"
              disabled={!hasChanges}
              className="px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: hasChanges
                  ? theme.text
                  : "rgba(150,150,150,0.1)",
                color: hasChanges ? theme.bg : "rgba(150,150,150,0.5)",
              }}
            >
              {hasChanges ? "Review Changes" : "No Changes Detected"}
            </button>
          </motion.div>
        )}
      </form>

      {/* --- CONFIRMATION MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
        title="Confirm Updates"
        description="The following details will be updated on your profile. Are you sure you want to proceed?"
      >
        <div className="mt-4 space-y-4">
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 space-y-3">
            {Object.entries(pendingChanges).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center text-sm"
              >
                <span className="opacity-60 font-medium uppercase tracking-wide text-xs">
                  {key}
                </span>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleFinalConfirm}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.text,
                color: theme.bg,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                "Confirm & Save"
              )}
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                border: `1px solid ${theme.navbar?.border}`,
                color: theme.navbar?.textIdle || theme.text,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
