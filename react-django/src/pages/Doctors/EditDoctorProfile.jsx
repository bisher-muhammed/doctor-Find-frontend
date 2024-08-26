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
        gender: "",
        specification: "",
        phone: "",
        experience: "",
        bio: "",
        profile_pic: null,
        available_from: "",
        available_to: ""
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

                setFormData({
                    username: doctorData.user?.username || "",
                    first_name: doctorData.first_name || "",
                    last_name: doctorData.last_name || "",
                    specification: doctorData.specialization || "",
                    experience: doctorData.experience || "",
                    bio: doctorData.bio || "",
                    gender: doctorData.gender || "",
                    email: doctorData.user?.email || "",
                    phone: doctorData.user?.phone_number || "",
                    available_from: doctorData.available_from || "",
                    available_to: doctorData.available_to || "",
                    profile_pic: doctorData.profile_pic || null
                });

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
        if (!formData.available_from || !formData.available_to) formErrors.availability = 'Availability is required';

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formDataToSend = new FormData();
        for (let key in formData) {
            if (formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
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
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Gender</InputLabel>
                            <Select
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <MenuItem value=""><em>Select Gender</em></MenuItem>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        {errors.gender && <Typography color="error">{errors.gender}</Typography>}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Phone Number"
                            name="phone"
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

                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Available From"
                            type="time"
                            name="available_from"
                            value={formData.available_from}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {errors.availability && <Typography color="error">{errors.availability}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Available To"
                            type="time"
                            name="available_to"
                            value={formData.available_to}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {errors.availability && <Typography color="error">{errors.availability}</Typography>}
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                        >
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default EditDoctorProfile;
