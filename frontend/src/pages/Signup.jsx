import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { GOOGLE_AUTH_URL, SignUp } from "../services/api";
import { useApp } from "../context/Appcontext";
const Signup = () => {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || {
    bg: "#0f172a",
    text: "#ffffff",
    navbar: { textIdle: "#94a3b8" },
    card: { btnBg: "#3b82f6", btnText: "#ffffff" },
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { setUser } = useApp();
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 4
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
        return "bg-gray-700";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-400";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-700";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time Validation
    if (name === "password") {
      setPasswordStrength(checkStrength(value));
      setMatchError(
        value !== formData.confirmPassword && formData.confirmPassword
          ? "Passwords do not match"
          : ""
      );
    }
    if (name === "confirmPassword") {
      setMatchError(
        value !== formData.password ? "Passwords do not match" : ""
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setMatchError("");

    // 1. Frontend Validation Checks
    if (passwordStrength < 3) {
      setPasswordError(
        "Password is too weak. Use uppercase, numbers, and symbols."
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMatchError("Passwords do not match");
      return;
    }

    setLoading(true);

    // Call API (Ensure your SignUp function in api.js passes all these args)
    // Note: We send confirmPassword to backend too for double-check
    const result = await SignUp(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      setUser(result.user);
      // Navigate to login or profile
      navigate(-1);
    } else {
      // Show backend error
      setPasswordError(result.message);
    }
    setLoading(false);
  };

  // Shared Styles
  const glassInputStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.4)",
    borderLeft: "1px solid rgba(255, 255, 255, 0.4)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    color: theme.text,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  const glassFocusStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.8)",
    boxShadow:
      "0 0 25px rgba(59, 130, 246, 0.5), inset 0 0 15px rgba(59, 130, 246, 0.2)",
    transform: "scale(1.02)",
  };

  const handleFocus = (e) => Object.assign(e.target.style, glassFocusStyle);
  const handleBlur = (e) => {
    e.target.style.background = glassInputStyle.background;
    e.target.style.borderTop = glassInputStyle.borderTop;
    e.target.style.borderLeft = glassInputStyle.borderLeft;
    e.target.style.borderBottom = glassInputStyle.borderBottom;
    e.target.style.borderRight = glassInputStyle.borderRight;
    e.target.style.borderColor = "";
    e.target.style.boxShadow = glassInputStyle.boxShadow;
    e.target.style.transform = "none";
  };

  const EyeIcon = ({ visible }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
      style={{ color: theme.text }}
    >
      {visible ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      )}
      {visible && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      )}
    </svg>
  );

  return (
    <div
      className="animate-fade-in-up -mt-15"
      style={{
        animationDuration: "0.8s",
        animationFillMode: "both",
        animationDelay: "0.1s",
      }}
    >
      <div className="mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight mb-2 drop-shadow-lg"
          style={{ color: theme.text }}
        >
          Create Account
        </h1>
        <p
          className="text-sm font-medium"
          style={{ color: theme.navbar.textIdle }}
        >
          Join us to explore the world.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Input */}
        <div className="space-y-1.5">
          <label
            className="text-[10px] font-bold uppercase tracking-widest opacity-80 ml-3"
            style={{ color: theme.text }}
          >
            Full Name
          </label>
          <div className="relative group">
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              style={glassInputStyle}
              className="w-full px-5 py-4 rounded-2xl outline-none placeholder-white/90 text-sm"
              placeholder="John Doe"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label
            className="text-[10px] font-bold uppercase tracking-widest opacity-80 ml-3"
            style={{ color: theme.text }}
          >
            Email
          </label>
          <div className="relative group">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={glassInputStyle}
              className="w-full px-5 py-4 rounded-2xl outline-none placeholder-white/90 text-sm"
              placeholder="name@company.com"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label
            className="text-[10px] font-bold uppercase tracking-widest opacity-80 ml-3"
            style={{ color: theme.text }}
          >
            Password
          </label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={glassInputStyle}
              className="w-full px-5 py-4 rounded-2xl outline-none placeholder-white/90 text-sm pr-12"
              placeholder="••••••••"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {/* <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer z-10"
            >
              <EyeIcon visible={showPassword} />
            </button> */}
          </div>

          {/* ---- Minimal Strength Meter ---- */}
          <div className="px-1 mt-2">
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    passwordStrength >= level
                      ? getStrengthColor()
                      : "bg-gray-700/50"
                  }`}
                ></div>
              ))}
            </div>
            {passwordError && (
              <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">
                {passwordError}
              </p>
            )}
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1.5">
          <label
            className="text-[10px] font-bold uppercase tracking-widest opacity-80 ml-3"
            style={{ color: theme.text }}
          >
            Confirm Password
          </label>
          <div className="relative group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              style={glassInputStyle}
              className="w-full px-5 py-4 rounded-2xl outline-none placeholder-white/90 text-sm pr-12"
              placeholder="••••••••"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <button
              type="button"
              onClick={() => {
                setShowConfirmPassword(!showConfirmPassword);
                setShowPassword(!showPassword);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer z-10"
            >
              <EyeIcon visible={showConfirmPassword} />
            </button>
          </div>
          {matchError && (
            <p className="text-[10px] text-red-400 ml-3 font-medium">
              {matchError}
            </p>
          )}
        </div>

        {/*Terms & Conditions*/}
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              onChange={(e) => {
                setAccepted(e.target.checked);
              }}
              className="w-3.5 h-3.5 rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-0 transition-transform active:scale-90"
            />

            <span
              className="ml-2 group-hover:text-white transition-colors duration-300"
              style={{ color: theme.navbar.textIdle }}
            >
              Accept the
              <Link
                // to="/forgot-password"
                className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                {" "}
                Terms & Conditions
              </Link>
            </span>
          </label>
          <Link
            // to="/forgot-password"
            className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            Privacy policy
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !accepted}
          className="w-full py-3.5 mt-2 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-300 transform hover:translate-y-[-2px] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.card.btnBg,
            color: theme.card.btnText,
          }}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {/* Divider & Google */}
        <div className="space-y-4">
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-gray-700/50"></div>
            <span className="shrink-0 mx-3 text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
              Or
            </span>
            <div className="grow border-t border-gray-700/50"></div>
          </div>
          <button
            onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-gray-700/30 bg-white/5 font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-gray-500 active:scale-[0.98]"
            style={{ color: theme.text }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-4 w-4"
            />
            Continue with Google
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs" style={{ color: theme.navbar.textIdle }}>
          Already have an account?{" "}
          <Link
            to="/login"
            replace
            className="font-bold text-blue-500 hover:text-blue-400 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
