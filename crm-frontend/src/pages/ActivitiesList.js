import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

const ActivitiesList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    dateRange: 'all'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    console.log('Token found:', !!token); // Debug log
    
    if (token) {
      const decoded = jwtDecode(token);
      console.log('User role:', decoded.role); // Debug log
      
      if (decoded.role !== 'admin') {
        console.log('Non-admin user, redirecting to dashboard'); // Debug log
        navigate('/dashboard');
        return;
      }
    } else {
      console.log('No token found, redirecting to login'); // Debug log
      navigate('/login');
      return;
    }
    
    fetchActivities();
  }, [navigate]);

  const fetchActivities = async () => {
    try {
      console.log('Fetching activities...'); // Debug log
      const response = await api.get('/activities');
      console.log('Activities response:', response.data); // Debug log
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response data:', response.data); // Debug log
        setError('Invalid response from server');
        setLoading(false);
        return;
      }
      
      setActivities(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching activities:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      }); // Debug log
      
      if (err.response?.status === 403) {
        console.log('Access denied, redirecting to dashboard'); // Debug log
        navigate('/dashboard');
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to load activities');
      setLoading(false);
    }
  };

  const getActivityTypeBadge = (type) => {
    const variants = {
      lead_status_change: 'primary',
      deal_status_change: 'success',
      deal_created: 'info',
      recommendation_converted: 'success',
      recommendation_rejected: 'danger',
      lead_assigned: 'warning',
      lead_unassigned: 'secondary'
    };
    return <Badge bg={variants[type] || 'secondary'}>{formatActivityType(type)}</Badge>;
  };

  const formatActivityType = (type) => {
    const types = {
      lead_status_change: 'Lead Status Changed',
      deal_status_change: 'Deal Status Changed',
      deal_created: 'New Deal Created',
      recommendation_converted: 'Recommendation Converted',
      recommendation_rejected: 'Recommendation Rejected',
      lead_assigned: 'Lead Assigned',
      lead_unassigned: 'Lead Unassigned'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'lead_status_change':
        return `Changed lead status from "${activity.old_value || 'N/A'}" to "${activity.new_value || 'N/A'}"`;
      case 'deal_status_change':
        return `Changed deal status from "${activity.old_value || 'N/A'}" to "${activity.new_value || 'N/A'}"`;
      case 'deal_created':
        return 'Created a new deal';
      case 'recommendation_converted':
        return 'Converted a recommendation into a deal';
      case 'recommendation_rejected':
        return 'Rejected a property recommendation';
      case 'lead_assigned':
        return `Assigned lead to ${activity.new_value || 'N/A'}`;
      case 'lead_unassigned':
        return 'Unassigned lead from agent';
      default:
        return '';
    }
  };

  const filterActivities = () => {
    return activities.filter(activity => {
      const matchesType = !filters.type || activity.type === filters.type;
      
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const activityDate = new Date(activity.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filters.dateRange) {
          case 'today':
            matchesDate = activityDate >= today;
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchesDate = activityDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchesDate = activityDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesType && matchesDate;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center">
            <p>Loading activities...</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
  
  if (error) return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center text-danger">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchActivities}>
              Retry
            </button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const filteredActivities = filterActivities();

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">System Activities</h2>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Activity Type</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Activities</option>
                  <option value="lead_status_change">Lead Status Changes</option>
                  <option value="deal_status_change">Deal Status Changes</option>
                  <option value="deal_created">New Deals</option>
                  <option value="recommendation_converted">Converted Recommendations</option>
                  <option value="recommendation_rejected">Rejected Recommendations</option>
                  <option value="lead_assigned">Lead Assignments</option>
                  <option value="lead_unassigned">Lead Unassignments</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date Range</Form.Label>
                <Form.Select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {filteredActivities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No activities found</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Agent</th>
                  <th>Lead</th>
                  <th>Details</th>
                  {filters.type === 'deal_status_change' || filters.type === 'deal_created' ? (
                    <th>Deal</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map(activity => (
                  <tr key={activity._id}>
                    <td>{formatDate(activity.date)}</td>
                    <td>{getActivityTypeBadge(activity.type)}</td>
                    <td>
                      {activity.agent_id ? (
                        <Link to={`/users/`}>
                          {activity.agent_id.full_name}
                        </Link>
                      ) : (
                        'System'
                      )}
                    </td>
                    <td>
                      {activity.lead_id ? (
                        <Link to={`/leads/${activity.lead_id._id}`}>
                          {activity.lead_id.full_name}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{getActivityDescription(activity)}</td>
                    {filters.type === 'deal_status_change' || filters.type === 'deal_created' ? (
                      <td>
                        {activity.deal_id ? (
                          <Link to={`/deals/${activity.deal_id._id}`}>
                            View Deal
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ActivitiesList;
  