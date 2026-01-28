// src/context/ThemeContext.js
import { createContext, useState, useEffect } from "react";
import { lightTheme, darkTheme } from "../theme";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check localStorage first, default to dark
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? darkTheme : lightTheme;
  });

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme.name === "dark" ? lightTheme : darkTheme
    );
  };

  useEffect(() => {
    localStorage.setItem("theme", theme.name);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        style={{
          background: theme.bg,
          color: theme.text,
          minHeight: "100vh",
          transition: "background 0.3s ease, color 0.3s ease",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
