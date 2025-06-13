import axios from "axios";

// Tạo axios instance
const axiosConfig = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // gửi cookie chứa refreshToken nếu có
});

let isRefreshing = false;
let refreshSubscribers = [];

// Hàm chờ tất cả các request retry sau khi refresh thành công
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Request Interceptor: thêm accessToken
axiosConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: xử lý 401
axiosConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và chưa retry lần nào
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Gọi refresh token
        const res = await axios.post(
          "http://localhost:8080/api/v1/auth/refresh",
          {},
          { withCredentials: true } // để gửi cookie refreshToken
        );

        const newAccessToken = res.data.newAccessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // Gắn token mới vào header
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return axiosConfig(originalRequest); // Retry lại request cũ
      } catch (refreshError) {
        console.error("🔁 Refresh token failed:", refreshError);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosConfig;
