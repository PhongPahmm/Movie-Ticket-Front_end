import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { authenticated, logout } = useAuth();
console.log("🔁 Header re-render, authenticated:", authenticated);
  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-4">
      <Container>
        <Navbar.Brand as={Link} to="/">🎬 Movie Ticket</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            {!authenticated && (
              <>
                <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
              </>
            )}
            {authenticated && (
              <>
                <Nav.Link as={Link} to="/profile">Tài khoản</Nav.Link>
                <Nav.Link onClick={handleLogout}>Đăng xuất</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;