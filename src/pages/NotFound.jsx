import { Container } from 'react-bootstrap';

const NotFound = () => (
  <Container className="py-4 text-center">
    <h2 className="text-danger">404 - Page Not Found</h2>
    <p>Sorry, the page you're looking for doesn't exist.</p>
  </Container>
);

export default NotFound;
