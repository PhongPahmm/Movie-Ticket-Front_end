import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Card, Table, Button, Alert, Spinner } from "react-bootstrap";
import { createBooking } from "../services/bookingService";

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { movieInfo, showInfo, selectedSeats } = state || {};

  const [paymentMethod, setPaymentMethod] = useState("VN_PAY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total based on seat prices from API
  const total = selectedSeats?.reduce((sum, seat) => {
    return sum + (seat.price || 0);
  }, 0) || 0;

  // Redirect if missing required data
  useEffect(() => {
    if (!movieInfo || !showInfo || !selectedSeats?.length) {
      navigate("/");
    }
  }, [movieInfo, showInfo, selectedSeats, navigate]);

  const handlePayment = async () => {
    if (!selectedSeats?.length || !showInfo?.showId) {
      setError("Thông tin đặt vé không hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare booking request according to your API structure
      const bookingRequest = {
        showId: showInfo.showId,
        seats: selectedSeats.map(seat => seat.id || seat.seatId),
        paymentRequest: {
          paymentMethod: paymentMethod,
          orderInfo: `Booking for movie ${movieInfo.title}`
        },
        returnUrl: `${window.location.origin}/booking-return`
      };

      console.log("Booking request:", bookingRequest);

      // Call your booking API
      const response = await createBooking(bookingRequest);
      console.log('res', response);
      
      if (response.code === 200 && response.data) {
        const bookingData = response.data;
        
        // Store booking info in localStorage for return handling
        localStorage.setItem('pendingBooking', JSON.stringify({
          bookingId: bookingData.bookingId,
          paymentId: bookingData.paymentId,
          movieTitle: bookingData.movieTitle,
          screenName: bookingData.screenName,
          totalAmount: bookingData.totalAmount,
          expireTime: bookingData.expireTime,
          seats: bookingData.seats
        }));

        // Redirect to VNPay or other payment gateway
        if (bookingData.paymentUrl) {
          window.location.href = bookingData.paymentUrl;
        } else {
          throw new Error("Không nhận được URL thanh toán");
        }
      } else {
        throw new Error(response.message || "Không thể tạo đơn đặt vé");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setError(error.message || "Có lỗi xảy ra trong quá trình đặt vé. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Group seats by type for better display
  const seatsByType = selectedSeats?.reduce((acc, seat) => {
    const type = seat.seatType?.toLowerCase() || "standard";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(seat);
    return acc;
  }, {}) || {};

  const getSeatTypeDisplay = (seatType) => {
    const typeMap = {
      standard: "Ghế Thường",
      vip: "Ghế VIP",
      couple: "Ghế Đôi",
      premium: "Ghế Cao Cấp"
    };
    return typeMap[seatType.toLowerCase()] || seatType;
  };

  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      VN_PAY: "VNPAY",
      MOMO: "MoMo",
      ZALO_PAY: "ZaloPay",
      VIET_QR: "VietQR"
    };
    return methodMap[method] || method;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Thanh toán</h2>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Thông tin phim */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Thông tin phim</Card.Title>
          <p><strong>Phim:</strong> {movieInfo?.title}</p>
          <p><strong>Ngày giờ chiếu:</strong> {showInfo?.startTime?.slice(0,5)} - {new Date(showInfo?.startDate || showInfo?.showDate).toLocaleDateString("vi-VN")}</p>
          <p><strong>Ghế:</strong> {selectedSeats?.map(s => `${s.row}${s.number}`).join(", ")}</p>
          <p><strong>Phòng chiếu:</strong> {showInfo?.screenId || showInfo?.screenName}</p>
          <p><strong>Định dạng:</strong> {movieInfo?.format || "2D"}</p>
        </Card.Body>
      </Card>

      {/* Bảng thanh toán chi tiết */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Chi tiết thanh toán</Card.Title>
          <Table bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Loại ghế</th>
                <th>Vị trí ghế</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(seatsByType).map(([seatType, seats]) => {
                const price = seats[0]?.price || 0;
                const subtotal = seats.length * price;

                return (
                  <tr key={seatType}>
                    <td>{getSeatTypeDisplay(seatType)}</td>
                    <td>{seats.map(s => `${s.row}${s.number}`).join(", ")}</td>
                    <td>{seats.length}</td>
                    <td>{price.toLocaleString("vi-VN")}₫</td>
                    <td>{subtotal.toLocaleString("vi-VN")}₫</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Phương thức thanh toán */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Phương thức thanh toán</Card.Title>
          <div className="d-flex gap-3 mt-3 flex-wrap">
            <label className={`btn ${paymentMethod === "VN_PAY" ? "btn-primary" : "btn-outline-primary"}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "VN_PAY"}
                onChange={() => setPaymentMethod("VN_PAY")}
                className="me-2"
              />
              VNPAY
            </label>
            <label className={`btn ${paymentMethod === "MOMO" ? "btn-danger" : "btn-outline-danger"}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "MOMO"}
                onChange={() => setPaymentMethod("MOMO")}
                className="me-2"
              />
              MoMo
            </label>
            <label className={`btn ${paymentMethod === "ZALO_PAY" ? "btn-info" : "btn-outline-info"}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "ZALO_PAY"}
                onChange={() => setPaymentMethod("ZALO_PAY")}
                className="me-2"
              />
              ZaloPay
            </label>
            <label className={`btn ${paymentMethod === "VIET_QR" ? "btn-success" : "btn-outline-success"}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "VIET_QR"}
                onChange={() => setPaymentMethod("VIET_QR")}
                className="me-2"
              />
              VietQR
            </label>
          </div>
        </Card.Body>
      </Card>

      {/* Chi phí */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Tổng chi phí</Card.Title>
          <div className="d-flex justify-content-between">
            <div>Tiền vé ({selectedSeats?.length} ghế):</div>
            <div>{total.toLocaleString("vi-VN")}₫</div>
          </div>
          <div className="d-flex justify-content-between">
            <div>Phí xử lý:</div>
            <div>0₫</div>
          </div>
          <div className="d-flex justify-content-between">
            <div>Thuế VAT (0%):</div>
            <div>0₫</div>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <div>Tổng cộng:</div>
            <div className="text-danger">{total.toLocaleString("vi-VN")}₫</div>
          </div>
        </Card.Body>
      </Card>

      {/* Buttons */}
      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <Button 
          variant="danger" 
          size="lg" 
          onClick={handlePayment}
          disabled={total === 0 || loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Đang xử lý...
            </>
          ) : (
            <>Thanh toán {total.toLocaleString("vi-VN")}₫ qua {getPaymentMethodDisplay(paymentMethod)}</>
          )}
        </Button>
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Quay lại
        </Button>
      </div>

      <Alert variant="info" className="mt-4 text-center">
        <strong>Thông tin:</strong> Bạn sẽ được chuyển đến trang thanh toán của {getPaymentMethodDisplay(paymentMethod)} để hoàn tất giao dịch.
      </Alert>

      <Alert variant="warning" className="mt-2 text-center">
        <strong>Lưu ý:</strong> 
        <ul className="mb-0 mt-2 text-start">
          <li>Vé sẽ được giữ trong 15 phút kể từ khi tạo đơn đặt</li>
          <li>Không mua vé cho trẻ em dưới 13 tuổi đối với các suất chiếu kết thúc sau 22h00</li>
          <li>Không mua vé cho trẻ dưới 16 tuổi với các suất chiếu sau 23h00</li>
        </ul>
      </Alert>

      <style>{`
        input[type="radio"] {
          display: none;
        }
        .btn label input[type="radio"] + span {
          pointer-events: none;
        }
      `}</style>
    </Container>
  );
};

export default PaymentPage;