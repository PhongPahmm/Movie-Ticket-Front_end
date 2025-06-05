import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Container, Row, Col, Button, Modal } from "react-bootstrap";
import { getMovieById } from "../services/movieService";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    getMovieById(id)
      .then((data) => setMovie(data))
      .catch((err) => console.error("Lỗi khi lấy chi tiết phim:", err));
  }, [id]);

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

      {/* Modal xem trailer */}
      <Modal show={showTrailer} onHide={() => setShowTrailer(false)} size="lg" centered>
        <Modal.Header closeButton>
        </Modal.Header>
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
