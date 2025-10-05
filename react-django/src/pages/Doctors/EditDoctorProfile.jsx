import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { set_doctor_profile_details } from '../../Redux/DoctorProfileSlice';
import axios from 'axios';
import * as yup from 'yup';

import {
  Box, Button, Container, Grid, TextField, Typography,
  Avatar, Paper, Divider, CircularProgress, Alert,
  Snackbar, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent
} from '@mui/material';
import { PhotoCamera, Save, Cancel } from '@mui/icons-material';

const profileSchema = yup.object().shape({
  first_name: yup.string()
    .matches(/^[A-Za-z]+$/, "Only letters allowed")
    .required("First name is required"),
  last_name: yup.string()
    .matches(/^[A-Za-z]+$/, "Only letters allowed")
    .required("Last name is required"),
  specification: yup.string()
    .required("Specialization is required"),
  experience: yup.number()
    .typeError("Experience must be a number")
    .min(0, "Must be positive")
    .required("Experience is required"),
  bio: yup.string().min(10, "Bio must be at least 10 characters"),
  gender: yup.string()
    .oneOf(["male", "female", "other"], "Invalid gender")
    .required("Gender is required"),
});

function EditDoctorProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const token = localStorage.getItem('access');

  const [formData, setFormData] = useState({
    username: "", first_name: "", last_name: "", email: "",
    gender: "", specification: "", phone: "", experience: "",
    bio: "", profile_pic: null,
  });

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/doctors/doctor/doctor_details/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;
        setFormData({
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          specification: data.specification || "",
          experience: data.experience || "",
          bio: data.bio || "",
          gender: data.gender || "",
          email: data.email || "",
          phone: data.phone_number || "",
          profile_pic: null
        });
        if (data.profile_pic) {
          setPreviewImage(`${baseURL}${data.profile_pic}`);
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, profile_pic: "Only JPG, PNG, or WEBP allowed" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profile_pic: "Max size is 5MB" }));
        return;
      }
      setFormData(prev => ({ ...prev, profile_pic: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profileSchema.validate(formData, { abortEarly: false });

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'profile_pic' && val instanceof File) {
          formDataToSend.append(key, val);
        } else if (key !== 'profile_pic') {
          formDataToSend.append(key, val);
        }
      });

      setLoading(true);
      const res = await axios.put(`${baseURL}/api/doctors/doctor/edit_profile/`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      dispatch(set_doctor_profile_details(res.data));
      setShowSuccess(true);
      setTimeout(() => navigate('/doctor/home'), 2000);
    } catch (err) {
      if (err.name === 'ValidationError') {
        const formattedErrors = {};
        err.inner.forEach(e => {
          formattedErrors[e.path] = e.message;
        });
        setErrors(formattedErrors);
      } else {
        console.error("Submit error", err);
        setErrors(prev => ({ ...prev, submit: "Failed to update profile" }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>Edit Profile</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar src={previewImage} sx={{ width: 120, height: 120 }} />
                    <Button variant="contained" component="label" sx={{ mt: 2 }}>
                      <PhotoCamera sx={{ mr: 1 }} /> Change Photo
                      <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>
                    {errors.profile_pic && <Typography color="error" variant="caption">{errors.profile_pic}</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Username" value={formData.username} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={formData.email} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="First Name" name="first_name" value={formData.first_name}
                onChange={handleChange} error={!!errors.first_name} helperText={errors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Last Name" name="last_name" value={formData.last_name}
                onChange={handleChange} error={!!errors.last_name} helperText={errors.last_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" value={formData.phone} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value=""><em>Select Gender</em></MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error">
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Specialization" name="specification" value={formData.specification}
                onChange={handleChange} error={!!errors.specification} helperText={errors.specification}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Experience (years)" name="experience" type="number"
                value={formData.experience} onChange={handleChange}
                error={!!errors.experience} helperText={errors.experience}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth label="Bio" name="bio" multiline rows={4} value={formData.bio}
                onChange={handleChange} error={!!errors.bio} helperText={errors.bio}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" color="error" onClick={() => navigate('/doctor/home')} startIcon={<Cancel />}>Cancel</Button>
                <Button variant="contained" color="primary" type="submit" startIcon={<Save />} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar open={showSuccess} autoHideDuration={6000} onClose={() => setShowSuccess(false)}>
        <Alert severity="success" variant="filled">Profile updated successfully!</Alert>
      </Snackbar>

      {errors.submit && <Alert severity="error" sx={{ mt: 2 }}>{errors.submit}</Alert>}
    </Container>
  );
}

export default EditDoctorProfile;
