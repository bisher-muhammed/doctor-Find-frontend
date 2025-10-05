import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, Box, Typography } from '@mui/material';
import { FaCalendarAlt, FaUserMd, FaUserEdit } from 'react-icons/fa';
import { MdDashboard, MdMenu } from 'react-icons/md';

const navItems = [
  { to: '/doctor/home', icon: <MdDashboard size={24} />, label: 'Dashboard' },
  { to: '/doctor/Bookings/bookings', icon: <FaCalendarAlt size={24} />, label: 'Appointments' },
  { to: '/doctor/doctor_details', icon: <FaUserMd size={24} />, label: 'Profile' },
  { to: '/doctor/edit_profile', icon: <FaUserEdit size={24} />, label: 'Edit Profile' },
];

function Sidebar() {
  const authentication_user = useSelector((state) => state.authUser);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [open, setOpen] = useState(!isMobile); // Open on desktop, closed on mobile

  useEffect(() => {
    if (authentication_user.isAuthenticated && authentication_user.isDoctor) {
      navigate('/doctor/home');
    } else if (!authentication_user.isAuthenticated) {
      navigate('/doctor/login');
    }
  }, [authentication_user.isAuthenticated, authentication_user.isDoctor, navigate]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? (isMobile ? 80: 240) : 80,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? (isMobile ? 80 : 240) : 80,
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
          bgcolor: 'black', // Black Background
          color: 'white', // White Text
          boxShadow: 2,
        },
      }}
    >
      <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Toggle Button for Mobile View */}
        {isMobile && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpen(!open)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <MdMenu size={20} color="white" />
              <Typography variant="caption" sx={{ color: 'white', fontSize: '12px', marginTop: '4px' }}>
                Menu
              </Typography>
            </ListItemButton>
          </ListItem>
        )}

        {/* Sidebar Menu Items */}
        {navItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton component={Link} to={item.to} sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center' }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 'auto' }}>{item.icon}</ListItemIcon>
              {isMobile ? (
                <Typography variant="caption" sx={{ color: 'white', fontSize: '8px', marginTop: '4px' }}>
                  {item.label}
                </Typography>
              ) : (
                <ListItemText primary={item.label} sx={{ color: 'white', marginLeft: '8px' }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
