import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ username, password });
      
      if (res.code === 0 && res.data.authenticated) {
        const token = res.data.accessToken;
        localStorage.setItem("accessToken", token);
        loginSuccess(token);
        navigate('/');
      } else {
        console.log("🔧 Login failed - Response:", res);
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      console.log("🔧 Login error:", err);
      setError('Lỗi kết nối hoặc thông tin không hợp lệ');
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '400px' }}>
      <h2>Login</h2>
      <Form className="mt-3" onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3" controlId="username">
          <Form.Control
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Login</Button>
        <Button
          variant="danger"
          className="w-100 mt-2"
          href="http://localhost:8080/api/v1/oauth2/authorization/google"
        >
          Login with Google
        </Button>
      </Form>
    </Container>
  );
};

export default Login;