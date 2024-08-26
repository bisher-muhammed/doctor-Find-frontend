import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaCogs, FaSignOutAlt, FaCalendarCheck, FaStethoscope } from "react-icons/fa";
import { Button, Card, CardContent, CardActions, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
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
      navigate("/");
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
          {[
            { text: 'Dashboard', icon: <FaTachometerAlt /> },
            { text: 'Users', icon: <FaUsers /> },
            { text: 'Doctors', icon: <FaStethoscope /> },
            { text: 'Appointments', icon: <FaCalendarCheck /> },
            { text: 'Settings', icon: <FaCogs /> },
            { text: 'Document List', icon: <FaCogs /> },
          ].map((item) => (
            <ListItem button component={NavLink} to={`/admin/${item.text.toLowerCase().replace(' ', '_')}`} key={item.text}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <ListItem button onClick={logout}>
            <ListItemIcon><FaSignOutAlt /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <main style={{ flexGrow: 1, padding: 24 }}>
        <Card>
          <Typography variant="h5" component="div" style={{ padding: 16, backgroundColor: 'teal', color: '#fff' }}>
            Dashboard
          </Typography>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" style={{ backgroundColor: 'gray', color: '#fff', padding: 8 }}>
                    Total Users
                  </Typography>
                  <Typography variant="body1" component="div" style={{ padding: 16 }}>
                    Number of registered users: 500
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" style={{ backgroundColor: 'gray', color: '#fff', padding: 8 }}>
                    Total Doctors
                  </Typography>
                  <Typography variant="body1" component="div" style={{ padding: 16 }}>
                    Number of registered doctors: 150
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" style={{ backgroundColor: 'gray', color: '#fff', padding: 8 }}>
                    Appointments Today
                  </Typography>
                  <Typography variant="body1" component="div" style={{ padding: 16 }}>
                    Number of appointments scheduled: 75
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardActions>
            <Button color="primary" variant="contained" fullWidth>
              View More
            </Button>
          </CardActions>
        </Card>
      </main>
    </div>
  );
}

export default AdminDashboard;
