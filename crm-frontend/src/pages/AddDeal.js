import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AddDeal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    lead_id: '',
    property_id: '',
    status: 'open',
    final_price: '',
    date_opened: new Date().toISOString().substring(0, 10)
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, propsRes] = await Promise.all([
        api.get('/leads'),
        api.get('/properties')
      ]);
      setLeads(leadsRes.data);
      setProperties(propsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load leads or properties');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deals', form);
      navigate('/deals');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create deal');
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{height: '60vh'}}><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Add New Deal</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Lead</Form.Label>
                  <Form.Select name="lead_id" value={form.lead_id} onChange={handleChange} required>
                    <option value="">Select Lead</option>
                    {leads.map(lead => (
                      <option key={lead._id} value={lead._id}>{lead.full_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Property</Form.Label>
                  <Form.Select name="property_id" value={form.property_id} onChange={handleChange} required>
                    <option value="">Select Property</option>
                    {properties.map(prop => (
                      <option key={prop._id} value={prop._id}>{prop.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={form.status} onChange={handleChange}>
                    <option value="open">Open</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed">Closed</option>
                    <option value="canceled">Canceled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Final Price (₪)</Form.Label>
                  <Form.Control type="number" name="final_price" value={form.final_price} onChange={handleChange} placeholder="Enter final price" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date Opened</Form.Label>
                  <Form.Control type="date" name="date_opened" value={form.date_opened} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit">Create Deal</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddDeal; 