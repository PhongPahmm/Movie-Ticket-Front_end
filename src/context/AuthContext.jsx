import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Khởi tạo authenticated dựa trên localStorage
  const [authenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem("accessToken");
    console.log("🔧 AuthProvider init - Token từ localStorage:", token);
    console.log("🔧 AuthProvider init - Authenticated:", !!token);
    return !!token; // Trả về true nếu có token, false nếu không
  });

  // Kiểm tra token khi component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("🔧 AuthProvider useEffect - Token:", token);
    console.log("🔧 AuthProvider useEffect - Setting authenticated:", !!token);
    setAuthenticated(!!token);
  }, []);

  // Log mỗi khi authenticated thay đổi
  useEffect(() => {
    console.log("🔧 AuthProvider - Authenticated changed:", authenticated);
  }, [authenticated]);

  const loginSuccess = (token = null) => {
    console.log("🔧 loginSuccess called with token:", token);
    setAuthenticated(true);
    // Nếu có token được truyền vào, lưu vào localStorage
    if (token) {
      localStorage.setItem("accessToken", token);
      console.log("🔧 Token saved to localStorage:", token);
    }
  };

  const logout = async () => {
    console.log("🔧 logout called");
    try {
      // Gọi logout API
      const { logout: logoutAPI } = await import('../services/authService');
      await logoutAPI();
      console.log("🔧 Logout API called successfully");
    } catch (error) {
      console.error("🔧 Logout API error:", error);
    }
    
    setAuthenticated(false);
    localStorage.removeItem("accessToken");
    console.log("🔧 Token removed from localStorage");
  };

  return (
    <AuthContext.Provider value={{ authenticated, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);