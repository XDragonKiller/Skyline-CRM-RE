import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import favoriteService from '../services/favoriteService';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (propertyId) => {
    try {
      await favoriteService.removeFromFavorites(propertyId);
      setFavorites(favorites.filter(prop => prop._id !== propertyId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">המועדפים שלי</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {favorites.map((property) => (
          <Col key={property._id}>
            <Card>
              {property.images && property.images.length > 0 && (
                <Card.Img
                  variant="top"
                  src={property.images[0]}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <Card.Title>{property.title}</Card.Title>
                <Card.Text>
                  {property.address.city}, {property.address.street}
                  <br />
                  מחיר: ₪{property.price.toLocaleString()}
                  <br />
                  {property.features.rooms} חדרים | {property.features.size_sqm} מ"ר
                </Card.Text>
                <div className="d-flex justify-content-between">
                  <Link to={`/properties/${property._id}`}>
                    <Button variant="primary">פרטים נוספים</Button>
                  </Link>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveFromFavorites(property._id)}
                  >
                    הסר ממועדפים
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {favorites.length === 0 && (
        <div className="text-center mt-4">
          <p>אין נכסים במועדפים</p>
          <Link to="/properties">
            <Button variant="primary">חפש נכסים</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites; 