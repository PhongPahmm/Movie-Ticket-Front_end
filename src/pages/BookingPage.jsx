import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Button, Spinner, Card } from "react-bootstrap";
import { getSeatsByShowId } from "../services/seatService";
import { getShowById } from "../services/showService";
import { getMovieById } from "../services/movieService";
import { getPriceByShowIdSeatTypeDate } from "../services/priceService";


const BookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);

  const [showInfo, setShowInfo] = useState(null);
  const [movieInfo, setMovieInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    if (!showId) {
      navigate("/");
      return;
    }

    const fetchInfo = async () => {
      try {
        setLoadingInfo(true);
        setLoadingSeats(true);

        // Lấy show
        const showRes = await getShowById(showId);
        const show = showRes?.data?.data || showRes?.data || showRes;
        console.log('show:', show);
        
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

        const showDate = show.showDate

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
        console.error("Error loading booking data:", err);
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

  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});
  Object.values(seatsByRow).forEach((rowSeats) =>
    rowSeats.sort((a, b) => a.number - b.number)
  );

  const getSeatClass = (seat) => {
    if (seat.status === "BOOKED") return "seat booked";
    if (seat.status === "PENDING") return "seat pending";
    if (selectedSeats.includes(seat.id)) return "seat selected";
    if (seat.seatType) return `seat ${seat.seatType.toLowerCase()}`;
    return "seat normal";
  };

  const totalPrice = seats
    .filter((seat) => selectedSeats.includes(seat.id))
    .reduce((sum, seat) => sum + (seat.price || 0), 0);

  const handleConfirmBooking = () => {
    navigate("/payment", {
      state: {
        movieInfo,
        showInfo,
        selectedSeats: seats.filter((s) => selectedSeats.includes(s.id)),
      },
    });
  };

  if (loadingInfo)
    return (
      <Spinner animation="border" role="status" className="m-auto d-block" />
    );

  return (
    <Container className="py-4">
      {movieInfo && showInfo && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Đặt vé phim: {movieInfo.title}</Card.Title>
            <Card.Text>
              <strong>Phòng chiếu:</strong> {showInfo.screenId} <br />
              <strong>Thời gian:</strong> {showInfo.startTime} - {showInfo.endTime}
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      <h2 className="mb-4 text-center">Chọn ghế</h2>

      {loadingSeats ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <>
          <div className="seats-container">
            {Object.entries(seatsByRow).map(([rowNumber, rowSeats]) => (
              <div key={rowNumber} className="seat-row">
                <div className="row-label">Hàng {rowNumber}</div>
                <div className="row-seats">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      className={getSeatClass(seat)}
                      disabled={
                        seat.status === "BOOKED" || seat.status === "PENDING"
                      }
                      onClick={() => toggleSeat(seat.id)}
                      title={`Hàng ${seat.row} - Ghế ${seat.number} (${seat.seatType}) - Giá: ${seat.price.toLocaleString()} VND`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center my-3">
            Tổng tiền: <strong>{totalPrice.toLocaleString()} VND</strong>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <Button
              variant="success"
              disabled={selectedSeats.length === 0}
              onClick={handleConfirmBooking}
            >
              Xác nhận đặt {selectedSeats.length} ghế
            </Button>
          </div>
        </>
      )}

      {/* Legend */}
      <div className="d-flex justify-content-center mt-5 gap-4 flex-wrap">
        <div>
          <button className="seat normal" disabled></button> Ghế Thường
        </div>
        <div>
          <button className="seat vip" disabled></button> Ghế VIP
        </div>
        <div>
          <button className="seat couple" disabled></button> Ghế Đôi
        </div>
        <div>
          <button className="seat selected" disabled></button> Đang chọn
        </div>
        <div>
          <button className="seat pending" disabled></button> Đang chờ
        </div>
        <div>
          <button className="seat booked" disabled></button> Đã đặt
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .seats-container {
          max-width: 600px;
          margin: 0 auto;
        }
        .seat-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .row-label {
          width: 70px;
          font-weight: 600;
          font-size: 1.1rem;
          user-select: none;
        }
        .row-seats {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        button.seat {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: 1.5px solid #666;
          background-color: #eee;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          user-select: none;
        }
        button.seat:hover:not(:disabled) {
          border-color: #444;
          box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }
        button.seat.booked {
          background-color: #6c757d;
          border-color: #5a6268;
          cursor: not-allowed;
          color: #fff;
          text-decoration: line-through;
        }
        button.seat.pending {
          background-color: #e74c3c;
          border-color: #c0392b;
          cursor: not-allowed;
          color: #fff;
          opacity: 0.7;
        }
        button.seat.selected {
          background-color: #f39c12;
          border-color: #e67e22;
          color: #fff;
          box-shadow: 0 0 8px #f39c12;
        }
        button.seat.vip {
          background-color: #d9534f;
          border-color: #d43f3a;
          color: white;
        }
        button.seat.normal {
          background-color: #e9ecef;
          border-color: #adb5bd;
          color: #495057;
        }
        button.seat.couple {
          background-color: #5cb85c;
          border-color: #4cae4c;
          color: white;
        }
        .row-seats::-webkit-scrollbar {
          height: 6px;
        }
        .row-seats::-webkit-scrollbar-thumb {
          background: #bbb;
          border-radius: 3px;
        }
      `}</style>
    </Container>
  );
};

export default BookingPage;
