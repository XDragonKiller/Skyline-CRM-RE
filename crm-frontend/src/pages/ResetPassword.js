import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Container fluid className="auth-container">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={11} sm={8} md={6} lg={4}>
            <Card className="auth-card shadow">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="auth-title">Invalid Reset Link</h2>
                  <p className="text-muted">
                    This password reset link is invalid or has expired.
                    Please request a new password reset link.
                  </p>
                  <Link to="/forgot-password" className="btn btn-primary mt-3">
                    Request New Reset Link
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={11} sm={8} md={6} lg={4}>
          <Card className="auth-card shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="auth-title">Reset Password</h2>
                <p className="text-muted">
                  Enter your new password below.
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Password has been reset successfully! 
                  Redirecting to login page...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading || success}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading || success}
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    className="auth-button"
                    disabled={loading || success}
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    Remember your password?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Back to Login
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword; 