import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  Box,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import DocumentUpload from '../../Components/Doctors/DocumentUpload';

function DoctorProfile() {
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const token = localStorage.getItem('access');
    const authentication_user = useSelector((state) => state.authUser);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/doctors/doctor/doctor_details/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProfileData(response.data);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Failed to fetch profile data');
                if (err.response && err.response.status === 401) {
                    navigate('/doctor/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, token]);

    

    const handleEditClick = () => {
        navigate('/doctor/edit_profile');
    };

    if (loading) {
        return (
            <Box sx={{ 
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3, bgcolor: '#fff3f3' }}>
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    if (!profileData) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">
                        No profile data available
                    </Typography>
                </Paper>
            </Container>
        );
    }

    const { 
        username, 
        email, 
        phone_number, 
        first_name, 
        last_name, 
        specification, 
        bio, 
        experience, 
        profile_pic 
    } = profileData;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Header Banner */}
                <Box sx={{ 
                    bgcolor: '#607d8b', 
                    height: 200, 
                    position: 'relative' 
                }}>
                    <Avatar
                        alt={username}
                        src={profile_pic ? `${baseURL}${profile_pic}` : '/default-avatar.png'}
                        sx={{
                            width: 150,
                            height: 150,
                            border: '5px solid white',
                            position: 'absolute',
                            bottom: -75,
                            left: 50,
                        }}
                    />
                </Box>

                {/* Main Content */}
                <Box sx={{ mt: 10, px: 4, pb: 4 }}>
                    <Grid container spacing={4}>
                        {/* Left Column - Basic Info */}
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h4" component="h1">
                                    Dr. {first_name || 'N/A'} {last_name || 'N/A'}
                                </Typography>
                                                        <Tooltip title="Edit Profile">
                                    <IconButton onClick={handleEditClick}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip 
                                        icon={<WorkIcon />} 
                                        label={specification || 'Not Specified'}
                                        color="primary" 
                                        variant="outlined" 
                                    />
                                    <Chip 
                                        icon={<TimeIcon />} 
                                        label={`${experience || 0} years experience`}
                                        color="secondary" 
                                        variant="outlined" 
                                    />
                                </Box>

                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    {bio || 'No bio provided'}
                                </Typography>
                            </Stack>
                        </Grid>

                        {/* Right Column - Contact Info */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="h6" gutterBottom>
                                    Contact Information
                                </Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon color="action" />
                                        <Typography variant="body2">
                                            {email || 'No email provided'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PhoneIcon color="action" />
                                        <Typography variant="body2">
                                            {phone_number || 'No phone provided'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* Document Upload Section */}
                    {profileData.id && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Documents
                            </Typography>
                            <DocumentUpload doctorId={profileData.id} />
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default DoctorProfile;