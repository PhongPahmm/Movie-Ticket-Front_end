import { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Checkbox,
  DatePicker,
  Collapse,
  Button,
  Pagination,
  Space,
  Typography,
  Spin,
} from "antd";
import {
  getMoviesByStatus,
  getMoviesByGenre,
  getMoviesByReleaseDate,
} from "../services/movieService";
import { getGenres } from "../services/genreService";
import { useNavigate } from "react-router-dom";
import "../assets/styles/Home.scss";
import ChatbotUI from "../components/ChatbotUI";
import dayjs from "dayjs";

const { Content, Sider } = Layout;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const Home = () => {
  const [tab, setTab] = useState("all");
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);
  const [releaseDate, setReleaseDate] = useState("");

  const navigate = useNavigate();

  const fetchMovies = async (page = 0, status = "all", genreIds = [], date = "") => {
    try {
      let data;
      if (date) {
        data = await getMoviesByReleaseDate(date, page);
      } else if (genreIds.length > 0) {
        data = await getMoviesByGenre(genreIds, page);
      } else {
        data = await getMoviesByStatus(status, page);
      }
      setMovies(data.items);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phim:", error);
    }
  };

  useEffect(() => {
    fetchMovies(0, tab, selectedGenreIds, releaseDate);
  }, [tab, selectedGenreIds, releaseDate]);

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch((error) => console.error("Lỗi khi lấy thể loại:", error));
  }, []);

  const handleGenreChange = (checkedValues) => {
    setSelectedGenreIds(checkedValues);
    setTab("all");
    setReleaseDate("");
  };

  const handleDateChange = (date) => {
    setReleaseDate(date ? date.format("YYYY-MM-DD") : "");
    setSelectedGenreIds([]);
    setTab("all");
  };

  return (
    <Layout className="home-container">
      <div className="banner">
         Banner Quảng Cáo
      </div>
      <Layout>
        <Sider width={300} style={{ background: "white", color: "black", padding: 16 }}>
          <Title level={4} style={{ color: "black" }}>Bộ lọc</Title>
          <Collapse ghost defaultActiveKey={["1", "2"]}>
            <Panel header="Thể loại" key="1">
              <Checkbox.Group
                style={{ display: "flex", flexDirection: "column" }}
                value={selectedGenreIds}
                onChange={handleGenreChange}
              >
                {genres.map((genre) => (
                  <Checkbox key={genre.id} value={genre.id} style={{ marginBottom: 8 }}>
                    {genre.name}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Panel>
            <Panel header="Ngày chiếu" key="2">
              <DatePicker
                format="YYYY-MM-DD"
                onChange={handleDateChange}
                value={releaseDate ? dayjs(releaseDate) : null}
              />
            </Panel>
          </Collapse>
        </Sider>

        <Content style={{ padding: "0 24px" }}>
          <div className="d-flex justify-content-between align-items-center mt-2 mb-2">
            <Title level={4}>Danh sách phim</Title>
            <Space>
              <Button
                type={tab === "all" ? "primary" : "default"}
                onClick={() => {
                  setTab("all");
                  setSelectedGenreIds([]);
                  setReleaseDate("");
                }}
              >
                Tất cả
              </Button>
              <Button
                type={tab === "now_showing" ? "primary" : "default"}
                onClick={() => {
                  setTab("now_showing");
                  setSelectedGenreIds([]);
                  setReleaseDate("");
                }}
              >
                Đang chiếu
              </Button>
              <Button
                type={tab === "coming_soon" ? "primary" : "default"}
                onClick={() => {
                  setTab("coming_soon");
                  setSelectedGenreIds([]);
                  setReleaseDate("");
                }}
              >
                Sắp chiếu
              </Button>
            </Space>
          </div>

          <Row gutter={[16, 24]}>
            {movies.map((movie) => (
              <Col xs={24} sm={12} md={8} lg={6} key={movie.id}>
                <Card
                  hoverable
                  style={{ height: "100%" }}
                  cover={
                    <img
                      alt={movie.title}
                      src={`http://localhost:8080/api/v1/images/${movie.posterUrl}`}
                      style={{ height: 320, objectFit: "cover" }}
                    />
                  }
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  <Card.Meta
                    title={movie.title}
                    description={
                      <>
                        <Text type="secondary">
                          {movie.genres?.map((g) => g.name).join(", ") || "Chưa rõ thể loại"}
                        </Text>
                        <br />
                        <Text>{movie.releaseDate}</Text>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "16px 0",
    }}
  >
    <Pagination
      current={currentPage + 1}
      pageSize={1}
      total={totalPages}
      onChange={(page) =>
        fetchMovies(page - 1, tab, selectedGenreIds, releaseDate)
      }
    />
  </div>
)}

        </Content>
      </Layout>
      <ChatbotUI />
    </Layout>
  );
};

export default Home;
