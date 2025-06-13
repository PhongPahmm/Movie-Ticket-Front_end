import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "./Header";
import Footer from "./Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css'; 

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 w-100">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-grow-1 w-100">
        <Container fluid className="p-0">
          <Outlet />
        </Container>
      </main>

      {/* Footer */}  
      <Footer />
    </div>
  );
};

export default Layout;
