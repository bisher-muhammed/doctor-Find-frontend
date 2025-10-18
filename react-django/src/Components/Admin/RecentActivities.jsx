import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { Circle, PersonAdd, CalendarToday, Payment } from '@mui/icons-material';

const RecentActivities = () => {
  const activities = [
    { id: 1, action: 'New patient registered', time: '2 min ago', type: 'user' },
    { id: 2, action: 'Appointment completed', time: '10 min ago', type: 'appointment' },
    { id: 3, action: 'Payment received', time: '15 min ago', type: 'payment' },
    { id: 4, action: 'New doctor joined', time: '1 hour ago', type: 'doctor' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <PersonAdd />;
      case 'appointment': return <CalendarToday />;
      case 'payment': return <Payment />;
      case 'doctor': return <PersonAdd />;
      default: return <Circle />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'user': return 'primary';
      case 'appointment': return 'success';
      case 'payment': return 'warning';
      case 'doctor': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Recent Activities
        </Typography>
        <List dense>
          {activities.map((activity) => (
            <ListItem key={activity.id} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Chip
                  icon={getIcon(activity.type)}
                  size="small"
                  color={getColor(activity.type)}
                  variant="outlined"
                />
              </ListItemIcon>
              <ListItemText
                primary={activity.action}
                secondary={activity.time}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
