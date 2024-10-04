import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaCogs, FaSignOutAlt, FaCalendarCheck, FaStethoscope } from "react-icons/fa";
import { Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider,Card,CardContent,CardActions,Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authentication_user = useSelector((state) => state.authUser);

  const logout = () => {
    if (authentication_user.isAdmin) {
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
      navigate("/admin/login");
    } else {
      alert("You are not authorized to log out from this section.");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
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
        <div style={{ padding: 16, backgroundColor: '#333', color: '#fff' }}>
          <Typography variant="h6" noWrap>
            Admin Panel
          </Typography>
        </div>
        <Divider />
        <List>
          <ListItem button component={NavLink} to="#">
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
          
          
          <ListItem button component={NavLink} to='/admin/document_list'>
            <ListItemIcon><FaCogs /></ListItemIcon>
            <ListItemText primary="Document List" />
          </ListItem>
          <ListItem button onClick={logout}>
            <ListItemIcon><FaSignOutAlt /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      
    </div>
  );
}

export default AdminDashboard;

