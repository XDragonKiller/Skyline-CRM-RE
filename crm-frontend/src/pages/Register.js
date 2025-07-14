import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agency: '',
    role: 'agent',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset role to agent if agency is empty
  useEffect(() => {
    if (!formData.agency && formData.role === 'admin') {
      setFormData(prev => ({ ...prev, role: 'agent' }));
    }
  }, [formData.agency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing agency to empty and role is admin, force role to agent
    if (name === 'agency' && !value && formData.role === 'admin') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        role: 'agent'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Additional validation for admin role
    if (formData.role === 'admin' && !formData.agency) {
      setError('Admin role requires an agency');
      return;
    }

    // Validate phone number
    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      // Combine first and last name
      registrationData.full_name = `${registrationData.firstName} ${registrationData.lastName}`;
      delete registrationData.firstName;
      delete registrationData.lastName;
      
      console.log('Sending registration data:', registrationData);
      await authService.register(registrationData);
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data || err);
      setError(err.response?.data?.message || err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={11} sm={8} md={6} lg={4}>
          <Card className="auth-card shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="auth-title">Create Account</h2>
                <p className="text-muted">Join our CRM platform</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Agency (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="agency"
                    placeholder="Enter agency name (leave empty for solo agent)"
                    value={formData.agency}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Leave empty if you're a solo agent
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading || !formData.agency}
                  >
                    <option value="agent">Agent</option>
                    <option value="admin" disabled={!formData.agency}>Admin</option>
                  </Form.Select>
                  {!formData.agency && (
                    <Form.Text className="text-muted">
                      Admin role requires an agency
                    </Form.Text>
                  )}
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="auth-button"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Sign In
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

export default Register;
