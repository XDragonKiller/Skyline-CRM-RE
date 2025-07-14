import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Box,
  List,
  ListItem,
  Typography,
  Paper,
  IconButton,
  Badge,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Person as LeadIcon,
  Home as HomeIcon,
  AttachMoney as DealIcon
} from '@mui/icons-material';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      // First mark as read
      await api.put(`/notifications/${notificationId}`, { is_read: true });
      
      // Then delete the notification
      await api.delete(`/notifications/${notificationId}`);
      
      // Remove from local state
      setNotifications(notifications.filter(notification => 
        notification._id !== notificationId
      ));
    } catch (err) {
      console.error('Error handling notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'lead':
        navigate(`/leads/${notification.reference_id}`);
        break;
      case 'property':
        navigate(`/properties/${notification.reference_id}`);
        break;
      case 'deal':
        navigate(`/deals/${notification.reference_id}`);
        break;
      default:
        break;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lead':
        return <LeadIcon color="primary" />;
      case 'property':
        return <HomeIcon color="primary" />;
      case 'deal':
        return <DealIcon color="primary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lead':
        return 'primary';
      case 'property':
        return 'success';
      case 'deal':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Paper elevation={3}>
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <Typography color="textSecondary">No notifications</Typography>
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.is_read ? 'inherit' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%">
                    <Box mr={2}>
                      {getTypeIcon(notification.type)}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="body1">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(notification.date_created).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box ml={2}>
                      <Chip
                        label={notification.type}
                        color={getTypeColor(notification.type)}
                        size="small"
                      />
                    </Box>
                    {!notification.is_read && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                      >
                        <CheckCircleIcon color="action" />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsList;
  