import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosConfig from "../services/axiosConfig";
import { Container, Card, Alert, Spinner, Button } from "react-bootstrap";

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy query params từ URL
  const queryParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  // Gọi API backend để xử lý payment return
  const handlePaymentReturn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ví dụ endpoint backend xử lý payment return
      const response = await axiosConfig.get(
        `/bookings/payment-return/vnpay-payment?${location.search.substring(1)}`
      );

      if (response.data?.code === 200) {
        setPaymentResult(response.data.data);
      } else {
        setError(response.data?.message || "Xử lý thanh toán thất bại");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối hoặc server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePaymentReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="py-5">
      <Card className="p-4 mx-auto" style={{ maxWidth: 600 }}>
        <h3 className="mb-4 text-center">Kết quả thanh toán</h3>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Đang xử lý thanh toán...</p>
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        {!loading && paymentResult && (
          <>
            {paymentResult.paymentStatus === "SUCCESS" ? (
              <Alert variant="success" className="text-center">
                Thanh toán thành công! 🎉
                <br />
                Mã đặt vé: <strong>{paymentResult.bookingId}</strong>
                <br />
                Phim: <strong>{paymentResult.movieTitle}</strong>
                <br />
                Tổng tiền:{" "}
                <strong>
                  {paymentResult.totalAmount.toLocaleString("vi-VN")}₫
                </strong>
              </Alert>
            ) : (
              <Alert variant="warning" className="text-center">
                Thanh toán chưa hoàn tất hoặc bị hủy.
                <br />
                Vui lòng kiểm tra lại hoặc thử lại sau.
              </Alert>
            )}

            <div className="text-center mt-4">
              <Button variant="primary" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default BookingSuccess;
