import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import UserHeader from "./UserHeader";

const ROUTES = [
  { name: "Dashboard", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Settings", path: "/settings" },
];

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm transition-colors duration-300"
      style={{
        backgroundColor: theme.navbar.bg,
        borderColor: theme.navbar.border,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* --- LEFT: Logo + Links --- */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={theme.name === 'dark' ? 'black' : 'white'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span
              className="font-bold text-lg tracking-tight"
              style={{ color: theme.text }}
            >
              0ops2Ops
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {ROUTES.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive(route.path)
                    ? ""
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                style={{
                  color: isActive(route.path)
                    ? theme.text
                    : theme.navbar.textIdle,
                }}
              >
                {route.name}
                {isActive(route.path) && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-md bg-zinc-100 dark:bg-zinc-800 -z-10"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* --- RIGHT: User + Theme --- */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              style={{ color: theme.navbar.textIdle }}
            >
              {theme.name === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>

            {/* Feedback / Help */}
            <button
              className="text-sm font-medium px-3 py-1.5 border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              style={{ borderColor: theme.navbar.border, color: theme.text }}
            >
              Feedback
            </button>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

          <UserHeader theme={theme} />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: theme.text }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b"
            style={{ backgroundColor: theme.navbar.bg, borderColor: theme.navbar.border }}
          >
            <div className="px-4 py-4 space-y-2">
              {ROUTES.map(route => (
                <Link
                  key={route.path}
                  to={route.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  style={{ color: theme.text }}
                >
                  {route.name}
                </Link>
              ))}
              <div className="pt-2 border-t mt-2" style={{ borderColor: theme.navbar.border }}>
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-4 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  style={{ color: theme.text }}
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
