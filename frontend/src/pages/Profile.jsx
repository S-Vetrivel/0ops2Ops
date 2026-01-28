import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "@/context/ThemeContext";
import { useApp } from "../context/Appcontext";
import { logout, uploadProfileImage, checkAuth } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../components/layout/Modal";
import toast from "react-hot-toast";

// Import Components
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileSidebar from "../components/profile/ProfileSidebar";

// Import Tabs
import PersonalInfoTab from "../components/profile/tabs/PersonalInfoTab";

// Import Constants
import { PROFILE_TABS } from "../components/profile/constants";

// Map IDs to Component Objects
const TAB_COMPONENTS = {
  personal: PersonalInfoTab,
};

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { setUser, user } = useApp();

  const [activeTabId, setActiveTabId] = useState("personal");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Handle Profile Image Upload
  const handleProfileImageUpdate = async (file) => {
    if (!file) return;

    // A. Optimistic Update (Immediate Feedback)
    const localImageUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, profilePicture: localImageUrl }));

    try {
      setIsUploading(true);
      // B. Upload to Server
      const res = await uploadProfileImage(file);

      if (res.success) {
        // C. Poll/Sync for Background Processing
        // Wait 3s for worker to resize image, then fetch fresh data
        setTimeout(async () => {
          try {
            const authRes = await checkAuth();
            if (authRes.isAuthenticated) {
              setUser(authRes.user); // Sync with server
            }
          } catch (err) {
            console.error("Failed to sync profile", err);
          } finally {
            setIsUploading(false);
          }
        }, 3000);
      } else {
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  // 2. Handle Logout
  const handleLogoutConfirm = async () => {
    const res = await logout();
    if (res.success) {
      setIsLogoutModalOpen(false);
      setUser(null);
      navigate("/login");
    }
  };

  // Determine which component to render
  const ActiveComponent = TAB_COMPONENTS[activeTabId];

  // Prevent rendering if user context isn't ready yet
  if (!user) return null;

  return (
    <div
      className="min-h-screen w-full pt-28 pb-24 px-6 md:px-12 transition-colors duration-500"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* --- HEADER --- */}
        <ProfileHeader
          user={user}
          theme={theme}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
          onUpdateProfileImage={handleProfileImageUpdate} // Pass the handler
          isLoading={isUploading}
        />

        {/* --- MAIN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              tabs={PROFILE_TABS}
              activeTabId={activeTabId}
              onTabChange={setActiveTabId}
              theme={theme}
              isAdmin={user?.role === "admin"}
            />
          </div>

          {/* DYNAMIC CONTENT AREA */}
          <div className="lg:col-span-3 min-h-[500px]">
            <AnimatePresence mode="wait">
              {ActiveComponent && (
                <motion.div
                  key={activeTabId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ActiveComponent
                    theme={theme}
                    user={user}
                    setUser={setUser}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- LOGOUT MODAL --- */}
        <Modal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          theme={theme}
          title="Sign Out"
          description="Are you sure you want to sign out? You will need to login again to access your account details."
        >
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleLogoutConfirm}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Yes, Sign Out
            </button>

            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{
                borderColor: theme.navbar?.border,
                color: theme.navbar?.textIdle || theme.text,
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
