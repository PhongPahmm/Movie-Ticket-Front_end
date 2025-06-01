import { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, ButtonGroup, Image } from 'react-bootstrap';
import '../assets/styles/Home.scss';

const Home = () => {
  const [tab, setTab] = useState('all');

  const movies = [
    {
      id: 1,
      title: 'THÁM TỬ KIỆN',
      genre: 'Hành động',
      releaseDate: '2025-04-28',
      status: 'now_showing',
      poster: '/poster.jpg',
    },
    {
      id: 2,
      title: 'BUÔN THẦN BÁN THÁNH',
      genre: 'Hài',
      releaseDate: '2025-06-06',
      status: 'coming_soon',
      poster: '/poster.jpg',
    },
    {
      id: 3,
      title: 'BALLERINA',
      genre: 'Hành động',
      releaseDate: '2025-06-06',
      status: 'coming_soon',
      poster: '/poster.jpg',
    },
    {
      id: 4,
      title: 'SINNERS',
      genre: 'Hành động',
      releaseDate: '2025-05-20',
      status: 'now_showing',
      poster: '/poster.jpg',
    },
  ];

  const filteredMovies = movies.filter(movie => {
    if (tab === 'all') return true;
    return movie.status === tab;
  });

  return (
    <div className="home-container">
      <div className="banner mb-4">🎬 Banner Quảng Cáo</div>

      <Container fluid>
        <Row>
          {/* Filter */}
          <Col lg={3} className="mb-4">
            <Card bg="dark" text="white">
              <Card.Header>Bộ lọc</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item action variant="dark">Thể loại</ListGroup.Item>
                  <ListGroup.Item action variant="dark">Ngày chiếu</ListGroup.Item>
                  <ListGroup.Item action variant="dark">Định dạng</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Movie & Promotions */}
          <Col lg={9}>
            <section className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">🎥 Danh sách phim</h4>
                <ButtonGroup>
                  <Button variant={tab === 'all' ? 'danger' : 'outline-light'} onClick={() => setTab('all')}>Tất cả</Button>
                  <Button variant={tab === 'now_showing' ? 'danger' : 'outline-light'} onClick={() => setTab('now_showing')}>Đang chiếu</Button>
                  <Button variant={tab === 'coming_soon' ? 'danger' : 'outline-light'} onClick={() => setTab('coming_soon')}>Sắp chiếu</Button>
                </ButtonGroup>
              </div>

              <Row xs={2} md={3} xl={4} className="g-4">
                {filteredMovies.map(movie => (
                  <Col key={movie.id}>
                    <Card bg="dark" text="white" className="h-100">
                      <Card.Img variant="top" src={movie.poster} style={{ height: '240px', objectFit: 'cover' }} />
                      <Card.Body>
                        <Card.Subtitle className="mb-1 text-muted">{movie.genre}</Card.Subtitle>
                        <Card.Text>{movie.releaseDate}</Card.Text>
                        <Card.Title>{movie.title}</Card.Title>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
