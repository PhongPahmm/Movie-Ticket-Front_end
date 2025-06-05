import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  ButtonGroup,
  Pagination,
  Collapse,
  Form,
} from "react-bootstrap";
import {
  getMoviesByStatus,
  getMoviesByGenre,
  getMoviesByReleaseDate,
} from "../services/movieService";
import { getGenres } from "../services/genreService";
import { useNavigate } from "react-router-dom";
import "../assets/styles/Home.scss";

const Home = () => {
  const [tab, setTab] = useState("all");
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);
  const [releaseDate, setReleaseDate] = useState("");

  const [openGenre, setOpenGenre] = useState(false);
  const [openDate, setOpenDate] = useState(false);
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

  const handleGenreChange = (genreId) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
    setTab("all");
    setReleaseDate("");
  };

  const handleDateChange = (e) => {
    setReleaseDate(e.target.value);
    setSelectedGenreIds([]);
    setTab("all");
  };

  return (
    <div className="home-container">
      <div className="banner mb-4">🎬 Banner Quảng Cáo</div>

      <Container fluid>
        <Row>
          <Col lg={3} className="mb-4">
            <Card bg="dark" text="white">
              <Card.Header>Bộ lọc</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item
                    action
                    variant="dark"
                    onClick={() => setOpenGenre(!openGenre)}
                    aria-controls="genre-collapse"
                    aria-expanded={openGenre}
                  >
                    Thể loại
                  </ListGroup.Item>
                  <Collapse in={openGenre}>
                    <div id="genre-collapse">
                      <ul style={{ paddingLeft: 15, marginTop: 10 }}>
                        {genres.length
                          ? genres.map((g) => (
                              <li key={g.id} style={{ listStyle: "none" }}>
                                <label style={{ cursor: "pointer", color: "white" }}>
                                  <input
                                    type="checkbox"
                                    value={g.id}
                                    checked={selectedGenreIds.includes(g.id)}
                                    onChange={() => handleGenreChange(g.id)}
                                    style={{ marginRight: 8 }}
                                  />
                                  {g.name}
                                </label>
                              </li>
                            ))
                          : "Đang tải thể loại..."}
                      </ul>
                    </div>
                  </Collapse>

                  <ListGroup.Item
                    action
                    variant="dark"
                    onClick={() => setOpenDate(!openDate)}
                    aria-controls="date-collapse"
                    aria-expanded={openDate}
                  >
                    Ngày chiếu
                  </ListGroup.Item>
                  <Collapse in={openDate}>
                    <div id="date-collapse" className="p-3">
                      <Form.Control
                        type="date"
                        value={releaseDate}
                        onChange={handleDateChange}
                      />
                    </div>
                  </Collapse>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={9}>
            <section className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">🎥 Danh sách phim</h4>
                <ButtonGroup>
                  <Button
                    variant={tab === "all" ? "danger" : "outline-light"}
                    onClick={() => {
                      setTab("all");
                      setSelectedGenreIds([]);
                      setReleaseDate("");
                    }}
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={tab === "now_showing" ? "danger" : "outline-light"}
                    onClick={() => {
                      setTab("now_showing");
                      setSelectedGenreIds([]);
                      setReleaseDate("");
                    }}
                  >
                    Đang chiếu
                  </Button>
                  <Button
                    variant={tab === "coming_soon" ? "danger" : "outline-light"}
                    onClick={() => {
                      setTab("coming_soon");
                      setSelectedGenreIds([]);
                      setReleaseDate("");
                    }}
                  >
                    Sắp chiếu
                  </Button>
                </ButtonGroup>
              </div>

              <Row xs={2} md={3} xl={4} className="g-4">
                {movies.map((movie) => (
                  <Col key={movie.id} onClick={() => navigate(`/movies/${movie.id}`)}>
                    <Card bg="dark" text="white" className="h-100" style={{ cursor: "pointer" }}>
                      <Card.Img
                        variant="top"
                        src={`/images/${movie.posterUrl}`}
                        style={{ height: 240, objectFit: "cover" }}
                      />
                      <Card.Body>
                        <Card.Subtitle className="mb-1 text-muted">
                          {movie.genres?.map((g) => g.name).join(", ") || "Chưa rõ thể loại"}
                        </Card.Subtitle>
                        <Card.Text>{movie.releaseDate}</Card.Text>
                        <Card.Title>{movie.title}</Card.Title>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev
                      onClick={() => fetchMovies(currentPage - 1, tab, selectedGenreIds, releaseDate)}
                      disabled={currentPage === 0}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index}
                        active={index === currentPage}
                        onClick={() => fetchMovies(index, tab, selectedGenreIds, releaseDate)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => fetchMovies(currentPage + 1, tab, selectedGenreIds, releaseDate)}
                      disabled={currentPage === totalPages - 1}
                    />
                  </Pagination>
                </div>
              )}
            </section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
