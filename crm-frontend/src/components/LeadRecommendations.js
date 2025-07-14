import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

const LeadRecommendations = ({ leadId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(`/recommendations/lead/${leadId}`);
      setRecommendations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [leadId]);

  const handleStatusUpdate = async (recommendationId, newStatus) => {
    try {
      await api.put(`/recommendations/${recommendationId}/status`, { status: newStatus });
      
      // If the status is 'rejected', remove it from the UI immediately
      if (newStatus === 'rejected') {
        setRecommendations(prev => prev.filter(rec => rec._id !== recommendationId));
      } else {
        // For other statuses, just update the status
        setRecommendations(prev =>
          prev.map(rec =>
            rec._id === recommendationId ? { ...rec, status: newStatus } : rec
          )
        );
      }
    } catch (err) {
      console.error('Error updating recommendation status:', err);
      alert('Failed to update status');
    }
  };

  const handleMakeDeal = async (propertyId) => {
    try {
      // Get the current user's ID from the JWT token
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const agentId = decodedToken.id;

      console.log('Creating deal with:', {
        lead_id: leadId,
        property_id: propertyId,
        agent_id: agentId,
        status: 'open',
        notes: 'Deal created from recommendation'
      });

      // Create a new deal
      const dealResponse = await api.post('/deals', {
        lead_id: leadId,
        property_id: propertyId,
        agent_id: agentId,
        status: 'open',
        notes: 'Deal created from recommendation'
      });

      console.log('Deal created successfully:', dealResponse.data);

      // Update recommendation status to converted
      const recommendation = recommendations.find(rec => rec.property_id._id === propertyId);
      if (recommendation) {
        console.log('Updating recommendation status:', recommendation._id);
        await api.put(`/recommendations/${recommendation._id}/status`, {
          status: 'converted'
        });
        console.log('Recommendation status updated successfully');
      }

      // Refresh recommendations
      await fetchRecommendations();

      // Navigate to the deals page
      navigate('/deals');
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Failed to create deal');
      alert('Failed to create deal. Please try again.');
    }
  };

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (recommendations.length === 0) return <div>No recommendations found</div>;

  return (
    <div className="mt-4">
      <h3>Property Recommendations</h3>
      <Row>
        {recommendations.map((rec) => (
          <Col key={rec._id} md={4} className="mb-4">
            <Card>
              {rec.property_id && rec.property_id.images && rec.property_id.images.length > 0 && (
                <Card.Img
                  variant="top"
                  src={rec.property_id.images[0].startsWith('http') ? rec.property_id.images[0] : `http://localhost:3001${rec.property_id.images[0]}`}
                  alt={rec.property_id.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              )}
              <Card.Body>
                {rec.property_id && (
                  <>
                    <Card.Title>{rec.property_id.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      ₪{rec.property_id.price.toLocaleString()}
                    </Card.Subtitle>
                    <Card.Text>
                      <small>
                        {rec.property_id.address.city}, {rec.property_id.address.country}
                      </small>
                      <br />
                      <small>
                        {rec.property_id.features.rooms} rooms • {rec.property_id.features.bathrooms} baths •{' '}
                        {rec.property_id.features.size_sqm}m²
                      </small>
                    </Card.Text>
                  </>
                )}
                <div className="mb-2">
                  <Badge bg="info" className="me-2">
                    Match Score: {rec.match_score}%
                  </Badge>
                  <Badge bg={rec.status === 'pending' ? 'warning' : 'success'}>
                    {rec.status}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  {rec.property_id && (
                    <Link to={`/properties/${rec.property_id._id}`}>
                      <Button variant="outline-primary" size="sm">
                        View Details
                      </Button>
                    </Link>
                  )}
                  <div>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleStatusUpdate(rec._id, 'contacted')}
                      disabled={rec.status === 'contacted'}
                    >
                      Contact
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleStatusUpdate(rec._id, 'rejected')}
                      disabled={rec.status === 'rejected'}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => handleMakeDeal(rec.property_id._id)}
                    disabled={rec.status === 'converted'}
                  >
                    {rec.status === 'converted' ? 'Deal Created' : 'Make Deal'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default LeadRecommendations; 