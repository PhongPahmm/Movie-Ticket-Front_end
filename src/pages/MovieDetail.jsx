import ShowTime from '../components/ShowTime';
import { Container } from 'react-bootstrap';

const MovieDetail = () => (
  <Container className="py-4">
    <h2>Inception</h2>
    <p>A thief who steals corporate secrets through the use of dream-sharing technology...</p>
    <ShowTime />
  </Container>
);

export default MovieDetail;
