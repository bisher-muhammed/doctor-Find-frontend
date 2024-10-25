import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { set_doctor_profile_details } from '../../Redux/DoctorProfileSlice';
import axios from 'axios';

import {
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    TextField,
    Typography,
    Avatar,
    MenuItem,
    InputLabel,
    FormControl,
    Select,
} from '@mui/material';

function EditDoctorProfile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const baseURL = 'http://127.0.0.1:8000';
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const token = localStorage.getItem('access');

    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        gender: "", // Gender field added here
        specification: "",
        phone: "",
        experience: "",
        bio: "",
        profile_pic: null,
    });

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/doctors/doctor/doctor_details/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const doctorData = response.data;

                // Log the received data to ensure the structure is as expected
                console.log("Doctor Data:", doctorData);

                setFormData({
                    username: doctorData.username || "",
                    first_name: doctorData.first_name || "",
                    last_name: doctorData.last_name || "",
                    specification: doctorData.specification || "",
                    experience: doctorData.experience || "",
                    bio: doctorData.bio || "",
                    gender: doctorData.gender || "", // Ensure this is set correctly
                    email: doctorData.email || "",
                    phone: doctorData.phone_number || "",
                    profile_pic: doctorData.profile_pic || null
                });

                // Handle the profile picture preview
                if (doctorData.profile_pic) {
                    setPreviewImage(`${baseURL}${doctorData.profile_pic}`);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
                setLoading(false);
            }
        };

        fetchDoctorProfile();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, profile_pic: file });

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        let formErrors = {};

        if (!formData.first_name) formErrors.first_name = 'First name is required';
        if (!formData.last_name) formErrors.last_name = 'Last name is required';
        if (!formData.specification) formErrors.specification = 'Specialization is required';

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formDataToSend = new FormData();

        // Append all fields except 'profile_pic' first
        for (let key in formData) {
            if (key !== 'profile_pic' && formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        }

        // Append profile_pic only if a new image is selected (it's a File)
        if (formData.profile_pic instanceof File) {
            formDataToSend.append('profile_pic', formData.profile_pic);
        }

        try {
            const response = await axios.put(`${baseURL}/api/doctors/doctor/edit_profile/`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            dispatch(set_doctor_profile_details(response.data));
            navigate('/doctor/home');
            console.log("Doctor profile updated successfully");
        } catch (error) {
            console.error("Error updating doctor profile:", error);
            // Handle error response and show appropriate error messages if needed
        }
    };
    console.log(formData)

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container maxWidth="md">
            <Box mt={6} mb={4}>
                <Typography variant="h4" align="center" color="primary" gutterBottom>
                    Edit Profile
                </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            disabled
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <Typography color="error">{errors.phone}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                        />
                        {errors.first_name && <Typography color="error">{errors.first_name}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                        />
                        {errors.last_name && <Typography color="error">{errors.last_name}</Typography>}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Specialization"
                            name="specification"
                            value={formData.specification}
                            onChange={handleChange}
                        />
                        {errors.specification && <Typography color="error">{errors.specification}</Typography>}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            multiline
                            rows={4}
                        />
                    </Grid>

                   
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <Box display="flex" alignItems="center">
                                <Avatar
                                    src={previewImage}
                                    alt="Profile"
                                    sx={{ width: 80, height: 80, mr: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    component="label"
                                >
                                    Upload Profile Picture
                                    <input
                                        type="file"
                                        name="profile_pic"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                    />
                                </Button>
                            </Box>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" type="submit" fullWidth>
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default EditDoctorProfile;
