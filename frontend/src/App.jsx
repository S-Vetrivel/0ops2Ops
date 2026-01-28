import "./App.css";
import { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// CONTEXT
import { ThemeContext } from "./context/ThemeContext";
import { useApp } from "./context/Appcontext";

// COMPONENTS
import ScrollToTop from "./components/ScrollToTop";
import AuthLayout from "./components/layout/AuthLayout";

// PAGES
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { MainLayout } from "./components/layout/MainLayout";
import ForgetPassword from "./pages/ForgetPassword";
import NotFound from "./pages/NotFound";
// import GoogleOneTap from "./components/GoogleOneTap";

function App() {
  const { user } = useApp();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.documentElement.style.backgroundColor = theme.bg;
    document.body.style.backgroundColor = theme.bg;
    document.documentElement.style.color = theme.text;
  }, [theme]);
  // console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#333", color: "#fff" },
          success: { duration: 3000 },
        }}
      />

      <ScrollToTop />
      {/* {!user && <GoogleOneTap />} */}
      <Routes>
        {/* =============== AUTH ROUTES =============== */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <Signup />}
          />
          <Route
            path="/forgot-password"
            element={user ? <Navigate to="/" replace /> : <ForgetPassword />}
          />
        </Route>

        {/* =============== MAIN LAYOUT ROUTES =============== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* SIMPLE GUARD: If not logged in → go to login */}
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </Route>
        {/* =============================================== */}
      </Routes>
    </>
  );
}

export default App;
