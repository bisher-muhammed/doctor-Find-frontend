import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment-timezone';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Fade,
  Slide,
  Paper,
  Tooltip,
  Avatar,
  Container,
  Grid
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  ClearAll as ClearAllIcon,
  Visibility as ReadIcon,
  NotificationsActive as NotificationActiveIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';

function DoctorNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const token = localStorage.getItem('access');
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const socket = useRef(null);

  // Get doctor ID from token
  const getDoctorId = useCallback(() => {
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.user_id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }, [token]);

  const doctorId = getDoctorId();

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const response = await axios.get(`${baseURL}/api/doctors/doctor/notification/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showSnackbar('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, baseURL]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`${baseURL}/api/doctors/doctor/notification/${notificationId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      
      showSnackbar('Notification marked as read');
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showSnackbar('Failed to mark notification as read', 'error');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notification => !notification.is_read);
      await Promise.all(
        unreadNotifications.map(notification =>
          axios.patch(`${baseURL}/api/doctors/doctor/notification/${notification.id}/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      showSnackbar('All notifications marked as read');
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      showSnackbar('Failed to mark all notifications as read', 'error');
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      await axios.delete(`${baseURL}/api/doctors/doctor/notification/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications([]);
      showSnackbar('All notifications cleared');
    } catch (error) {
      console.error("Error clearing notifications:", error);
      showSnackbar('Failed to clear notifications', 'error');
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    if (notification.message?.toLowerCase().includes('appointment')) {
      return <EventIcon color="primary" />;
    } else if (notification.message?.toLowerCase().includes('payment')) {
      return <PaymentIcon color="success" />;
    } else if (notification.message?.toLowerCase().includes('slot')) {
      return <ScheduleIcon color="info" />;
    }
    return <NotificationsIcon color="action" />;
  };

  // Format time
  const formatTime = (date) => {
    return moment(date).tz('Asia/Kolkata').format('h:mm A');
  };

  // Format date
  const formatDate = (date) => {
    return moment(date).tz('Asia/Kolkata').format('MMM DD, YYYY');
  };

  // Check if notification is recent (last 5 minutes)
  const isRecent = (createdAt) => {
    return moment().diff(moment(createdAt), 'minutes') < 5;
  };

  // Socket connection and event handling
  useEffect(() => {
    fetchNotifications();

    // Initialize socket connection
    if (doctorId) {
      socket.current = io(baseURL, { 
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
      });

      socket.current.on('connect', () => {
        console.log('Socket connected');
        socket.current.emit('join_room', { room_id: `doctor_${doctorId}` });
      });

      socket.current.on('receive_notification', (data) => {
        console.log("New notification received:", data);
        
        const newNotification = {
          id: data.id || Date.now(),
          message: data.message,
          slot_start: data.slot_start,
          slot_end: data.slot_end,
          created_at: data.timestamp || new Date().toISOString(),
          is_read: false,
          amount: data.amount || '200.00'
        };

        setNotifications(prev => [newNotification, ...prev]);
        
        // Show desktop notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Notification', {
            body: data.message,
            icon: '/doctor-icon.png'
          });
        }

        showSnackbar('New notification received', 'info');
      });

      socket.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.current.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [doctorId, baseURL, fetchNotifications]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchNotifications]);

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ color: 'white', pb: '16px !important' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Badge badgeContent={unreadCount} color="error" overlap="circular">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <NotificationsIcon />
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Notifications
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Manage your appointment and system notifications
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              <Tooltip title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}>
                <IconButton 
                  color="inherit" 
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? <NotificationActiveIcon /> : <NotificationsOffIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh notifications">
                <IconButton 
                  color="inherit" 
                  onClick={() => fetchNotifications(false)}
                  disabled={refreshing}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<MarkReadIcon />}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearAllIcon />}
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </Grid>
          <Grid item xs>
            <Box display="flex" justifyContent="flex-end" alignItems="center">
              <Chip 
                label={`${unreadCount} unread`} 
                color={unreadCount > 0 ? "error" : "default"}
                variant={unreadCount > 0 ? "filled" : "outlined"}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {notifications.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {notifications.map((notification, index) => (
                <Fade in={true} timeout={500} key={notification.id}>
                  <div>
                    <ListItem 
                      alignItems="flex-start"
                      sx={{
                        backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                        borderLeft: notification.is_read ? 'none' : '4px solid',
                        borderColor: 'primary.main',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'action.selected',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Badge
                          color="error"
                          variant="dot"
                          invisible={notification.is_read || !isRecent(notification.created_at)}
                        >
                          {getNotificationIcon(notification)}
                        </Badge>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography
                              variant="subtitle1"
                              component="span"
                              sx={{
                                fontWeight: notification.is_read ? 'normal' : 'bold',
                                flex: 1
                              }}
                            >
                              {notification.message}
                            </Typography>
                            {!notification.is_read && (
                              <Chip 
                                label="New" 
                                color="error" 
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {notification.slot_start && notification.slot_end && (
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {`${formatTime(notification.slot_start)} - ${formatTime(notification.slot_end)}`}
                                </Typography>
                              </Box>
                            )}
                            
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(notification.created_at)}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={1}>
                              <PaymentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Amount: ₹{notification.amount || '200.00'}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        {!notification.is_read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              edge="end"
                              aria-label="mark as read"
                              onClick={() => markAsRead(notification.id)}
                              color="primary"
                            >
                              <ReadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                  </div>
                </Fade>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={8}>
              <NotificationsOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're all caught up! New notifications will appear here.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Refresh Indicator */}
      {refreshing && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Chip
            icon={<CircularProgress size={16} />}
            label="Refreshing notifications..."
            variant="outlined"
          />
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DoctorNotification;
