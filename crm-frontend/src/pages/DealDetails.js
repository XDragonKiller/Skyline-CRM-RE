import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Badge, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/api';

const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchDeal();
  }, [id, location.key]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/deals/${id}`);
      console.log('Deal response:', response.data);
      setDeal(response.data);
      setStatus(response.data.status);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deal:', err);
      setError('Failed to load deal details');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      console.log('Updating deal status:', { dealId: id, newStatus });
      
      // Use the status-specific endpoint
      const response = await api.put(`/deals/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      
      if (response.data) {
        setDeal(prev => ({ ...prev, status: newStatus }));
        setStatus(newStatus);
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error updating deal status:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Show more specific error message
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Failed to update status: ${errorMessage}`);
    }
  };

  const handleEdit = async (updatedData) => {
    try {
      const response = await api.put(`/deals/${id}`, updatedData);
      if (response.data) {
        setDeal(prev => ({ ...prev, ...response.data }));
        alert('Deal updated successfully');
      }
    } catch (err) {
      console.error('Error updating deal:', err);
      alert(`Failed to update deal: ${err.response?.data?.message || err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: 'primary',
      negotiation: 'warning',
      closed: 'success',
      canceled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatPrice = (price) => {
    if (!price) return 'Not set';
    return `₪${price.toLocaleString()}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!deal) return <div>Deal not found</div>;

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Deal Details</h2>
            <div>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => navigate(`/deals/edit/${id}`)}
              >
                Edit Deal
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/deals')}
              >
                Back to Deals
              </Button>
            </div>
          </div>

          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Lead Information</Card.Header>
                <Card.Body>
                  {deal.lead_id ? (
                    <>
                      <h4>{deal.lead_id.full_name}</h4>
                      <p><strong>Phone:</strong> {deal.lead_id.phone}</p>
                      <p><strong>Email:</strong> {deal.lead_id.email}</p>
                      <Link to={`/leads/${deal.lead_id._id}`}>
                        <Button variant="info" size="sm">View Lead Details</Button>
                      </Link>
                    </>
                  ) : (
                    <p className="text-muted">Lead information not available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Property Information</Card.Header>
                <Card.Body>
                  {deal.property_id ? (
                    <>
                      <h4>{deal.property_id.title}</h4>
                      <p>
                        <strong>Address:</strong> {deal.property_id.address?.street}, {deal.property_id.address?.city}
                      </p>
                      <p>
                        <strong>Price:</strong> {formatPrice(deal.property_id.price)}
                      </p>
                      <Link to={`/properties/${deal.property_id._id}`}>
                        <Button variant="info" size="sm">View Property Details</Button>
                      </Link>
                    </>
                  ) : (
                    <p className="text-muted">Property information not available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-4">
            <Card.Header>Deal Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <div>
                      {getStatusBadge(deal.status)}
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleStatusChange('negotiation')}
                        disabled={deal.status === 'negotiation'}
                      >
                        Mark In Negotiation
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleStatusChange('closed')}
                        disabled={deal.status === 'closed'}
                      >
                        Mark Closed
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleStatusChange('canceled')}
                        disabled={deal.status === 'canceled'}
                      >
                        Cancel Deal
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <p><strong>Final Price:</strong> {formatPrice(deal.final_price)}</p>
                  <p><strong>Created At:</strong> {new Date(deal.createdAt).toLocaleDateString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(deal.updatedAt).toLocaleDateString()}</p>
                </Col>
              </Row>
              {deal.notes && (
                <div className="mt-3">
                  <h5>Notes</h5>
                  <p>{deal.notes}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DealDetails; 