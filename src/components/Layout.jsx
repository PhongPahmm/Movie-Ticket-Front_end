import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const Layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="d-flex flex-column min-vh-100 w-100">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow w-100">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fs-3 fw-bold">
            MovieTicket
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto gap-3 align-items-center">
              <Nav.Link as={Link} to="/" className="text-white">Trang chủ</Nav.Link>
              <Nav.Link as={Link} to="/movies" className="text-white">Phim</Nav.Link>
              <Nav.Link as={Link} to="/booking" className="text-white">Đặt vé</Nav.Link>

              {!isLoggedIn ? (
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

      {/* Main content */}
      <main className="flex-grow-1 w-100">
        <Container fluid className="p-0">
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto w-100">
        <Container fluid>
          © {new Date().getFullYear()} MovieTicket. All rights reserved.
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
