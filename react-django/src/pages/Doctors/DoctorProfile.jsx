import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  Badge
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  FileCopy as DocumentIcon,
  Security as SecurityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import DocumentUpload from '../../Components/Doctors/DocumentUpload';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function DoctorProfile() {
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const token = localStorage.getItem('access');
    const authentication_user = useSelector((state) => state.authUser);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [profileCompletion, setProfileCompletion] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/doctors/doctor/doctor_details/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProfileData(response.data);
                calculateProfileCompletion(response.data);
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
    }, [navigate, token, baseURL]);

    const calculateProfileCompletion = (data) => {
        let completedFields = 0;
        const totalFields = 8; // Adjust based on your required fields
        
        if (data.first_name) completedFields++;
        if (data.last_name) completedFields++;
        if (data.email) completedFields++;
        if (data.phone_number) completedFields++;
        if (data.specification) completedFields++;
        if (data.bio) completedFields++;
        if (data.experience) completedFields++;
        if (data.profile_pic) completedFields++;

        setProfileCompletion(Math.round((completedFields / totalFields) * 100));
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditClick = () => {
        navigate('/doctor/edit_profile');
    };

    const getCompletionColor = () => {
        if (profileCompletion >= 80) return 'success';
        if (profileCompletion >= 50) return 'warning';
        return 'error';
    };

    if (loading) {
        return (
            <Box sx={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2
            }}>
                <CircularProgress size={60} />
                <Typography variant="h6" color="textSecondary">
                    Loading your profile...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert 
                    severity="error" 
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!profileData) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="warning">
                    No profile data available. Please complete your profile setup.
                </Alert>
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
        profile_pic,
        is_verified,
        consultation_fee,
        address,
        languages
    } = profileData;

    const fullName = `Dr. ${first_name || ''} ${last_name || ''}`.trim() || 'Dr. ' + username;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Profile Completion Alert */}
            {profileCompletion < 100 && (
                <Alert 
                    severity={getCompletionColor()} 
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={handleEditClick}>
                            Complete Now
                        </Button>
                    }
                >
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" gutterBottom>
                            Profile Completion: {profileCompletion}%
                        </Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={profileCompletion} 
                            color={getCompletionColor()}
                            sx={{ height: 6, borderRadius: 3 }}
                        />
                    </Box>
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Left Sidebar - Quick Info */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ 
                            bgcolor: 'primary.main', 
                            height: 120,
                            position: 'relative'
                        }} />
                        
                        <CardContent sx={{ textAlign: 'center', mt: -8 }}>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    is_verified ? (
                                        <Tooltip title="Verified Doctor">
                                            <VerifiedIcon color="success" sx={{ bgcolor: 'white', borderRadius: '50%' }} />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Verification Pending">
                                            <SecurityIcon color="action" sx={{ bgcolor: 'white', borderRadius: '50%' }} />
                                        </Tooltip>
                                    )
                                }
                            >
                                <Avatar
                                    alt={fullName}
                                    src={profile_pic ? `${baseURL}${profile_pic}` : '/default-avatar.png'}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '4px solid white',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                />
                            </Badge>

                            <Typography variant="h5" component="h1" gutterBottom>
                                {fullName}
                            </Typography>

                            <Chip 
                                icon={<WorkIcon />} 
                                label={specification || 'General Practitioner'}
                                color="primary" 
                                variant="filled"
                                sx={{ mb: 2 }}
                            />

                            {/* Quick Stats */}
                            <Stack spacing={2} sx={{ mt: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">
                                        <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        Experience
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {experience || 0} years
                                    </Typography>
                                </Box>

                                {consultation_fee && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="textSecondary">
                                            <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                            Fee
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">
                                            ₹{consultation_fee}
                                        </Typography>
                                    </Box>
                                )}

                                {address && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="textSecondary">
                                            <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                            Location
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {address}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>

                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={handleEditClick}
                                fullWidth
                                sx={{ mt: 3 }}
                            >
                                Edit Profile
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Contact Information Card */}
                    <Card elevation={2} sx={{ mt: 3, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon color="primary" />
                                Contact Info
                            </Typography>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EmailIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body1">
                                            {email || 'Not provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PhoneIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">
                                            Phone
                                        </Typography>
                                        <Typography variant="body1">
                                            {phone_number || 'Not provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Main Content Area */}
                <Grid item xs={12} md={8}>
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 0 }}>
                            {/* Tabs */}
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs 
                                    value={tabValue} 
                                    onChange={handleTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                >
                                    <Tab 
                                        icon={<PersonIcon />} 
                                        iconPosition="start"
                                        label="Profile Overview" 
                                    />
                                    <Tab 
                                        icon={<DocumentIcon />} 
                                        iconPosition="start"
                                        label="Documents & Certificates" 
                                    />
                                    <Tab 
                                        icon={<CalendarIcon />} 
                                        iconPosition="start"
                                        label="Professional Details" 
                                    />
                                </Tabs>
                            </Box>

                            {/* Tab Panels */}
                            <TabPanel value={tabValue} index={0}>
                                <Box sx={{ px: 3 }}>
                                    <Typography variant="h5" gutterBottom>
                                        About Me
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            lineHeight: 1.8,
                                            bgcolor: 'grey.50',
                                            p: 3,
                                            borderRadius: 2,
                                            borderLeft: '4px solid',
                                            borderColor: 'primary.main'
                                        }}
                                    >
                                        {bio || (
                                            <Typography color="textSecondary" fontStyle="italic">
                                                No bio provided. Add a bio to help patients learn more about you.
                                            </Typography>
                                        )}
                                    </Typography>

                                    {/* Additional Information Grid */}
                                    <Grid container spacing={3} sx={{ mt: 2 }}>
                                        {languages && languages.length > 0 && (
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="h6" gutterBottom>
                                                    Languages Spoken
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                    {languages.map((lang, index) => (
                                                        <Chip 
                                                            key={index}
                                                            label={lang}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Stack>
                                            </Grid>
                                        )}

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="h6" gutterBottom>
                                                Profile Status
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Verification</Typography>
                                                    <Chip 
                                                        label={is_verified ? 'Verified' : 'Pending'} 
                                                        size="small"
                                                        color={is_verified ? 'success' : 'warning'}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Completion</Typography>
                                                    <Chip 
                                                        label={`${profileCompletion}%`} 
                                                        size="small"
                                                        color={getCompletionColor()}
                                                    />
                                                </Box>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <Box sx={{ px: 3 }}>
                                    <Typography variant="h5" gutterBottom>
                                        Documents & Certificates
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        Upload and manage your professional documents, certificates, and licenses.
                                    </Typography>
                                    {profileData.id && (
                                        <DocumentUpload doctorId={profileData.id} />
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={tabValue} index={2}>
                                <Box sx={{ px: 3 }}>
                                    <Typography variant="h5" gutterBottom>
                                        Professional Information
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                                                <Typography variant="h6" gutterBottom color="primary">
                                                    Specialization
                                                </Typography>
                                                <Typography variant="body1">
                                                    {specification || 'Not specified'}
                                                </Typography>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                                                <Typography variant="h6" gutterBottom color="primary">
                                                    Experience
                                                </Typography>
                                                <Typography variant="body1">
                                                    {experience || 0} years
                                                </Typography>
                                            </Card>
                                        </Grid>
                                        {consultation_fee && (
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                                                    <Typography variant="h6" gutterBottom color="primary">
                                                        Consultation Fee
                                                    </Typography>
                                                    <Typography variant="h4" color="success.main" fontWeight="bold">
                                                        ₹{consultation_fee}
                                                    </Typography>
                                                </Card>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </TabPanel>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default DoctorProfile;
