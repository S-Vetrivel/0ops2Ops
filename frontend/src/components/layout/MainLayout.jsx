import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";
import ScrollToTopButton from "../../components/ScrollToTopButton";
// 1. Main Layout: Includes Navbar, Footer, and Padding
// Used for standard pages (Home, Shop, About, etc.)
export const MainLayout = () => {
  return (
    <>
      <Navbar />
      <ScrollToTopButton />
      <div
        style={{
          paddingTop: "90px",
          width: "100%",
          minHeight: "100vh", // Ensures footer pushes down
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Outlet renders the child route (Home, Shop, etc.) */}
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
};
