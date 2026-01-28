import React, { useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Assuming react-router
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext"; // Adjust path as needed

const NotFound = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      {/* --- Background Decorative Grid --- */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${theme.text} 1px, transparent 1px), linear-gradient(90deg, ${theme.text} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* --- Main Content --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-2xl px-6 text-center"
      >
        {/* Big 404 Text */}
        <h1
          className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter select-none"
          style={{
            color: "transparent",
            WebkitTextStroke: `2px ${
              theme.navbar?.border || "rgba(150,150,150,0.2)"
            }`,
            opacity: 0.5,
          }}
        >
          404
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="-mt-4 md:-mt-8 mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-6"
            style={{
              borderColor: theme.navbar?.border,
              color: theme.navbar?.textIdle,
              backgroundColor: theme.bg,
            }}
          >
            <AlertCircle size={14} className="text-red-500" />
            <span>Error Code: PAGE_NOT_FOUND</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            We've lost this page in the void.
          </h2>
          <p
            className="text-base md:text-lg max-w-md mx-auto leading-relaxed"
            style={{ color: theme.navbar?.textIdle }}
          >
            The page you are looking for doesn't exist or has been moved. Check
            the URL or head back to the dashboard.
          </p>
        </motion.div>

        {/* --- Action Buttons --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-6 py-3 rounded-lg border font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              borderColor: theme.navbar?.border,
              color: theme.text,
            }}
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-opacity hover:opacity-90 shadow-lg"
            style={{
              backgroundColor: theme.text, // Inverts color for primary button
              color: theme.bg,
            }}
          >
            <Home size={18} />
            Back to Home
          </button>
        </motion.div>
      </motion.div>

      {/* --- Footer Note --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 text-xs opacity-50 font-mono"
        style={{ color: theme.navbar?.textIdle }}
      >
        Ihyaet System // ID: 404-ERR
      </motion.div>
    </div>
  );
};

export default NotFound;
