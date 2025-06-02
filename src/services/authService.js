import axiosConfig from "./axiosConfig";

export const login = async (credentials) => {
  const response = await axiosConfig.post("/auth/log-in", credentials);
  return response.data;
};

export const logout = async () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const response = await axiosConfig.post("/auth/log-out", {
        token: token,
      });
      return response.data;
    } catch (error) {
      console.error("Logout API error:", error);
      return { logout: true };
    }
  }
  return { logout: true };
};
