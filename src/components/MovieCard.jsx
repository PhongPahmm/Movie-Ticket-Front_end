import { Card, Button } from 'react-bootstrap';

const MovieCard = ({ title }) => (
  <Card className="mb-3" style={{ width: '18rem' }}>
    <Card.Img variant="top" src="https://via.placeholder.com/200x300" />
    <Card.Body>
      <Card.Title>{title}</Card.Title>
      <Button variant="primary" href="/movie/1">View Details</Button>
    </Card.Body>
  </Card>
);

export default MovieCard;
