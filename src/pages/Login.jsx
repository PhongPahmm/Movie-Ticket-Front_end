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
      console.log("🔧 Login response:", res);
      
      if (res.code === 0 && res.data.authenticated) {
        // Backend trả về accessToken
        const token = res.data.accessToken;
        console.log("🔧 Login success - Access Token:", token);
        console.log("🔧 Full response data:", res.data);
        
        localStorage.setItem("accessToken", token);
        console.log("🔧 Token saved to localStorage");
        
        // Cập nhật trạng thái đăng nhập trong context
        loginSuccess(token);
        console.log("🔧 loginSuccess called, navigating to home");
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
      </Form>
    </Container>
  );
};

export default Login;