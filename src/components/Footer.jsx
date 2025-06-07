import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-auto w-100">
      <Container fluid>
        © {new Date().getFullYear()} MovieTicket. All rights reserved.
      </Container>
    </footer>
  );
};

export default Footer;
