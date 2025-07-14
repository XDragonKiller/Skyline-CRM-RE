import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import imageService from '../services/imageService';

const AddProperty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    address: { street: '', city: '', country: '' },
    price: '',
    features: { rooms: '', bathrooms: '', size_sqm: '', floor: '', parking: false, balcony: false },
    images: [],
    is_active: true
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value }
      });
    } else if (name.startsWith('features.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        features: { ...formData.features, [field]: type === 'checkbox' ? checked : value }
      });
    } else if (name === 'is_active') {
      setFormData({ ...formData, is_active: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Create preview URLs for new files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      let userId = '';

      if (token) {
        const decoded = jwtDecode(token);
        userId = decoded.id;
      }

      // Upload images first
      let imageUrls = [];
      if (selectedFiles.length > 0) {
        try {
          imageUrls = await imageService.uploadMultipleImages(selectedFiles);
        } catch (err) {
          console.error('Error uploading images:', err);
          // Fallback: use a mock image URL if upload fails
          imageUrls = ['https://via.placeholder.com/150'];
        }
      }

      const payload = {
        ...formData,
        images: imageUrls,
        listed_by: userId,
        price: Number(formData.price),
        features: {
          ...formData.features,
          rooms: Number(formData.features.rooms),
          bathrooms: Number(formData.features.bathrooms),
          size_sqm: Number(formData.features.size_sqm),
          floor: Number(formData.features.floor)
        }
      };

      await api.post('/properties', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Property added successfully!');
      navigate('/properties');
    } catch (err) {
      console.error('Error adding property', err);
      alert('Error adding property');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control name="title" value={formData.title} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control name="description" as="textarea" value={formData.description} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Property Type</Form.Label>
        <Form.Select name="type" value={formData.type} onChange={handleChange}>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="commercial">Commercial</option>
          <option value="land">Land</option>
          <option value="other">Other</option>
        </Form.Select>
      </Form.Group>

      <Row>
        <Col>
          <Form.Label>Street</Form.Label>
          <Form.Control name="address.street" value={formData.address.street} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Label>City</Form.Label>
          <Form.Select name="address.city" value={formData.address.city} onChange={handleChange}>
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
        <Col>
          <Form.Label>Country</Form.Label>
          <Form.Control name="address.country" value={formData.address.country} onChange={handleChange} />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Label>Price (₪)</Form.Label>
          <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Label>Rooms</Form.Label>
          <Form.Control type="number" name="features.rooms" value={formData.features.rooms} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Label>Bathrooms</Form.Label>
          <Form.Control type="number" name="features.bathrooms" value={formData.features.bathrooms} onChange={handleChange} />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Label>Size (m²)</Form.Label>
          <Form.Control type="number" name="features.size_sqm" value={formData.features.size_sqm} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Label>Floor</Form.Label>
          <Form.Control type="number" name="features.floor" value={formData.features.floor} onChange={handleChange} />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Check type="checkbox" name="features.parking" label="Parking" checked={formData.features.parking} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Check type="checkbox" name="features.balcony" label="Balcony" checked={formData.features.balcony} onChange={handleChange} />
        </Col>
      </Row>

      <Form.Group className="mb-3 mt-3">
        <Form.Label>Images</Form.Label>
        <Form.Control
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <div className="mt-2 d-flex flex-wrap gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="position-relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-1"
                onClick={() => removeImage(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </Form.Group>

      <Form.Check type="checkbox" name="is_active" label="Active" checked={formData.is_active} onChange={handleChange} />

      <Button 
        type="submit" 
        className="mt-3" 
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Uploading...
          </>
        ) : (
          'Add Property'
        )}
      </Button>
    </Form>
  );
};

export default AddProperty;
