import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Col, Row, Button, Modal, Spin, Typography, Space } from "antd";
import { getMovieById } from "../services/movieService";
import { getShowByMovieAndDate } from "../services/showService";

const { Title, Paragraph, Text } = Typography;

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

  if (!movie) return <Spin size="large" />;

  const youtubeId = extractYouTubeId(movie.trailerUrl);

  return (
    <div style={{ padding: "40px 80px" }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} md={8}>
          <Card
            cover={
              <img
                alt={movie.title}
                src={`http://localhost:8080/api/v1/images/${movie.posterUrl}`}
                style={{ height: 500, objectFit: "cover" }}
              />
            }
            bordered={false}
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)", borderRadius: 8 }}
          />
        </Col>

        <Col xs={24} md={16}>
          <Title level={2}>{movie.title}</Title>
          <Paragraph><strong>Mô tả:</strong> {movie.description}</Paragraph>
          <Paragraph><strong>Thời lượng:</strong> {movie.durationMinutes} phút</Paragraph>
          <Paragraph><strong>Ngày khởi chiếu:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</Paragraph>
          <Paragraph><strong>Độ tuổi:</strong> {movie.ageRating}</Paragraph>
          <Paragraph><strong>Thể loại:</strong> {movie.genres.map(g => g.name).join(", ")}</Paragraph>
          <Paragraph><strong>Đạo diễn:</strong> {movie.director}</Paragraph>
          <Paragraph><strong>Diễn viên:</strong> {movie.actors.join(", ")}</Paragraph>
          <Paragraph><strong>Ngôn ngữ:</strong> {movie.language}</Paragraph>
          <Paragraph><strong>Trạng thái:</strong> {movie.status === "NOW_SHOWING" ? "Đang chiếu" : "Sắp chiếu"}</Paragraph>
          {youtubeId && (
            <Button type="primary" danger size="large" onClick={() => setShowTrailer(true)}>
              🎬 Xem Trailer
            </Button>
          )}
        </Col>
      </Row>

      {/* Ngày chiếu */}
      <div style={{ marginTop: 48 }}>
        <Title level={4}>Chọn ngày chiếu:</Title>
        <Space wrap>
          {dates.map((date, idx) => {
            const label = date.toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            });
            return (
              <Button
                key={idx}
                type={selectedDate.toDateString() === date.toDateString() ? "primary" : "default"}
                onClick={() => setSelectedDate(date)}
              >
                {label}
              </Button>
            );
          })}
        </Space>
      </div>

      {/* Danh sách suất chiếu */}
      <div style={{ marginTop: 32 }}>
        <Title level={4}>Suất chiếu:</Title>
        {loadingShows ? (
          <Spin />
        ) : showList.length === 0 ? (
          <Text>Không có suất chiếu cho ngày này.</Text>
        ) : (
          <Row gutter={[16, 16]}>
            {showList.map((show) => (
              <Col key={show.showId} xs={24} sm={12} md={8}>
                <Card
                  title={`Phòng chiếu: ${show.screenId}`}
                  extra={
                    <Button type="link" href={`/booking/${show.showId}`} style={{ color: "#52c41a" }}>
                      Đặt vé
                    </Button>
                  }
                  bordered
                >
                  <p><strong>Bắt đầu:</strong> {show.startTime}</p>
                  <p><strong>Kết thúc:</strong> {show.endTime}</p>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Modal Trailer */}
      <Modal
        open={showTrailer}
        onCancel={() => setShowTrailer(false)}
        footer={null}
        width={800}
        centered
      >
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube trailer"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: 8,
            }}
          ></iframe>
        </div>
      </Modal>
    </div>
  );
};

export default MovieDetail;
