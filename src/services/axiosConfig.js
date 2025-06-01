import axios from "axios";

// Create Axios instance
const axiosConfig = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Tự động thêm token vào header
axiosConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Bắt lỗi 401
axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      console.warn("Unauthorized, redirect to login...");
      localStorage.removeItem("accessToken");

      // Cập nhật trạng thái context nếu có thể
      // Hoặc reload trang để reset context
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosConfig;
