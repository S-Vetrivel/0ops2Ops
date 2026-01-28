import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import { ResetPassword } from "../services/api";
const ForgetPassword = () => {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || {
    bg: "#0f172a",
    text: "#ffffff",
    navbar: { textIdle: "#94a3b8" },
    card: { btnBg: "#3b82f6", btnText: "#ffffff" },
  };

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await ResetPassword(email);
    if (response.success) setIsSubmitted(true);
    // Logic to send reset request to backend
    // await requestPasswordReset(email);

    console.log("Reset link requested for:", email);
  };

  // --- Shared Styles (Exact copy from Login) ---
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

  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDuration: "0.8s",
        animationFillMode: "both",
        animationDelay: "0.1s",
      }}
    >
      {!isSubmitted ? (
        // --- VIEW 1: Input Form ---
        <>
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight mb-2 drop-shadow-lg"
              style={{ color: theme.text }}
            >
              Forgot Password?
            </h1>
            <p
              className="text-sm font-medium"
              style={{ color: theme.navbar.textIdle }}
            >
              Don't worry, it happens. Enter your email below to recover it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-widest opacity-80 ml-3"
                style={{ color: theme.text }}
              >
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={glassInputStyle}
                  className="w-full px-5 py-4 rounded-2xl outline-none placeholder-white/90 text-sm"
                  placeholder="name@company.com"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-300 transform hover:translate-y-[-2px] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25"
              style={{
                backgroundColor: theme.card.btnBg,
                color: theme.card.btnText,
              }}
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs" style={{ color: theme.navbar.textIdle }}>
              Remember your password?{" "}
              <Link
                to="/login"
                replace
                className="font-bold text-blue-500 hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </>
      ) : (
        // --- VIEW 2: Success Message ---
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div
              className="p-4 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-pulse"
              style={{ color: theme.text }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-blue-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3" style={{ color: theme.text }}>
            Check your email
          </h2>

          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: theme.navbar.textIdle }}
          >
            We have sent a password reset link to <br />
            <span className="text-blue-400 font-medium">{email}</span>
          </p>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-left mb-8">
            <p style={{ color: theme.navbar.textIdle }}>
              <strong className="text-blue-400 block mb-1">Important:</strong>
              The reset link will expire in 1 hour. If you don't see the email,
              please check your spam or junk folder.
            </p>
          </div>

          <Link
            to="/login"
            replace
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;
