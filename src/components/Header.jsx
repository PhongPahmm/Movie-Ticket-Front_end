import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { authenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow w-100">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fs-3 fw-bold">
          MovieTicket
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto gap-3 align-items-center">
            <Nav.Link as={Link} to="/" className="text-white">Trang chủ</Nav.Link>
            {!authenticated ? (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">Đăng nhập</Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-white">Đăng ký</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/profile" className="text-white">Profile</Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Đăng xuất</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
