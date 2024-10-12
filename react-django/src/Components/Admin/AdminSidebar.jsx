// src/Components/Admin/AdminSidebar.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaCogs, FaSignOutAlt, FaStethoscope } from "react-icons/fa";
import { Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useDispatch } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";

const AdminSidebar = ({ isAdmin, onLogout }) => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                },
            }}
        >
            <div style={{ padding: 16, backgroundColor: '#333', color: '#ffaf' }}>
                <Typography variant="h6" noWrap>
                    Admin Panel
                </Typography>
            </div>
            <Divider />
            <List>
                <ListItem button component={NavLink} to="/admin/dashboard">
                    <ListItemIcon><FaTachometerAlt /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={NavLink} to="/admin/users_list">
                    <ListItemIcon><FaUsers /></ListItemIcon>
                    <ListItemText primary="Users" />
                </ListItem>
                <ListItem button component={NavLink} to="/admin/doctors_list">
                    <ListItemIcon><FaStethoscope /></ListItemIcon>
                    <ListItemText primary="Doctors" />
                </ListItem>
                <ListItem button component={NavLink} to="/admin/sales_report">
                    <ListItemIcon><FaStethoscope /></ListItemIcon>
                    <ListItemText primary="Sales" />
                </ListItem>
                <ListItem button component={NavLink} to='/admin/document_list'>
                    <ListItemIcon><FaCogs /></ListItemIcon>
                    <ListItemText primary="Document List" />
                </ListItem>
                <ListItem button onClick={onLogout}>
                    <ListItemIcon><FaSignOutAlt /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default AdminSidebar;
