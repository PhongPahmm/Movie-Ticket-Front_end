import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuth2Redirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      loginSuccess(token); // cập nhật context
      navigate("/"); // quay về trang chủ hoặc profile
    } else {
      console.error("❌ No token found in OAuth2 redirect URL");
      navigate("/login");
    }
  }, [searchParams, navigate, loginSuccess]);

  return <div>Đang đăng nhập bằng Google...</div>;
};

export default OAuth2Redirect;
