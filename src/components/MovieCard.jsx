import { Card } from "react-bootstrap";

const MovieCard = ({ movie }) => (
  <Card className="h-100">
    <Card.Img variant="top" src={`/images/${movie.posterUrl}`} alt={movie.title} />
    <Card.Body>
      <Card.Title>{movie.title}</Card.Title>
      <Card.Text>
        {movie.description.length > 60
          ? `${movie.description.slice(0, 60)}...`
          : movie.description}
      </Card.Text>
    </Card.Body>
  </Card>
);

export default MovieCard;
