import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

const DealsList = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: '',
    agent: 'all'
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
    fetchDeals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, deals]);

  const fetchDeals = async () => {
    try {
      const res = await api.get('/deals');
      setDeals(res.data);
      setFilteredDeals(res.data);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals');
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
    let filtered = [...deals];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(deal => deal.status === filters.status);
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(deal => deal.final_price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(deal => deal.final_price <= Number(filters.maxPrice));
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(deal => new Date(deal.date_opened) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(deal => new Date(deal.date_opened) <= endDate);
    }

    // Filter by agent (for admin users)
    if (filters.agent !== 'all' && userRole === 'admin') {
      filtered = filtered.filter(deal => deal.agent_id === filters.agent);
    }

    setFilteredDeals(filtered);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      endDate: '',
      agent: 'all'
    });
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Deals</h2>
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
            <Link to="/deals/new">
              <Button variant="light" size="sm">Add New Deal</Button>
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
                        <option value="open">Open</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="closed">Closed</option>
                        <option value="canceled">Canceled</option>
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
                      <Form.Label>Date Range</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="date"
                          name="startDate"
                          value={filters.startDate}
                          onChange={handleFilterChange}
                          placeholder="Start Date"
                        />
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={filters.endDate}
                          onChange={handleFilterChange}
                          placeholder="End Date"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3 d-flex align-items-end">
                    <Button 
                      variant="outline-secondary" 
                      onClick={resetFilters}
                      className="w-100"
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
                <th>Lead</th>
                <th>Property</th>
                <th>Status</th>
                <th>Price</th>
                <th>Date Opened</th>
                <th>Date Closed</th>
                {userRole === 'admin' && <th>Agent</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => (
                <tr key={deal._id}>
                  <td>
                    {deal.lead_id ? (
                      <>
                        <Link to={`/leads/${deal.lead_id._id}`}>
                          {deal.lead_id.full_name}
                        </Link>
                        <br />
                        <small className="text-muted">
                          📱 {deal.lead_id.phone}
                        </small>
                      </>
                    ) : (
                      <span className="text-muted">Lead not found</span>
                    )}
                  </td>
                  <td>
                    {deal.property_id ? (
                      <>
                        <Link to={`/properties/${deal.property_id._id}`}>
                          {deal.property_id.title}
                        </Link>
                        <br />
                        <small className="text-muted">
                          {deal.property_id.address?.city}, {deal.property_id.address?.street}
                        </small>
                      </>
                    ) : (
                      <span className="text-muted">Property not found</span>
                    )}
                  </td>
                  <td>{getStatusBadge(deal.status)}</td>
                  <td>
                    {deal.final_price ? (
                      `₪${deal.final_price.toLocaleString()}`
                    ) : deal.property_id?.price ? (
                      `₪${deal.property_id.price.toLocaleString()}`
                    ) : (
                      <span className="text-muted">Price not set</span>
                    )}
                  </td>
                  <td>{new Date(deal.date_opened).toLocaleDateString()}</td>
                  <td>{deal.date_closed ? new Date(deal.date_closed).toLocaleDateString() : 'N/A'}</td>
                  {userRole === 'admin' && (
                    <td>
                      {deal.agent_id ? (
                        <div>{deal.agent_id.full_name}</div>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </td>
                  )}
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/deals/${deal._id}`}>
                        <Button variant="info" size="sm">View</Button>
                      </Link>
                      <Link to={`/deals/edit/${deal._id}`}>
                        <Button variant="warning" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredDeals.length === 0 && (
            <div className="text-center py-4">
              <p>No deals found</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
  };
  
  export default DealsList;
  