import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaFileAlt, FaChartLine, FaSignOutAlt, FaStethoscope } from "react-icons/fa";
import { Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";

const AdminSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authentication_user = useSelector((state) => state.authUser);

    const onLogout = () => {
        localStorage.clear();
        dispatch(
            set_authentication({
                userid: null,
                name: null,
                token: null,
                isAuthenticated: false,
                isAdmin: false,
                isActive: false,
                isDoctor: false,
            })
        );
        navigate('/admin/login');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 260,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 260,
                    boxSizing: 'border-box',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Box sx={{ padding: 2, backgroundColor: '#1e293b', color: '#fff' }}>
                <Typography variant="h6" noWrap>
                    Admin Panel
                </Typography>
            </Box>
            <Divider />
            <List>
                <ListItem button component={NavLink} to="/admin/dashboard">
                    <ListItemIcon sx={{ color: '#4b5563' }}><FaTachometerAlt /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={NavLink} to="/admin/users_list">
                    <ListItemIcon sx={{ color: '#4b5563' }}><FaUsers /></ListItemIcon>
                    <ListItemText primary="Users" />
                </ListItem>

                <ListItem button component={NavLink} to="/admin/Bookings">
                    <ListItemIcon sx={{ color: '#4b5563' }}><FaUsers /></ListItemIcon>
                    <ListItemText primary="Bookings" />
                </ListItem>
                <ListItem button component={NavLink} to="/admin/doctors_list">
                    <ListItemIcon sx={{ color: '#4b5563' }}><FaStethoscope /></ListItemIcon>
                    <ListItemText primary="Doctors" />
                </ListItem>
                <ListItem button component={NavLink} to="/admin/sales_report">
                    <ListItemIcon sx={{ color: '#4b5563' }}><FaChartLine /></ListItemIcon>
                    <ListItemText primary="Sales" />
                </ListItem>
                <ListItem button component={NavLink} to="/admin/document_list">
                    <ListItemIcon sx={{ color: '#4b5563' }}><FaFileAlt /></ListItemIcon>
                    <ListItemText primary="Document List" />
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem button onClick={onLogout}>
                    <ListItemIcon sx={{ color: '#f87171' }}><FaSignOutAlt /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default AdminSidebar;
