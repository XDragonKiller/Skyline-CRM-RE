import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaFilter } from 'react-icons/fa';
import api from '../api/api';
import favoriteService from '../services/favoriteService';

const PropertiesList = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    city: '',
    rooms: 'all'
  });

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, properties]);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      setProperties(res.data);
      setFilteredProperties(res.data);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favs = await favoriteService.getFavorites();
      setFavorites(new Set(favs.map(f => f._id)));
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const toggleFavorite = async (propertyId) => {
    try {
      if (favorites.has(propertyId)) {
        await favoriteService.removeFromFavorites(propertyId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      } else {
        await favoriteService.addToFavorites(propertyId);
        setFavorites(prev => new Set([...prev, propertyId]));
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  const getStatusBadge = (isActive) => {
    return <Badge bg={isActive ? 'success' : 'danger'}>
      {isActive ? 'Active' : 'Sold'}
    </Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      apartment: 'primary',
      house: 'info',
      commercial: 'warning',
      land: 'success',
      other: 'secondary'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(property => 
        filters.status === 'active' ? property.is_active : !property.is_active
      );
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(property => property.type === filters.type);
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= Number(filters.maxPrice));
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(property => 
        property.address.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filter by number of rooms
    if (filters.rooms !== 'all') {
      filtered = filtered.filter(property => 
        property.features.rooms === Number(filters.rooms)
      );
    }

    setFilteredProperties(filtered);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      minPrice: '',
      maxPrice: '',
      city: '',
      rooms: 'all'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Properties List</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Link to="/favorites" className="me-2">
            <Button variant="outline-primary">My Favorites</Button>
          </Link>
          <Link to="/properties/add">
            <Button variant="primary">Add New Property</Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4 shadow-sm">
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
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Rooms</Form.Label>
                  <Form.Select
                    name="rooms"
                    value={filters.rooms}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All</option>
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                    <option value="4">4 Rooms</option>
                    <option value="5">5+ Rooms</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    placeholder="Enter city name"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
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
              <Col md={6} className="mb-3 d-flex align-items-end">
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

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredProperties.map((property) => (
          <Col key={property._id}>
            <Card className="h-100 shadow-sm">
              {property.images && property.images.length > 0 ? (
                <Card.Img
                  variant="top"
                  src={property.images[0].startsWith('http') ? property.images[0] : `http://localhost:3001${property.images[0]}`}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              ) : (
                <Card.Img
                  variant="top"
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title>{property.title}</Card.Title>
                    <div className="mb-2">
                      {getTypeBadge(property.type)} {getStatusBadge(property.is_active)}
                    </div>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => toggleFavorite(property._id)}
                    className="p-0"
                  >
                    {favorites.has(property._id) ? (
                      <FaHeart color="red" size={20} />
                    ) : (
                      <FaRegHeart size={20} />
                    )}
                  </Button>
                </div>
                <Card.Text>
                  <div className="mb-2">
                    <strong>Location:</strong> {property.address.city}, {property.address.street}
                  </div>
                  <div className="mb-2">
                    <strong>Price:</strong> ₪{property.price.toLocaleString()}
                  </div>
                  <div>
                    <strong>Details:</strong> {property.features.rooms} rooms | {property.features.size_sqm} m² | {property.features.bathrooms} baths
                  </div>
                </Card.Text>
                <div className="d-flex justify-content-between mt-3">
                  <Link to={`/properties/${property._id}`}>
                    <Button variant="primary">View Details</Button>
                  </Link>
                  <Link to={`/properties/edit/${property._id}`}>
                    <Button variant="outline-secondary">Edit</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {filteredProperties.length === 0 && (
        <div className="text-center py-4">
          <p>No properties found</p>
        </div>
      )}
    </div>
  );
};

export default PropertiesList;
