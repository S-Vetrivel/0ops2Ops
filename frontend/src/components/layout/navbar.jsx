import React, { useState, useEffect, useContext, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "@/context/ThemeContext";
import UserHeader from "./UserHeader";

// --- UNIFIED ROUTES CONFIGURATION ---
const ROUTES = [
  { name: "Contact", path: "/contact" },
  { name: "About", path: "/about" },
];

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const [isRevealed, setIsRevealed] = useState(false);

  // Ref to handle the hide delay
  const hideTimeoutRef = useRef(null);

  const location = useLocation();
  const { scrollY } = useScroll();

  const isShopPage = location.pathname === "/shop";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const matchingRoute = ROUTES.find((route) =>
      currentPath.startsWith(route.path)
    );

    if (matchingRoute) {
      setActiveTab(matchingRoute.name);
    } else {
      setActiveTab(null);
    }
  }, [location]);

  // --- SMOOTHER SCROLL LOGIC ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    const isScrollingDown = latest > previous;
    const isScrollingUp = latest < previous;

    // Logic to Hide (with delay)
    if (isScrollingDown && latest > 150 && !isMobileMenuOpen && !isSearchOpen) {
      // Only set the timer if we aren't already hidden and timer isn't running
      if (!isHidden && !hideTimeoutRef.current) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsHidden(true);
          hideTimeoutRef.current = null;
        }, 400); // 400ms delay to prevent jitter
      }
    }
    // Logic to Reveal (Immediate)
    else if (isScrollingUp || latest < 150) {
      // If we start scrolling up, clear any pending hide timer immediately
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setIsHidden(false);
    }
  });

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? "hidden" : "unset";
  }, [isSearchOpen]);

  // --- SMOOTHER ANIMATION VARIANTS ---
  const navbarVariants = {
    visible: {
      y: 0,
      opacity: 1,
      // Custom bezier for a premium "heavy" feel
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    hidden: {
      y: "-140%", // Move slightly further up to ensure shadow clears
      opacity: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      <motion.div
        variants={navbarVariants}
        animate={!isRevealed || isHidden ? "hidden" : "visible"}
        initial="hidden"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1000px]"
      >
        <motion.nav
          layout
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          style={{
            backgroundColor: theme.navbar.bg,
            borderColor: theme.navbar.border,
            boxShadow: theme.navbar.shadow,
          }}
          className="p-2 rounded-[30px] border overflow-hidden backdrop-blur-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between pr-2 pl-2">
            {/* --- LEFT SECTION: Logo + Search (Mobile & Desktop) --- */}
            <div className="flex items-center gap-3">
              {/* Logo */}
              <Link to="/">
                <motion.div
                  layout="position"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: theme.navbar.logoBg,
                    color: theme.navbar.logoText,
                  }}
                  className="px-6 py-2.5 rounded-full text-sm font-bold transition-colors shrink-0 z-20 cursor-pointer block"
                >
                  ihyaet
                </motion.div>
              </Link>

              {/* Search Trigger - ANIMATED HIDE/SHOW ON SHOP PAGE */}
              <AnimatePresence>
                {!isShopPage && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      width: "auto",
                      scale: 1,
                      transition: {
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1], // Snappy Entrance
                      },
                    }}
                    exit={{
                      opacity: 0,
                      width: 0,
                      scale: 0.8,
                      transition: {
                        delay: 0.2, // WAIT 0.5s before hiding
                        duration: 1, // Then animate out smoothly
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }}
                    className="flex items-center gap-3 overflow-hidden origin-left"
                  >
                    {/* Desktop Search Button */}
                    <div className="hidden md:block">
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        style={{
                          backgroundColor: theme.navbar.searchBg,
                          color: theme.navbar.searchText,
                          borderColor: theme.navbar.searchBorder,
                        }}
                        className="relative group flex items-center pl-3 pr-4 py-2.5 rounded-full transition-all w-[160px] hover:w-[180px] border whitespace-nowrap"
                      >
                        <SearchIcon
                          className="h-4 w-4 mr-2"
                          style={{ color: theme.navbar.iconColor }}
                        />
                        <span className="text-sm">Search...</span>
                        <span
                          style={{
                            backgroundColor: theme.navbar.searchBg,
                            borderColor: theme.navbar.searchBorder,
                            color: theme.navbar.textIdle,
                          }}
                          className="absolute right-3 text-xs px-1.5 py-0.5 rounded border"
                        >
                          Ask AI
                        </span>
                      </button>
                    </div>

                    {/* Mobile Search Icon (Moved near logo) */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        style={{
                          backgroundColor: theme.navbar.searchBg,
                          color: theme.navbar.iconColor,
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                      >
                        <SearchIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- CENTER SECTION: Links (Desktop) --- */}
            <motion.ul
              layout="position"
              className="hidden md:flex items-center gap-2 lg:gap-2 px-4"
            >
              {ROUTES.map((route) => (
                <li key={route.name} className="relative z-0">
                  {/* Highlight Pill */}
                  {activeTab === route.name && (
                    <motion.span
                      layoutId="active-pill"
                      style={{ backgroundColor: theme.navbar.activePill }}
                      className="absolute inset-0 rounded-full -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <FlipLink
                    to={route.path}
                    onClick={() => setActiveTab(route.name)}
                    theme={theme}
                  >
                    {route.name}
                  </FlipLink>
                </li>
              ))}
            </motion.ul>

            {/* --- RIGHT SECTION: Desktop (Toggle -> Cart -> Profile) --- */}
            <motion.div
              layout="position"
              className="hidden md:flex items-center gap-2"
            >
              {/* 1. Theme Toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  backgroundColor: theme.navbar.searchBg,
                  color: theme.navbar.iconColor,
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
              >
                {theme.name === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>

              {/* 2. UserHeader (Cart + Profile) */}
              <UserHeader theme={theme} />
            </motion.div>

            {/* --- RIGHT SECTION: Mobile (Cart -> Profile -> Menu) --- */}
            {/* Note: Toggle is moved to the Mobile Menu Overview */}
            <div className="md:hidden flex items-center gap-2 z-20">
              {/* UserHeader (Cart + Profile) */}
              <UserHeader theme={theme} />

              {/* Hamburger Menu */}
              <button
                onClick={toggleMenu}
                style={{
                  backgroundColor: theme.navbar.logoBg,
                  color: theme.navbar.logoText,
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </motion.div>
              </button>
            </div>
          </div>

          {/* --- Mobile Menu Overview --- */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="p-4 flex flex-col gap-6">
                  {/* Links */}
                  <ul className="flex flex-col gap-2 text-center">
                    {ROUTES.map((route, i) => (
                      <motion.li
                        key={route.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                      >
                        <Link
                          to={route.path}
                          onClick={() => {
                            setActiveTab(route.name);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{
                            color:
                              activeTab === route.name
                                ? theme.navbar.textHover
                                : theme.navbar.textIdle,
                          }}
                          className="text-xl font-medium block py-2 transition-colors"
                        >
                          {route.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Divider */}
                  <div className="h-px w-full bg-current opacity-10"></div>

                  {/* Theme Toggle (Mobile Overview) */}
                  <div className="flex justify-center">
                    <button
                      onClick={toggleTheme}
                      style={{
                        backgroundColor: theme.navbar.searchBg,
                        color: theme.navbar.iconColor,
                      }}
                      className="flex items-center gap-3 px-6 py-3 rounded-full transition-colors w-full justify-center font-medium"
                    >
                      {theme.name === "dark" ? <SunIcon /> : <MoonIcon />}
                      <span>
                        {theme.name === "dark" ? "Light Mode" : "Dark Mode"}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </motion.div>

      {/* --- Search Overview --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverview
            onClose={() => setIsSearchOpen(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- SIMPLIFIED FlipLink Component ---
const MotionLink = motion(Link);

const FlipLink = ({ children, to, onClick, theme }) => {
  return (
    <MotionLink
      initial="initial"
      whileHover="hovered"
      to={to}
      onClick={onClick}
      style={{ color: theme.navbar.textIdle }}
      className="relative block overflow-hidden whitespace-nowrap text-sm font-medium px-4 py-2 transition-colors duration-200 hover:text-current"
    >
      <motion.div
        variants={{
          initial: { y: 0, opacity: 1 },
          hovered: { y: "-100%", opacity: 0 },
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: theme.navbar.textHover }}
        variants={{
          initial: { y: "100%", opacity: 0 },
          hovered: { y: 0, opacity: 1 },
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </MotionLink>
  );
};

// --- Search Overview Component ---
const SearchOverview = ({ onClose, theme }) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.history.pushState({ searchOpen: true }, "", window.location.href);
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  const handleManualClose = () => window.history.back();

  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleManualClose();
    if (e.key === "Backspace" && searchQuery === "") handleManualClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backgroundColor: theme.navbar.modalOverlay }}
      className="fixed inset-0 z-[60] backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={handleManualClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          backgroundColor: theme.navbar.modalBg,
          borderColor: theme.navbar.border,
          boxShadow: theme.navbar.shadow,
        }}
        className="w-full max-w-2xl border rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="border-b p-4 flex items-center gap-4"
          style={{ borderColor: theme.navbar.border }}
        >
          <SearchIcon
            className="h-6 w-6"
            style={{ color: theme.navbar.textIdle }}
          />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, resources, or commands..."
            style={{ color: theme.navbar.textHover }}
            className="flex-1 bg-transparent text-xl outline-none placeholder:opacity-50 h-12"
          />
          <button
            onClick={handleManualClose}
            style={{
              backgroundColor: theme.navbar.searchBg,
              color: theme.navbar.textIdle,
            }}
            className="p-2 rounded-full transition-colors hover:opacity-80"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {searchQuery === "" ? (
            <>
              <p
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: theme.navbar.textIdle }}
              >
                Quick Links
              </p>
              <div className="space-y-1">
                {[
                  "Recent Projects",
                  "Documentation",
                  "Contact Me",
                  "Playground",
                ].map((item) => (
                  <button
                    key={item}
                    style={{ color: theme.navbar.textIdle }}
                    className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center justify-between group transition-colors"
                  >
                    <span className="group-hover:text-current">{item}</span>
                    <span className="opacity-50 group-hover:opacity-100">
                      ↵
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div
              className="text-center py-10"
              style={{ color: theme.navbar.textIdle }}
            >
              Searching for "{searchQuery}"...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Icons ---

const SearchIcon = ({ className, style }) => (
  <svg
    className={className}
    style={style}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const SunIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default Navbar;
