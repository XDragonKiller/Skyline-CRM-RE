import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import api from '../api/api';

const AddLead = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    source: 'manual',
    notes: '',
    preferences: {
      property_type: 'apartment',
      price_range: {
        min: '',
        max: ''
      },
      location: {
        city: '',
        region: 'center'
      },
      features: {
        rooms: '',
        bathrooms: '',
        size_sqm: '',
        parking: false,
        balcony: false
      },
      family_size: '',
      urgency: 'medium'
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        const [pref, section, field] = parts;
        setFormData(prev => ({
          ...prev,
          [pref]: {
            ...prev[pref],
            [section]: {
              ...prev[pref][section],
              [field]: type === 'checkbox' ? checked : value
            }
          }
        }));
      } else {
        const [pref, field] = parts;
        setFormData(prev => ({
          ...prev,
          [pref]: {
            ...prev[pref],
            [field]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.preferences.location.region) {
        alert('Please select a region');
        return;
      }

      if (!formData.preferences.location.city) {
        alert('Please select a city');
        return;
      }

      // Process and validate numeric fields
      const processedData = {
        ...formData,
        preferences: {
          ...formData.preferences,
          price_range: {
            min: Number(formData.preferences.price_range.min) || 0,
            max: Number(formData.preferences.price_range.max) || 0
          },
          features: {
            rooms: Number(formData.preferences.features.rooms) || 0,
            bathrooms: Number(formData.preferences.features.bathrooms) || 0,
            size_sqm: Number(formData.preferences.features.size_sqm) || 0,
            parking: Boolean(formData.preferences.features.parking),
            balcony: Boolean(formData.preferences.features.balcony)
          },
          family_size: Number(formData.preferences.family_size) || 0,
          urgency: formData.preferences.urgency || 'medium'
        }
      };

      // Validate numeric fields
      if (isNaN(processedData.preferences.price_range.min) || 
          isNaN(processedData.preferences.price_range.max) ||
          isNaN(processedData.preferences.features.rooms) ||
          isNaN(processedData.preferences.features.bathrooms) ||
          isNaN(processedData.preferences.features.size_sqm) ||
          isNaN(processedData.preferences.family_size)) {
        alert('Please fill in all numeric fields with valid numbers');
        return;
      }

      if (processedData.preferences.price_range.min > processedData.preferences.price_range.max) {
        alert('Minimum price cannot be greater than maximum price');
        return;
      }

      if (processedData.preferences.features.rooms < 0 || 
          processedData.preferences.features.bathrooms < 0 ||
          processedData.preferences.features.size_sqm < 0 ||
          processedData.preferences.family_size < 0) {
        alert('Room, bathroom, size, and family size numbers cannot be negative');
        return;
      }

      // Validate urgency
      if (!['low', 'medium', 'high'].includes(processedData.preferences.urgency)) {
        processedData.preferences.urgency = 'medium';
      }

      // Log the exact data being sent
      console.log('Raw form data:', formData);
      console.log('Processed data being sent:', JSON.stringify(processedData, null, 2));
      
      const response = await api.post('/leads', processedData);
      console.log('Server response:', response.data);
      alert('Lead added successfully!');
      navigate('/leads');
    } catch (err) {
      console.error('Error adding lead:', err);
      if (err.response) {
        console.error('Error details:', err.response.data);
        if (err.response.data.details) {
          const errorMessage = `Validation errors:\n${err.response.data.details.map(detail => `- ${detail}`).join('\n')}`;
          console.error('Validation errors:', errorMessage);
          alert(errorMessage);
        } else {
          alert(err.response.data.message || 'Error adding lead');
        }
      } else {
        alert('Error adding lead');
      }
    }
  };

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Add New Lead</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h4 className="mb-0">Contact Information</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        minLength={9}
                        maxLength={12}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h4 className="mb-0">Property Preferences</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Property Type</Form.Label>
                      <Form.Select
                        name="preferences.property_type"
                        value={formData.preferences.property_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="commercial">Commercial</option>
                        <option value="land">Land</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Urgency Level</Form.Label>
                      <Form.Select
                        name="preferences.urgency"
                        value={formData.preferences.urgency}
                        onChange={handleChange}
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Label>Min Price (₪)</Form.Label>
                    <Form.Control
                      type="number"
                      name="preferences.price_range.min"
                      value={formData.preferences.price_range.min}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Max Price (₪)</Form.Label>
                    <Form.Control
                      type="number"
                      name="preferences.price_range.max"
                      value={formData.preferences.price_range.max}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Label>City</Form.Label>
                    <Form.Select
                      name="preferences.location.city"
                      value={formData.preferences.location.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a city</option>
                      <option value="Jerusalem">Jerusalem</option>
                      <option value="Tel Aviv">Tel Aviv</option>
                      <option value="Haifa">Haifa</option>
                      <option value="Rishon LeZion">Rishon LeZion</option>
                      <option value="Petah Tikva">Petah Tikva</option>
                      <option value="Ashdod">Ashdod</option>
                      <option value="Netanya">Netanya</option>
                      <option value="Beer Sheva">Beer Sheva</option>
                      <option value="Holon">Holon</option>
                      <option value="Bnei Brak">Bnei Brak</option>
                      <option value="Ramat Gan">Ramat Gan</option>
                      <option value="Bat Yam">Bat Yam</option>
                      <option value="Rehovot">Rehovot</option>
                      <option value="Herzliya">Herzliya</option>
                      <option value="Kfar Saba">Kfar Saba</option>
                      <option value="Modiin">Modiin</option>
                      <option value="Nahariya">Nahariya</option>
                      <option value="Tiberias">Tiberias</option>
                      <option value="Eilat">Eilat</option>
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Region</Form.Label>
                    <Form.Select
                      name="preferences.location.region"
                      value={formData.preferences.location.region}
                      onChange={handleChange}
                      required
                    >
                      <option value="north">North</option>
                      <option value="south">South</option>
                      <option value="center">Center</option>
                      <option value="jerusalem">Jerusalem</option>
                      <option value="tel_aviv">Tel Aviv</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={3}>
                    <Form.Label>Rooms</Form.Label>
                    <Form.Control
                      type="number"
                      name="preferences.features.rooms"
                      value={formData.preferences.features.rooms}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Bathrooms</Form.Label>
                    <Form.Control
                      type="number"
                      name="preferences.features.bathrooms"
                      value={formData.preferences.features.bathrooms}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Size (m²)</Form.Label>
                    <Form.Control
                      type="number"
                      name="preferences.features.size_sqm"
                      value={formData.preferences.features.size_sqm}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Family Size</Form.Label>
                    <Form.Control
                      type="number"
                      name="preferences.family_size"
                      value={formData.preferences.family_size}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      name="preferences.features.parking"
                      label="Parking Required"
                      checked={formData.preferences.features.parking}
                      onChange={handleChange}
                      className="mt-4"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      name="preferences.features.balcony"
                      label="Balcony Required"
                      checked={formData.preferences.features.balcony}
                      onChange={handleChange}
                      className="mt-4"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h4 className="mb-0">Additional Information</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate('/leads')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Lead
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddLead;
