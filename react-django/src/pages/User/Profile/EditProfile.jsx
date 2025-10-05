import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { set_profile_details } from '../../../Redux/UserProfileSlice';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { differenceInYears } from 'date-fns';
import {
    Card, CardHeader, CardContent, CardActions,
    TextField, Button, Select, MenuItem, InputLabel,
    FormControl, CircularProgress, Avatar
} from '@mui/material';

// Validation Schema
const profileValidationSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    first_name: yup.string()
        .matches(/^[A-Za-z]+$/, "First name must contain only letters")
        .min(4, "First name must be at least 4 characters")
        .required("First name is required"),
    last_name: yup.string()
        .matches(/^[A-Za-z]+$/, "Last name must contain only letters")
        .min(2, "Last name must be at least 2 characters")
        .required("Last name is required"),
    date_of_birth: yup.date()
        .required("Date of birth is required")
        .test("age", "You must be at least 18 years old", value =>
            differenceInYears(new Date(), new Date(value)) >= 18
        ),
    gender: yup.string().oneOf(["Male", "Female", "Other"], "Invalid gender").required("Gender is required"),
    phone: yup.string()
        .matches(/^\d+$/, "Phone must be digits only")
        .min(10, "Phone must be at least 10 digits")
        .required("Phone is required"),
    address: yup.string()
        .min(5, "Address must be at least 5 characters")
        .max(255, "Address cannot be more than 255 characters")
        .required("Address is required"),
    city: yup.string().matches(/^[A-Za-z\s]+$/, "City must contain only letters").required("City is required"),
    state: yup.string().matches(/^[A-Za-z\s]+$/, "State must contain only letters").required("State is required"),
    country: yup.string().matches(/^[A-Za-z\s]+$/, "Country must contain only letters").required("Country is required"),
});

function EditProfile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        username: "", first_name: "", last_name: "", date_of_birth: "",
        gender: "", email: "", phone: "", address: "", state: "",
        city: "", country: "", profile_pic: null
    });
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const token = localStorage.getItem('access');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/users/user_details/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = response.data;
                setFormData({
                    username: userData.user?.username || "",
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    date_of_birth: userData.date_of_birth || "",
                    gender: userData.gender || "",
                    email: userData.user?.email || "",
                    phone: userData.user?.phone_number || "",
                    address: userData.address || "",
                    state: userData.state || "",
                    city: userData.city || "",
                    country: userData.country || "",
                    profile_pic: null,
                });
                if (userData.profile_pic) {
                    setPreviewImage(`${baseURL}${userData.profile_pic}`);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, profile_pic: 'Only jpeg, png, gif, and webp images are allowed' }));
                return;
            }

            if (file.size > maxSize) {
                setErrors(prev => ({ ...prev, profile_pic: 'Image must be smaller than 5MB' }));
                return;
            }

            setErrors(prev => ({ ...prev, profile_pic: null }));
            setFormData(prev => ({ ...prev, profile_pic: file }));

            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (errors.profile_pic) {
            toast.error("Please fix the image error before submitting.");
            return;
        }

        try {
            await profileValidationSchema.validate(formData, { abortEarly: false });

            const formDataToSend = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key !== 'profile_pic' || formData.profile_pic instanceof File) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await axios.put(`${baseURL}/api/users/edit_profile/`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            dispatch(set_profile_details(response.data));
            toast.success("Profile updated successfully");
            navigate('/user_details');
        } catch (err) {
            if (err.name === 'ValidationError') {
                const fieldErrors = {};
                err.inner.forEach(e => {
                    fieldErrors[e.path] = e.message;
                });
                setErrors(fieldErrors);
            } else {
                setErrors(err.response?.data || {});
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-10"><CircularProgress /></div>;
    }

    return (
        <Card className="max-w-xl mx-auto p-10 mt-6 mb-6">
            <CardHeader title="Edit Profile" />
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center">
                        <Avatar src={previewImage} sx={{ width: 80, height: 80 }} />
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {errors.profile_pic && (
                        <p className="text-red-500 text-sm mt-1">{errors.profile_pic}</p>
                    )}

                    <TextField label="Username" name="username" fullWidth value={formData.username}
                        onChange={handleChange} error={!!errors.username} helperText={errors.username} />
                    <TextField label="Email" name="email" fullWidth value={formData.email}
                        onChange={handleChange} error={!!errors.email} helperText={errors.email} />
                    <TextField label="First Name" name="first_name" fullWidth value={formData.first_name}
                        onChange={handleChange} error={!!errors.first_name} helperText={errors.first_name} />
                    <TextField label="Last Name" name="last_name" fullWidth value={formData.last_name}
                        onChange={handleChange} error={!!errors.last_name} helperText={errors.last_name} />
                    <TextField type="date" label="Date of Birth" name="date_of_birth" fullWidth
                        value={formData.date_of_birth} onChange={handleChange}
                        error={!!errors.date_of_birth} helperText={errors.date_of_birth} />

                    <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel>Gender</InputLabel>
                        <Select name="gender" value={formData.gender} onChange={handleChange}>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                    </FormControl>

                    <TextField label="Phone" name="phone" fullWidth value={formData.phone}
                        onChange={handleChange} error={!!errors.phone} helperText={errors.phone} />
                    <TextField label="Address" name="address" fullWidth value={formData.address}
                        onChange={handleChange} error={!!errors.address} helperText={errors.address} />
                    <TextField label="City" name="city" fullWidth value={formData.city}
                        onChange={handleChange} error={!!errors.city} helperText={errors.city} />
                    <TextField label="State" name="state" fullWidth value={formData.state}
                        onChange={handleChange} error={!!errors.state} helperText={errors.state} />
                    <TextField label="Country" name="country" fullWidth value={formData.country}
                        onChange={handleChange} error={!!errors.country} helperText={errors.country} />
                </form>
            </CardContent>
            <CardActions>
                <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate('/user_details')}>
                    Cancel
                </Button>
            </CardActions>
        </Card>
    );
}

export default EditProfile;
