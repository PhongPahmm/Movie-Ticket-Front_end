import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAuthenticated(!!token);
  }, []);

  const loginSuccess = (token = null) => {
    setAuthenticated(true);
    if (token) {
      localStorage.setItem("accessToken", token);
    }
  };

  const logout = async () => {
    try {
      const { logout: logoutAPI } = await import('../services/authService');
      await logoutAPI();
    } catch (error) {
      console.error("🔧 Logout API error:", error);
    }

    setAuthenticated(false);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ authenticated, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
