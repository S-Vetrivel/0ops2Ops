import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const AUTH_ROUTES = ["/login", "/signup", "/register", "/forgot-password"];
const LOG_KEY = "auth_route_log";

const ArrowLeftIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const slides = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop",
    title: "Natural Harmony",
    text: "Connect with the world around you in perfect balance.",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop",
    title: "Silent Peaks",
    text: "Discover the tranquility of the mountains.",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop",
    title: "Ocean Breeze",
    text: "Feel the calm of the endless horizon.",
  },
];

const AuthLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || {
    bg: "#0f172a",
    text: "#ffffff",
    navbar: { textIdle: "#94a3b8" },
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  // ------------------------------------
  // Store route history (LOG)
  // ------------------------------------
  useEffect(() => {
    const pathname = location.pathname;
    let routeLog = JSON.parse(sessionStorage.getItem(LOG_KEY) || "[]");

    if (routeLog[routeLog.length - 1] !== pathname) {
      routeLog.push(pathname);
      if (routeLog.length > 100) routeLog.shift();
      sessionStorage.setItem(LOG_KEY, JSON.stringify(routeLog));
    }
  }, [location.pathname]);

  // ------------------------------------
  // SMART BACK FUNCTION (Skips auth pages)
  // ------------------------------------
  const smartBack = () => {
    let routeLog = JSON.parse(sessionStorage.getItem(LOG_KEY) || "[]");

    if (!routeLog.length) return navigate("/");

    const current = location.pathname;
    let target = "/";

    for (let i = routeLog.length - 2; i >= 0; i--) {
      const route = routeLog[i];
      const isAuth = AUTH_ROUTES.some((r) =>
        route.toLowerCase().includes(r.toLowerCase())
      );
      if (route !== current && !isAuth) {
        target = route;
        break;
      }
    }
    navigate(target);
  };

  // ------------------------------------
  // BROWSER BACK BUTTON (Desktop + Android + iOS)
  // ------------------------------------
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      smartBack();
    };
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ------------------------------------
  // SLIDER AUTO
  // ------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ------------------------------------
  // UI
  // ------------------------------------
  return (
    <div
      className="relative flex h-screen w-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Back Arrow */}
      {/* <button
        onClick={smartBack}
        className="absolute top-6 left-6 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group shadow-lg"
      >
        <ArrowLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button> */}

      {/* Background + Slider */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}

        <div
          className="absolute inset-0 z-10"
          style={{
            background: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 30%, ${theme.bg}E6 100%)`,
          }}
        />

        <div className="hidden lg:block absolute bottom-12 left-12 z-20 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-2">
            {slides[currentSlide].title}
          </h2>
          <p className="text-gray-200 text-lg">{slides[currentSlide].text}</p>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="relative z-10 w-full h-full lg:w-1/2 lg:ml-auto flex flex-col justify-center px-6 sm:px-12 xl:px-24 backdrop-blur-sm border-l border-white/10">
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-sm mt-20">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
