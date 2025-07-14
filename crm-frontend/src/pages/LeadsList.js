import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    city: '',
    region: ''
  });

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
    fetchLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, leads]);

  const fetchLeads = async () => {
    try {
      console.log('Fetching leads...');
      const res = await api.get('/leads');
      console.log('Leads response:', res.data);
      setLeads(res.data);
      setFilteredLeads(res.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Filter by property type
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(lead => lead.preferences.property_type === filters.propertyType);
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(lead => lead.preferences.price_range.min >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(lead => lead.preferences.price_range.max <= Number(filters.maxPrice));
    }

    // Filter by location
    if (filters.city) {
      filtered = filtered.filter(lead => 
        lead.preferences.location.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    if (filters.region) {
      filtered = filtered.filter(lead => 
        lead.preferences.location.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      propertyType: 'all',
      minPrice: '',
      maxPrice: '',
      city: '',
      region: ''
    });
  };

  const deleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (err) {
        console.error('Error deleting lead:', err);
        alert('Failed to delete lead');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      new: 'primary',
      in_progress: 'warning',
      converted: 'success',
      lost: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Leads</h2>
          <div>
            <Button 
              variant="light" 
              size="sm"
              className="me-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Link to="/leads/add">
              <Button variant="light" size="sm">Add New Lead</Button>
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          {showFilters && (
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        <option value="all">All</option>
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Property Type</Form.Label>
                      <Form.Select
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleFilterChange}
                      >
                        <option value="all">All</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="commercial">Commercial</option>
                        <option value="land">Land</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Price Range</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          placeholder="Min Price"
                        />
                        <Form.Control
                          type="number"
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          placeholder="Max Price"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Location</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          name="city"
                          value={filters.city}
                          onChange={handleFilterChange}
                          placeholder="City"
                        />
                        <Form.Control
                          type="text"
                          name="region"
                          value={filters.region}
                          onChange={handleFilterChange}
                          placeholder="Region"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col className="d-flex justify-content-end">
                    <Button 
                      variant="outline-secondary" 
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Preferences</th>
                <th>Status</th>
                {userRole === 'admin' && <th>Agent</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.full_name}</td>
                  <td>
                    <div>📱 {lead.phone}</div>
                    <div>✉️ {lead.email}</div>
                  </td>
                  <td>
                    <div>
                      <strong>Type:</strong> {lead.preferences.property_type}
                    </div>
                    <div>
                      <strong>Price:</strong> ₪{lead.preferences.price_range.min.toLocaleString()} - 
                      ₪{lead.preferences.price_range.max.toLocaleString()}
                    </div>
                    <div>
                      <strong>Location:</strong> {lead.preferences.location.city}, {lead.preferences.location.region}
                    </div>
                  </td>
                  <td>{getStatusBadge(lead.status)}</td>
                  {userRole === 'admin' && (
                    <td>
                      {lead.agent_id ? (
                        <div>{lead.agent_id.full_name}</div>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </td>
                  )}
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/leads/${lead._id}`}>
                        <Button variant="info" size="sm">View</Button>
                      </Link>
                      <Link to={`/leads/edit/${lead._id}`}>
                        <Button variant="warning" size="sm">Edit</Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => deleteLead(lead._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredLeads.length === 0 && (
            <div className="text-center py-4">
              <p>No leads found</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default LeadsList;
