import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Header = () => {
  const { authenticated, logout } = useAuth();

  // Log mỗi khi component render
  useEffect(() => {
    console.log("🔧 Header component - authenticated:", authenticated);
    console.log("🔧 Header component - localStorage token:", localStorage.getItem("accessToken"));
  });

  const handleLogout = () => {
    console.log("🔧 Header - handleLogout called");
    logout();
  };

  // Log trực tiếp trong render
  console.log("🔧 Header render - authenticated:", authenticated);

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