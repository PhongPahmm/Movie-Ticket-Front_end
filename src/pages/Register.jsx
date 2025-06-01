import { Container, Form, Button } from 'react-bootstrap';

const Register = () => (
  <Container className="py-4" style={{ maxWidth: '400px' }}>
    <h2>Register</h2>
    <Form className="mt-3">
      <Form.Group className="mb-3" controlId="username">
        <Form.Control type="text" placeholder="Username" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="email">
        <Form.Control type="email" placeholder="Email" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>
      <Button variant="success" type="submit">Register</Button>
    </Form>
  </Container>
);

export default Register;
