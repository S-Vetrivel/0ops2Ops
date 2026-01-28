import React, { createContext, useContext, useState, useEffect } from "react";
import { checkAuth } from "../services/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. OPTIMISTIC INITIALIZATION
  // We initialize immediately from LocalStorage so the user can use the app offline.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("app_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // This loading state now just means "Background validation is running"
  // It does NOT block the UI anymore.
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      let isChecked = false;

      // 2. BACKGROUND VALIDATION LOOP
      // This runs silently. If offline, it retries forever.
      // If online, it updates the user state to the "source of truth" from the server.
      while (!isChecked) {
        try {
          const result = await checkAuth();

          if (result.isAuthenticated) {
            // Server confirms user: Update state (in case details changed)
            setUser(result.user);
          } else {
            // Server says invalid session (e.g., token expired): Force logout
            setUser(null);
          }

          isChecked = true; // Connection successful, stop loop
        } catch (error) {
          // Network Error: Keep using LocalStorage data, retry in 3s
          console.warn("Network unreachable. Retrying in background...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      setIsValidating(false);
    };

    verifyUser();
  }, []);

  // 3. SYNC LOCAL STORAGE
  useEffect(() => {
    if (user) localStorage.setItem("app_user", JSON.stringify(user));
    else localStorage.removeItem("app_user");
  }, [user]);

  return (
    // We expose 'isValidating' in case you want to show a small "Connecting..."
    // badge in a corner, but the main app renders immediately.
    <AppContext.Provider value={{ user, setUser, isValidating }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
