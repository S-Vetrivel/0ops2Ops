import axios from "axios";
import toast from "react-hot-toast";

// 1. Configuration Constants
const API_URL = `${import.meta.env.VITE_API_URL}/api`;
export const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;

// 2. Create Axios Instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Response Interceptor (Global Error Handling)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ==============================================================
    // 🛑 SILENT ROUTES: Don't show popups for these endpoints
    // ==============================================================
    const silentRoutes = ["/auth/me", "/gallery"];

    // Check if the current request URL matches any silent route
    if (
      error.config &&
      silentRoutes.some((route) => error.config.url.includes(route))
    ) {
      return Promise.reject(error);
    }
    // ==============================================================

    // A. Network / Connection Errors
    if (!error.response) {
      toast.error("Network Error - Is the Network available?");
      return Promise.reject(error);
    }

    // B. Extract message
    const { status, data } = error.response;
    const backendMessage = data?.message || "An unexpected error occurred.";

    // C. Handle specific status codes
    if (status === 401) {
      toast.error(backendMessage);

      setTimeout(() => {
        // Prevent redirect loop if already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }, 1000);
    } else if (status === 403) {
      toast.error(backendMessage);
    } else if (status === 404) {
      toast.error(backendMessage);
    } else if (status >= 500) {
      toast.error(backendMessage);
    } else {
      toast.error(backendMessage);
    }

    return Promise.reject(error);
  }
);

// 4. Login Function
export async function loginUser(email, password) {
  try {
    const response = await api.post("/auth/login", { email, password });
    toast.success(response.data.message || "Login Successful!");
    return {
      success: true,
      user: response.data.user,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed.",
    };
  }
}

// 5. SignUp Function
export async function SignUp(name, email, password, confirmPassword) {
  if (password !== confirmPassword) {
    toast.error("Passwords do not match!");
    return { success: false, message: "Passwords do not match" };
  }

  try {
    const response = await api.post("/auth/signup", {
      fullname: name,
      username: email.split("@")[0],
      email,
      password,
      confirmPassword,
    });
    toast.success(response.data.message || "Account created successfully!");
    return {
      success: true,
      user: response.data.user,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Signup failed.",
    };
  }
}

// 6. Check Auth Function (Silent)
export async function checkAuth() {
  try {
    const response = await api.get("/auth/me");
    return {
      isAuthenticated: true,
      user: response.data.user,
    };
  } catch (error) {
    // CASE 1: Server responded, but said "Unauthorized" (401)
    if (error.response && error.response.status === 401) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    // CASE 2: Network Error or Server Down (No response or 500s)
    // We throw the error so the Provider knows to retry
    throw error;
  }
}

// 7. Logout Function
export async function logout() {
  try {
    await api.get("/auth/logout");
    toast.success("Logged out successfully");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 8. Reset Password Function
export async function ResetPassword(email) {
  try {
    await api.post("/auth/reset-password", {
      email,
    });
    toast.success("Email sent successfully!");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 9. Personal Info Update Function
export async function UpdatePersonalInfo(data) {
  try {
    const res = await api.put("/profile/info", data);

    toast.success(res.data?.message || "Profile updated successfully!");

    return {
      success: true,
      user: res.data?.user,
      message: res.data?.message,
    };
  } catch (error) {
    // Error toast handled by interceptor usually, but safe to return logic here
    return {
      success: false,
      message: error.response?.data?.message || "Update failed",
    };
  }
}

// 10. Upload Profile Picture Function (NEW)
export async function uploadProfileImage(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/profile/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(res.data?.message || "Upload started! Updating soon...");

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (error) {
    console.error("Profile Upload Error:", error);
    // Error is typically shown by interceptor, but we return false to handle loading states
    return {
      success: false,
      message: error.response?.data?.message || "Upload failed",
    };
  }
}

// 11. Google One Tap Login Function
export async function googleOneTapLogin(token) {
  try {
    const response = await api.post("/auth/google/onetap", { token });

    toast.success(response.data.message || "Google Login Successful!");

    return {
      success: true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Google Login Failed",
    };
  }
}




export default api;
