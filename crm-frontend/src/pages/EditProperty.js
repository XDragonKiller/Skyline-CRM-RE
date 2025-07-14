import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';
import imageService from '../services/imageService';

const EditProperty = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        const property = response.data;
        
        setFormData({
          ...property,
          price: property.price.toString(),
          features: {
            ...property.features,
            rooms: property.features.rooms.toString(),
            bathrooms: property.features.bathrooms.toString(),
            size_sqm: property.features.size_sqm.toString(),
            floor: property.features.floor.toString()
          }
        });
        
        // Set preview URLs for existing images
        if (property.images && property.images.length > 0) {
          setPreviewUrls(property.images);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

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

      // Upload new images first
      let newImageUrls = [];
      if (selectedFiles.length > 0) {
        newImageUrls = await imageService.uploadMultipleImages(selectedFiles);
      }

      // Combine existing images with new ones
      const existingImages = formData.images.filter(url => !url.startsWith('blob:'));
      const allImages = [...existingImages, ...newImageUrls];

      const payload = {
        title: formData.title,
        description: formData.description || '',
        type: formData.type,
        address: {
          street: formData.address.street || '',
          city: formData.address.city || '',
          country: formData.address.country || ''
        },
        price: Number(formData.price) || 0,
        features: {
          rooms: Number(formData.features.rooms) || 0,
          bathrooms: Number(formData.features.bathrooms) || 0,
          size_sqm: Number(formData.features.size_sqm) || 0,
          floor: Number(formData.features.floor) || 0,
          parking: Boolean(formData.features.parking),
          balcony: Boolean(formData.features.balcony)
        },
        images: allImages,
        listed_by: userId,
        is_active: Boolean(formData.is_active)
      };

      await api.put(`/properties/${id}`, payload, {
        headers: { 'x-api-key': token }
      });

      alert('נכס עודכן בהצלחה!');
      navigate('/properties');
    } catch (err) {
      console.error('שגיאה בעדכון נכס', err);
      alert('שגיאה בעדכון נכס');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="title">כותרת</Form.Label>
        <Form.Control id="title" name="title" value={formData.title} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="description">תיאור</Form.Label>
        <Form.Control id="description" name="description" as="textarea" value={formData.description} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="type">סוג נכס</Form.Label>
        <Form.Select id="type" name="type" value={formData.type} onChange={handleChange} required>
          <option value="apartment">דירה</option>
          <option value="house">בית</option>
          <option value="commercial">מסחרי</option>
          <option value="land">קרקע</option>
          <option value="other">אחר</option>
        </Form.Select>
      </Form.Group>

      <Row>
        <Col>
          <Form.Label htmlFor="address.street">רחוב</Form.Label>
          <Form.Control id="address.street" name="address.street" value={formData.address.street} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Label htmlFor="address.city">עיר</Form.Label>
          <Form.Control id="address.city" name="address.city" value={formData.address.city} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Label htmlFor="address.country">מדינה</Form.Label>
          <Form.Control id="address.country" name="address.country" value={formData.address.country} onChange={handleChange} />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Label htmlFor="price">מחיר (₪)</Form.Label>
          <Form.Control id="price" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
        </Col>
        <Col>
          <Form.Label htmlFor="features.rooms">חדרים</Form.Label>
          <Form.Control id="features.rooms" type="number" name="features.rooms" value={formData.features.rooms} onChange={handleChange} min="0" />
        </Col>
        <Col>
          <Form.Label htmlFor="features.bathrooms">חדרי רחצה</Form.Label>
          <Form.Control id="features.bathrooms" type="number" name="features.bathrooms" value={formData.features.bathrooms} onChange={handleChange} min="0" />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Label htmlFor="features.size_sqm">גודל (מ״ר)</Form.Label>
          <Form.Control id="features.size_sqm" type="number" name="features.size_sqm" value={formData.features.size_sqm} onChange={handleChange} min="0" />
        </Col>
        <Col>
          <Form.Label htmlFor="features.floor">קומה</Form.Label>
          <Form.Control id="features.floor" type="number" name="features.floor" value={formData.features.floor} onChange={handleChange} min="0" />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Check id="features.parking" type="checkbox" name="features.parking" label="חניה" checked={formData.features.parking} onChange={handleChange} />
        </Col>
        <Col>
          <Form.Check id="features.balcony" type="checkbox" name="features.balcony" label="מרפסת" checked={formData.features.balcony} onChange={handleChange} />
        </Col>
      </Row>

      <Form.Group className="mb-3 mt-3">
        <Form.Label htmlFor="images">תמונות</Form.Label>
        <Form.Control
          id="images"
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

      <Form.Check id="is_active" type="checkbox" name="is_active" label="פעיל" checked={formData.is_active} onChange={handleChange} />

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
            מעדכן...
          </>
        ) : (
          'עדכן נכס'
        )}
      </Button>
    </Form>
  );
};

export default EditProperty;
