import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/Appcontext"; // Import your context
import { X } from "lucide-react"; // Assuming you use lucide-react or similar icons
// If no icon lib, just use a letter "X" string

const LoginPopup = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 1. If user is logged in, never show this.
    if (user) return;

    // 2. Check if user already closed it this session (Optional: remove if you want it EVERY time)
    const hasSeenPopup = sessionStorage.getItem("seen_login_popup");
    if (hasSeenPopup) return;

    // 3. Set Timer for 15 Seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    // Trigger smooth exit animation
    setIsClosing(true);

    // Mark as seen in Session Storage (won't show again until tab is closed & reopened)
    sessionStorage.setItem("seen_login_popup", "true");

    // Remove from DOM after animation finishes (500ms)
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 500);
  };

  const handleLoginClick = () => {
    handleClose();
    navigate("/login");
  };

  if (!isVisible && !isClosing) return null;
  // Use 'user' check again to force hide if user logs in while popup is waiting
  if (user) return null;

  return (
    <div
      className={`login-popup-container ${isClosing ? "fade-out" : "fade-in"}`}
    >
      <div className="login-popup-content">
        <button className="close-btn" onClick={handleClose}>
          {/* Replace with <X /> if using lucide-react */}✕
        </button>

        <h3>Unlock the Full Experience!</h3>
        <p>Join our community to save your favorite items and track orders.</p>

        <div className="popup-actions">
          <button onClick={handleLoginClick} className="popup-login-btn">
            Log In / Sign Up
          </button>
          <button onClick={handleClose} className="popup-guest-btn">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
