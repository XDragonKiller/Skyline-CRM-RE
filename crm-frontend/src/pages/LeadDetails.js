import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Row, Col, Form } from 'react-bootstrap';
import api from '../api/api';
import LeadRecommendations from '../components/LeadRecommendations';
import { jwtDecode } from 'jwt-decode';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }

    const fetchLead = async () => {
      try {
        const response = await api.get(`/leads/${id}`);
        setLead(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lead:', err);
        setError('Failed to load lead details');
        setLoading(false);
      }
    };

    const fetchAgents = async () => {
      try {
        const response = await api.get('/users/agents');
        setAgents(response.data);
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    };

    fetchLead();
    if (userRole === 'admin') {
      fetchAgents();
    }
  }, [id, userRole]);

  const handleStatusChange = async (newStatus) => {
    try {
      console.log('Updating lead status:', { leadId: id, newStatus });
      
      // Use the status-specific endpoint
      const response = await api.put(`/leads/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      
      if (response.data) {
        setLead(prev => ({ ...prev, status: newStatus }));
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
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

  const handleAssignLead = async () => {
    try {
      console.log('Assigning lead to agent:', { leadId: id, agentId: selectedAgent });
      
      const response = await api.put(`/leads/${id}/assign`, { agent_id: selectedAgent });
      console.log('Assignment response:', response.data);
      
      if (response.data) {
        setLead(prev => ({ ...prev, agent_id: response.data.agent_id }));
        setSelectedAgent('');
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error assigning lead:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Failed to assign lead: ${errorMessage}`);
    }
  };

  const handleUnassignLead = async () => {
    try {
      console.log('Unassigning lead:', { leadId: id });
      
      const response = await api.put(`/leads/${id}/unassign`);
      console.log('Unassignment response:', response.data);
      
      if (response.data) {
        setLead(prev => ({ ...prev, agent_id: null }));
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error unassigning lead:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Failed to unassign lead: ${errorMessage}`);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      await api.post(`/recommendations/generate/${id}`);
      // Refresh the page to show new recommendations
      window.location.reload();
    } catch (err) {
      console.error('Error generating recommendations:', err);
      alert('Failed to generate recommendations');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!lead) return <div>Lead not found</div>;

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{lead.full_name}</h2>
            <div>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => navigate(`/leads/edit/${id}`)}
              >
                Edit Lead
              </Button>
              <Button
                variant="outline-success"
                onClick={handleGenerateRecommendations}
              >
                Generate Recommendations
              </Button>
            </div>
          </div>

          <Row>
            <Col md={6}>
              <h4>Contact Information</h4>
              <p><strong>Phone:</strong> {lead.phone}</p>
              <p><strong>Email:</strong> {lead.email}</p>
              <p><strong>Source:</strong> {lead.source}</p>
              <p><strong>Status:</strong> {lead.status}</p>
              {userRole === 'admin' && (
                <div className="mt-3">
                  <h5>Agent Assignment</h5>
                  {lead.agent_id ? (
                    <div>
                      <p><strong>Current Agent:</strong> {lead.agent_id.full_name}</p>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleUnassignLead}
                      >
                        Unassign Agent
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted">No agent assigned</p>
                      <Form.Group className="mb-2">
                        <Form.Select
                          value={selectedAgent}
                          onChange={(e) => setSelectedAgent(e.target.value)}
                        >
                          <option value="">Select an agent...</option>
                          {agents.map(agent => (
                            <option key={agent._id} value={agent._id}>
                              {agent.full_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleAssignLead}
                        disabled={!selectedAgent}
                      >
                        Assign Agent
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Col>
            <Col md={6}>
              <h4>Property Preferences</h4>
              <p><strong>Type:</strong> {lead.preferences.property_type}</p>
              <p>
                <strong>Price Range:</strong> ₪{lead.preferences.price_range.min.toLocaleString()} - 
                ₪{lead.preferences.price_range.max.toLocaleString()}
              </p>
              <p>
                <strong>Location:</strong> {lead.preferences.location.city}, {lead.preferences.location.region}
              </p>
              <p><strong>Family Size:</strong> {lead.preferences.family_size}</p>
              <p><strong>Urgency:</strong> {lead.preferences.urgency}</p>
            </Col>
          </Row>

          <div className="mt-4">
            <h4>Features Required</h4>
            <Row>
              <Col md={3}>
                <p><strong>Rooms:</strong> {lead.preferences.features.rooms}</p>
              </Col>
              <Col md={3}>
                <p><strong>Bathrooms:</strong> {lead.preferences.features.bathrooms}</p>
              </Col>
              <Col md={3}>
                <p><strong>Size:</strong> {lead.preferences.features.size_sqm}m²</p>
              </Col>
              <Col md={3}>
                <p>
                  <strong>Additional:</strong>
                  {lead.preferences.features.parking && ' Parking'}
                  {lead.preferences.features.balcony && ' Balcony'}
                </p>
              </Col>
            </Row>
          </div>

          {lead.notes && (
            <div className="mt-4">
              <h4>Notes</h4>
              <p>{lead.notes}</p>
            </div>
          )}

          <div className="mt-4">
            <h4>Status Management</h4>
            <div className="d-flex gap-2">
              <Button
                variant={lead.status === 'new' ? 'primary' : 'outline-primary'}
                onClick={() => handleStatusChange('new')}
              >
                New
              </Button>
              <Button
                variant={lead.status === 'in_progress' ? 'warning' : 'outline-warning'}
                onClick={() => handleStatusChange('in_progress')}
              >
                In Progress
              </Button>
              <Button
                variant={lead.status === 'converted' ? 'success' : 'outline-success'}
                onClick={() => handleStatusChange('converted')}
              >
                Converted
              </Button>
              <Button
                variant={lead.status === 'lost' ? 'danger' : 'outline-danger'}
                onClick={() => handleStatusChange('lost')}
              >
                Lost
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <LeadRecommendations leadId={id} />
    </div>
  );
};

export default LeadDetails; 