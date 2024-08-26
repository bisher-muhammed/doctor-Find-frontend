import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Grid, Card, CardContent, Typography, Avatar, CircularProgress } from '@mui/material';
import DocumentUpload from '../../Components/Doctors/DocumentUpload';
import { set_authentication } from "../../Redux/authenticationSlice";

function DoctorProfile() {
    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000';
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
                console.log('Profile Data:', response.data); // Log the full profile data
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Failed to fetch profile data');
                if (err.response && err.response.status === 401) {
                    navigate('/doctor/login'); // Redirect to login if unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, token]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            </Container>
        );
    }

    if (!profileData) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="body1">
                    No profile data available
                </Typography>
            </Container>
        );
    }

    const { username, email, phone_number, first_name, last_name, specification, bio, experience, available_from, available_to, profile_pic } = profileData;

return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
            <CardContent>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4} display="flex" justifyContent="center">
                        <Avatar
                            alt={username}
                            src={profile_pic ? `${baseURL}${profile_pic}` : '/default-avatar.png'}
                            sx={{ width: 150, height: 150 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <Typography variant="h4" gutterBottom>
                            Dr. {first_name || 'N/A'} {last_name || 'N/A'}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Username:</strong> {username || 'NA'}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Email:</strong> {email || 'NA'}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Phone:</strong> {phone_number || 'NA'}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Specification:</strong> {specification || 'Not Provided'}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Experience:</strong> {experience || 0} years
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            <strong>Bio:</strong> {bio || 'Not Provided'}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Available From:</strong> {available_from || 'Not Set'}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Available To:</strong> {available_to || 'Not Set'}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
            {/* Pass doctorId to DocumentUpload */}
            {profileData.id && <DocumentUpload doctorId={profileData.id} />}
        </Card>
    </Container>
);
}

export default DoctorProfile;
