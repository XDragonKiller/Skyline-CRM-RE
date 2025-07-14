import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import api from '../api/api';

const EditDeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    final_price: '',
    notes: '',
    status: ''
  });

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const fetchDeal = async () => {
    try {
      const response = await api.get(`/deals/${id}`);
      setDeal(response.data);
      setFormData({
        final_price: response.data.final_price || '',
        notes: response.data.notes || '',
        status: response.data.status || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deal:', err);
      setError('Failed to load deal details');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up the form data before sending
      const cleanedData = {};
      
      // Only include fields that have values
      if (formData.final_price !== '') {
        // Ensure final_price is a number
        const price = parseFloat(formData.final_price);
        if (!isNaN(price)) {
          cleanedData.final_price = price;
        }
      }
      if (formData.notes !== '') {
        cleanedData.notes = formData.notes;
      }
      if (formData.status !== '') {
        cleanedData.status = formData.status;
      }

      console.log('Sending data:', cleanedData); // Debug log

      // Make a single update call with all changes
      const response = await api.put(`/deals/${id}`, cleanedData);
      console.log('Update response:', response.data); // Debug log
      
      if (response.data) {
        console.log('Update successful, navigating...'); // Debug log
        // Show success message
        alert('Deal updated successfully');
        // Force a navigation to refresh the deal details
        navigate(`/deals/${id}`, { replace: true, state: { refresh: true } });
      } else {
        console.log('No response data received'); // Debug log
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error updating deal:', err);
      console.error('Request data:', formData); // Debug log
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      }); // Debug log
      
      // Show more specific error message
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Failed to update deal: ${errorMessage}`);
      
      // If it's a validation error, show the specific field that failed
      if (err.response?.status === 400) {
        console.error('Validation error:', err.response.data);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'final_price' ? value : value
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!deal) return <div>Deal not found</div>;

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <h2>Edit Deal</h2>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Final Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="final_price"
                    value={formData.final_price}
                    onChange={handleChange}
                    placeholder="Enter final price"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="open">Open</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed">Closed</option>
                    <option value="canceled">Canceled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter deal notes"
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => navigate(`/deals/${id}`)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditDeal; 