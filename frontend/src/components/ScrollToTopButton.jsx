import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

const ScrollToTopButton = () => {
  const { theme } = useContext(ThemeContext);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 10% of screen height (approx 10vh)
      // preventing it from flickering immediately at the very top.
      if (window.scrollY > window.innerHeight * 0.1) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={scrollToTop}
          style={{
            // Using your theme colors to match the rest of the app
            backgroundColor: theme.arrowBg,
            color: theme.text,
            boxShadow: theme.navbar.shadow,
          }}
          className="fixed bottom-8 right-8 z-[100] p-3 rounded-full shadow-2xl hover:opacity-80 transition-opacity backdrop-blur-sm"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
