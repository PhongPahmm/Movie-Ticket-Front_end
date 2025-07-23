import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Divider,
  Tooltip,
  message,
  Spin,
} from "antd";
import { getSeatsByShowId } from "../services/seatService";
import { getShowById } from "../services/showService";
import { getMovieById } from "../services/movieService";
import { getPriceByShowIdSeatTypeDate } from "../services/priceService";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const { Title, Text } = Typography;

const BookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);

  const [showInfo, setShowInfo] = useState(null);
  const [movieInfo, setMovieInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // WebSocket refs
  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket connection setup
  useEffect(() => {
    if (!showId) return;

    const connectWebSocket = () => {
      try {
        if (typeof global === "undefined") {
          window.global = window;
        }

        const stompClient = new Client({
          webSocketFactory: () => new SockJS("http://localhost:8080/api/v1/ws"),
          debug: (str) => console.log("📡 [DEBUG-STOMP] " + str),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders: {
            // Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        stompClient.onConnect = (frame) => {
          console.log("✅ [DEBUG] WebSocket connected:", frame);
          setIsConnected(true);

          const subscription = stompClient.subscribe(
            `/topic/show/${showId}/seats`,
            (message) => {
              console.log(
                "📨 [DEBUG] Received seat update message:",
                message.body
              );

              try {
                const seatUpdate = JSON.parse(message.body);
                console.log("🔄 [DEBUG] Parsed seat update:", seatUpdate);

                if (!Array.isArray(seatUpdate.seatIds)) {
                  console.error(
                    "❌ [DEBUG] seatIds is not an array:",
                    seatUpdate.seatIds
                  );
                  return;
                }

                // ✅ Cập nhật danh sách ghế
                setSeats((prevSeats) => {
                  const updated = prevSeats.map((seat) => {
                    if (
                      seatUpdate.seatIds.some(
                        (id) => String(id) === String(seat.id)
                      )
                    ) {
                      if (seat.status !== seatUpdate.seatStatus) {
                        console.log(
                          `🔁 [DEBUG] Updating seat ${seat.id} from ${seat.status} to ${seatUpdate.seatStatus}`
                        );
                        return { ...seat, status: seatUpdate.seatStatus };
                      }
                      return { ...seat }; // Ép render
                    }
                    return seat;
                  });

                  return [...updated];
                });

                // ✅ Gỡ các ghế bị chiếm khỏi selectedSeats nếu có
                if (
                  seatUpdate.seatStatus === "PENDING" ||
                  seatUpdate.seatStatus === "BOOKED"
                ) {
                  setSelectedSeats((prevSelected) => {
                    const affectedSeats = prevSelected.filter((seatId) =>
                      seatUpdate.seatIds.some(
                        (id) => String(id) === String(seatId)
                      )
                    );

                    if (affectedSeats.length > 0) {
                      console.warn(
                        `[DEBUG] ⚠ Ghế bị ảnh hưởng: ${affectedSeats.join(
                          ", "
                        )}`
                      );

                      if (seatUpdate.seatStatus === "PENDING") {
                        message.warning(
                          "Một số ghế bạn đã chọn đang được đặt bởi người khác"
                        );
                      } else {
                        message.error("Một số ghế bạn đã chọn đã được đặt");
                      }

                      return prevSelected.filter(
                        (seatId) =>
                          !seatUpdate.seatIds.some(
                            (id) => String(id) === String(seatId)
                          )
                      );
                    }

                    return prevSelected;
                  });
                }
              } catch (error) {
                console.error("❌ [DEBUG] Error parsing message body:", error);
              }
            }
          );

          console.log(
            "📡 [DEBUG] Subscribed to topic:",
            `/topic/show/${showId}/seats`
          );
        };

        stompClient.onStompError = (frame) => {
          console.error("🚨 [DEBUG] STOMP error:", frame.headers["message"]);
          console.error("📄 [DEBUG] Frame body:", frame.body);
          setIsConnected(false);
        };

        stompClient.onWebSocketError = (error) => {
          console.error("❌ [DEBUG] WebSocket connection error:", error);
          setIsConnected(false);
        };

        stompClient.onDisconnect = () => {
          console.log("🔌 [DEBUG] WebSocket disconnected");
          setIsConnected(false);
        };

        stompClient.activate();
        stompClientRef.current = stompClient;
      } catch (err) {
        console.error("❌ [DEBUG] Error initializing WebSocket:", err);
        setIsConnected(false);
      }
    };

    const timeout = setTimeout(connectWebSocket, 1000);

    return () => {
      clearTimeout(timeout);
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("🧹 [DEBUG] Cleaning up WebSocket connection...");
        stompClientRef.current.deactivate();
        setIsConnected(false);
      }
    };
  }, [showId]);

  useEffect(() => {
    if (!showId) {
      navigate("/");
      return;
    }

    const fetchInfo = async () => {
      try {
        setLoadingInfo(true);
        setLoadingSeats(true);

        const showRes = await getShowById(showId);
        const show = showRes?.data?.data || showRes?.data || showRes;
        setShowInfo(show);

        if (!show.movieId) {
          console.error("movieId is undefined");
          return;
        }

        const movieRes = await getMovieById(show.movieId);
        const movie = movieRes?.data?.data || movieRes?.data || movieRes;
        setMovieInfo(movie);

        const seatRes = await getSeatsByShowId(showId);
        const seatData = seatRes?.data?.data || seatRes?.data || seatRes;

        const showDate = show.showDate;

        const seatTypes = [...new Set(seatData.map((seat) => seat.seatType))];
        const priceMap = {};
        await Promise.all(
          seatTypes.map(async (seatType) => {
            const price = await getPriceByShowIdSeatTypeDate(
              showId,
              seatType,
              showDate
            );
            priceMap[seatType] = price;
          })
        );

        const seatsWithPrice = seatData.map((seat) => ({
          ...seat,
          price: priceMap[seat.seatType] || 0,
        }));

        setSeats(seatsWithPrice);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        message.error("Không thể tải thông tin đặt vé");
      } finally {
        setLoadingInfo(false);
        setLoadingSeats(false);
        setSelectedSeats([]);
      }
    };

    fetchInfo();
  }, [showId, navigate]);

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});
  Object.values(groupedSeats).forEach((row) =>
    row.sort((a, b) => a.number - b.number)
  );

  const getColor = (s) => {
    if (s.status === "BOOKED") return "#595959"; // Đen xám
    if (s.status === "PENDING") return "#d46b08"; // Cam đậm
    if (selectedSeats.includes(s.id)) return "#fadb14"; // Vàng sáng
    if (s.seatType === "VIP") return "#cf1322"; // Đỏ đậm
    if (s.seatType === "COUPLE") return "#722ed1"; // Tím
    return "#91d5ff"; // Xanh nhạt (ghế thường)
  };

  const totalPrice = seats
    .filter((s) => selectedSeats.includes(s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const handleConfirm = () => {
    const chosen = seats.filter((s) => selectedSeats.includes(s.id));
    navigate("/payment", {
      state: { movieInfo, showInfo, selectedSeats: chosen },
    });
  };

  if (loadingInfo || loadingSeats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <Row gutter={16} style={{ padding: 24 }}>
      {/* LEFT: Seat layout */}
      <Col span={16}>
        <Card>
          <Title level={4} style={{ textAlign: "center" }}>
            🎬 {movieInfo?.title}
          </Title>
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center", marginBottom: 10 }}
          >
            {showInfo?.showDate} | {showInfo?.startTime} - {showInfo?.endTime}
          </Text>

          <div
            style={{
              height: 20,
              background: "#aaa",
              borderRadius: 10,
              margin: "10px auto",
              width: "80%",
            }}
          ></div>
          <Text
            type="secondary"
            style={{ textAlign: "center", display: "block", marginBottom: 20 }}
          >
            Màn hình
          </Text>

          {Object.entries(groupedSeats).map(([row, seats]) => (
            <Row key={row} justify="center" style={{ marginBottom: 10 }}>
              <Col span={1}>
                <b>{row}</b>
              </Col>
              <Col>
                {seats.map((seat) => (
                  <Tooltip
                    key={seat.id}
                    title={`Ghế ${seat.row}-${seat.number} (${
                      seat.seatType
                    }) - Giá: ${seat.price.toLocaleString()} VND`}
                  >
                    <Button
                      shape="circle"
                      style={{
                        margin: 2,
                        backgroundColor: getColor(seat),
                        color: "#000",
                        border: "none",
                      }}
                      disabled={
                        seat.status === "BOOKED" || seat.status === "PENDING"
                      }
                      onClick={() => toggleSeat(seat.id)}
                    >
                      {seat.number}
                    </Button>
                  </Tooltip>
                ))}
              </Col>
            </Row>
          ))}
        </Card>
      </Col>

      {/* RIGHT: Booking info */}
      <Col span={8}>
        <Card title="📝 Thông tin đặt vé">
          <p>
            Phòng: <b>{showInfo?.screenId}</b>
          </p>
          <p>
            Ngày chiếu: <b>{showInfo?.showDate}</b>
          </p>
          <p>
            Giờ:{" "}
            <b>
              {showInfo?.startTime} - {showInfo?.endTime}
            </b>
          </p>

          <Divider />

          <p>Ghế đã chọn: {selectedSeats.length}</p>
          <p style={{ color: "red" }}>
            Tổng tiền: {totalPrice.toLocaleString()} VND
          </p>

          <Button
            type="primary"
            block
            disabled={selectedSeats.length === 0}
            onClick={handleConfirm}
          >
            Xác nhận đặt vé
          </Button>

          <Divider />

          <p>📌 Loại ghế:</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag color="#91d5ff">NORMAL</Tag>
            <Tag color="#cf1322">VIP</Tag>
            <Tag color="#722ed1">COUPLE</Tag>
            <Tag color="#fadb14">SELECTED</Tag>
            <Tag color="#595959">BOOKED</Tag>
            <Tag color="#d46b08">PENDING</Tag>
          </div>

          {/* WebSocket connection indicator */}
          <div style={{ marginTop: 10, fontSize: 12 }}>
            {isConnected ? (
              <span style={{ color: "#52c41a" }}>
                🟢 Đang đồng bộ trạng thái ghế theo thời gian thực
              </span>
            ) : (
              <span style={{ color: "#ff4d4f" }}>
                🔴 Chưa kết nối đồng bộ trạng thái ghế
              </span>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingPage;
