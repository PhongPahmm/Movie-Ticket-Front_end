import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Container, Row, Col, Button, Modal, Spinner } from "react-bootstrap";
import { getMovieById } from "../services/movieService";
import { getShowByMovieAndDate } from "../services/showService";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [showList, setShowList] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMovieById(id)
      .then((data) => setMovie(data))
      .catch((err) => console.error("Lỗi khi lấy chi tiết phim:", err));
  }, [id]);

  useEffect(() => {
    const today = new Date();
    const dateArr = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);
      return d;
    });
    setDates(dateArr);
    setSelectedDate(dateArr[0]);
  }, []);

  useEffect(() => {
    if (!id || !selectedDate) return;
    setLoadingShows(true);
    const formattedDate = selectedDate.toISOString().split("T")[0];

    getShowByMovieAndDate(id, formattedDate)
      .then((res) => {
        setShowList(res.data?.items || []);
      })
      .catch((err) => console.error("Lỗi khi lấy danh sách suất chiếu:", err))
      .finally(() => setLoadingShows(false));
  }, [id, selectedDate]);

  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (!movie) return <p>Đang tải thông tin phim...</p>;

  const youtubeId = extractYouTubeId(movie.trailerUrl);

  return (
    <Container className="mt-5">
      <Row>
        <Col md={5}>
          <Card bg="dark" text="white">
            <Card.Img
              src={`/images/${movie.posterUrl}`}
              alt={movie.title}
              style={{ height: 400, objectFit: "cover" }}
            />
          </Card>
        </Col>
        <Col md={7}>
          <h2>{movie.title}</h2>
          <p><strong>Mô tả:</strong> {movie.description}</p>
          <p><strong>Thời lượng:</strong> {movie.durationMinutes} phút</p>
          <p><strong>Ngày khởi chiếu:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
          <p><strong>Độ tuổi:</strong> {movie.ageRating}</p>
          <p><strong>Thể loại:</strong> {movie.genres.map((g) => g.name).join(", ")}</p>
          <p><strong>Đạo diễn:</strong> {movie.director}</p>
          <p><strong>Diễn viên:</strong> {movie.actors.join(", ")}</p>
          <p><strong>Ngôn ngữ:</strong> {movie.language}</p>
          <p><strong>Trạng thái:</strong> {movie.status === "NOW_SHOWING" ? "Đang chiếu" : "Sắp chiếu"}</p>
          {youtubeId && (
            <Button variant="danger" onClick={() => setShowTrailer(true)}>
              🎬 Xem Trailer
            </Button>
          )}
        </Col>
      </Row>

      <hr />

      {/* Chọn ngày */}
      <div className="my-4">
        <h5>Chọn ngày chiếu:</h5>
        <div className="d-flex gap-2 flex-wrap">
          {dates.map((date, idx) => {
            const label = date.toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            });
            return (
              <Button
                key={idx}
                variant={selectedDate.toDateString() === date.toDateString() ? "primary" : "outline-primary"}
                onClick={() => setSelectedDate(date)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Danh sách suất chiếu */}
      <div className="my-4">
        <h5>Suất chiếu:</h5>
        {loadingShows ? (
          <Spinner animation="border" />
        ) : showList.length === 0 ? (
          <p>Không có suất chiếu cho ngày này.</p>
        ) : (
          <Row className="gap-3">
            {showList.map((show) => (
              <Col key={show.showId} md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Phòng chiếu: {show.screenId}</Card.Title>
                    <p>
                      <strong>Bắt đầu:</strong> {show.startTime}
                      <br />
                      <strong>Kết thúc:</strong> {show.endTime}
                    </p>
                    <Button variant="success" href={`/booking/${show.showId}`}>
                      Đặt vé
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Modal xem trailer */}
      <Modal show={showTrailer} onHide={() => setShowTrailer(false)} size="lg" centered>
        <Modal.Header closeButton />
        <Modal.Body className="d-flex justify-content-center">
          <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MovieDetail;
