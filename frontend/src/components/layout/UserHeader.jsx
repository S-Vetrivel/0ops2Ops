import React, { useState, useEffect } from "react";
import { Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useApp } from "../../context/Appcontext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const UserHeader = ({ theme }) => {
  const { user } = useApp();
  const [cartCount, setCartCount] = useState(2);
  const [imgError, setImgError] = useState(false);
  const [blobLoaded, setBlobLoaded] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API_BASE_URL}${path}`;
  };

  const profileSrc = getImageUrl(user?.profilePicture);
  const isDirectUrl = profileSrc?.startsWith("http");

  useEffect(() => {
    setImgError(false);
    if (!isDirectUrl) setBlobLoaded(false);
  }, [profileSrc, isDirectUrl]);

  return (
    <div className="flex items-center gap-2 mr-2">
      <Link to="/notifications">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            backgroundColor: theme.navbar.searchBg,
            color: theme.navbar.iconColor,
          }}
          className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
        >
          <Bell size={20} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-black">
              {cartCount}
            </span>
          )}
        </motion.button>
      </Link>

      <Link to={user ? "/profile" : "/login"}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden border transition-colors group"
          style={{
            backgroundColor: theme.navbar.searchBg,
            borderColor: theme.navbar.border,
            color: theme.navbar.iconColor,
          }}
        >
          {/* 1. SKELETON: Show if local loading and no error yet */}
          {!isDirectUrl && !blobLoaded && !imgError && profileSrc && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-200/20 dark:bg-white/10 backdrop-blur-md animate-pulse" />
          )}

          {/* 2. IMAGE or FALLBACK */}
          {profileSrc && !imgError ? (
            <img
              key={profileSrc}
              src={profileSrc}
              alt="Profile"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${
                isDirectUrl || blobLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setBlobLoaded(true)}
              onError={() => {
                setImgError(true);
                setBlobLoaded(true);
              }}
            />
          ) : (
            // 3. FALLBACK ICON
            <User
              size={20}
              className={`z-0 ${user ? "opacity-100" : "opacity-80"}`}
            />
          )}
        </motion.button>
      </Link>
    </div>
  );
};

export default UserHeader;
