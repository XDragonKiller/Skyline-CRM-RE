import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{property.title}</h2>
            <div>
              <Link to={`/properties/edit/${property._id}`}>
                <Button variant="outline-primary">Edit Property</Button>
              </Link>
            </div>
          </div>

          <Row>
            <Col md={6}>
              {property.images && property.images.length > 0 ? (
                <Card.Img
                  variant="top"
                  src={property.images[0].startsWith('http') ? property.images[0] : `http://localhost:3001${property.images[0]}`}
                  style={{ height: '300px', objectFit: 'cover' }}
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              ) : (
                <Card.Img
                  variant="top"
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              )}
            </Col>
            <Col md={6}>
              <h4>Property Details</h4>
              <p><strong>Type:</strong> {property.type}</p>
              <p><strong>Price:</strong> ₪{property.price.toLocaleString()}</p>
              <p><strong>Address:</strong> {property.address.street}, {property.address.city}, {property.address.country}</p>
              <p><strong>Rooms:</strong> {property.features.rooms}</p>
              <p><strong>Bathrooms:</strong> {property.features.bathrooms}</p>
              <p><strong>Size:</strong> {property.features.size_sqm}m²</p>
              <p><strong>Floor:</strong> {property.features.floor}</p>
              <p><strong>Parking:</strong> {property.features.parking ? 'Yes' : 'No'}</p>
              <p><strong>Balcony:</strong> {property.features.balcony ? 'Yes' : 'No'}</p>
            </Col>
          </Row>

          {property.description && (
            <div className="mt-4">
              <h4>Description</h4>
              <p>{property.description}</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PropertyDetails; 