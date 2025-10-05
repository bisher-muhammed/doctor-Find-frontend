import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from "@mui/material";
import axios from "axios";

const TotalRevenueDisplay = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false); // State to trigger animation
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL
  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/admin/admin/total-revenue-and-counts/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('response',response.data)
        

        setTotalRevenue(response.data.total_revenue);
        setDoctorCount(response.data.doctor_count);


        setPatientCount(response.data.patient_count);
        setAnimate(true); // Trigger the animation
      } catch (err) {
        setError("Error fetching revenue data");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [baseURL, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Circle style with conditional animation based on 'animate' state
  const circleStyle = (color) => ({
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: `6px solid ${color}`,
    borderColor: `${color} transparent ${color} transparent`,
    position: 'absolute',
    top: 8,
    right: 8,
    animation: animate ? 'spinOnce 1s ease-in-out' : 'none',
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Card sx={{ bgcolor: '#581845' }}>
          <CardContent sx={{ position: 'relative' }}>
            <Box sx={circleStyle('yellow')} />
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h4">₹{totalRevenue.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ bgcolor: '#95a5a6' }}>
          <CardContent sx={{ position: 'relative' }}>
            <Box sx={circleStyle('blue')} />
            <Typography variant="h6">Total Doctors</Typography>
            <Typography variant="h4">{doctorCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ bgcolor: '#C70039' }}>
          <CardContent sx={{ position: 'relative' }}>
            <Box sx={circleStyle('green')} />
            <Typography variant="h6">Total Patients</Typography>
            <Typography variant="h4">{patientCount}</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Keyframe animation for one rotation */}
      <style jsx="true">{`
        @keyframes spinOnce {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Grid>
  );
};

export default TotalRevenueDisplay;
