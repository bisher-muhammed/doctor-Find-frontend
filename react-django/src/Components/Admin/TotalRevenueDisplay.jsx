import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import { 
  TrendingUp, 
  People, 
  LocalHospital,
  MonetizationOn 
} from "@mui/icons-material";
import axios from "axios";

const TotalRevenueDisplay = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/admin/admin/total-revenue-and-counts/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setTotalRevenue(response.data.total_revenue);
        setDoctorCount(response.data.doctor_count);
        setPatientCount(response.data.patient_count);
        
        // Trigger animation after a small delay for better visual effect
        setTimeout(() => setAnimate(true), 100);
      } catch (err) {
        setError("Error fetching revenue data");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [baseURL, token]);

  // Format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Card data configuration
  const cardData = [
    {
      title: "Total Revenue",
      value: `₹${formatCurrency(totalRevenue)}`,
      icon: <MonetizationOn sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      bgColor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
      delay: 0
    },
    {
      title: "Total Doctors",
      value: doctorCount,
      icon: <LocalHospital sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
      bgColor: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
      delay: 100
    },
    {
      title: "Total Patients",
      value: patientCount,
      icon: <People sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      bgColor: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`,
      delay: 200
    }
  ];

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 200,
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 200,
          flexDirection: 'column',
          gap: 2,
          p: 3
        }}
      >
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Please check your connection and try again
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          mb: 4,
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <TrendingUp sx={{ color: theme.palette.primary.main }} />
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{
                background: card.bgColor,
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                transform: animate ? 'translateY(0)' : 'translateY(20px)',
                opacity: animate ? 1 : 0,
                animationDelay: `${card.delay}ms`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                }
              }}
              style={{
                transitionDelay: `${card.delay}ms`
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: alpha('#fff', 0.1),
                    zIndex: 0
                  }}
                />
                
                {/* Content */}
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 500,
                          opacity: 0.9,
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        component="div" 
                        sx={{ 
                          fontWeight: 700,
                          mt: 1,
                          fontSize: isMobile ? '1.75rem' : '2.125rem'
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        background: alpha('#fff', 0.2),
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  
                  {/* Progress Indicator */}
                  <Box 
                    sx={{ 
                      mt: 2,
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.8
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      Updated just now
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Stats or Info Panel */}
      <Box 
        sx={{ 
          mt: 4,
          p: 3,
          background: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Performance Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your platform is serving {doctorCount} doctors and {patientCount} patients with total revenue of ₹{formatCurrency(totalRevenue)}.
          {totalRevenue > 100000 && " Excellent performance this period!"}
        </Typography>
      </Box>
    </Box>
  );
};

export default TotalRevenueDisplay;
