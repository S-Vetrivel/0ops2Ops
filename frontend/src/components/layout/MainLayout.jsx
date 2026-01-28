import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export const MainLayout = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <Navbar />
      {/* <ScrollToTopButton /> */}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
