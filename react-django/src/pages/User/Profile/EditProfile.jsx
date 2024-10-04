import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { set_profile_details } from '../../../Redux/UserProfileSlice';
import axios from 'axios';

function EditProfile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const baseURL = 'http://127.0.0.1:8000';
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        state: "",
        city: "",
        country: "",
        profile_pic: null
    });
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const token = localStorage.getItem('access'); 

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/users/user_details/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const userData = response.data;

                setFormData({
                    username: userData.user?.username || "",
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    date_of_birth: userData.date_of_birth || "",
                    gender: userData.gender || "",
                    email: userData.user?.email || "",
                    phone: userData.user?.phone || "",
                    address: userData.address || "",
                    state: userData.state || "",
                    city: userData.city || "",
                    country: userData.country || "",
                    profile_pic: userData.profile_pic || null
                });

                if (userData.profile_pic) {
                    setPreviewImage(`${baseURL}${userData.profile_pic}`);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setLoading(false);
            }
        };

        fetchUserProfile();
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
        // Perform validation here if needed
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
            const response = await axios.put(`${baseURL}/api/users/edit_profile/`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            dispatch(set_profile_details(response.data));
            navigate('/user_details');
            console.log("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 mt-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-red-600">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white shadow-md rounded-md px-8 pt-6 pb-8 mb-4 border-black border">
                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    />
                    {errors.username && <p className="text-red-500 text-xs italic">{errors.username}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                        />
                        {errors.first_name && <p className="text-red-500 text-xs italic">{errors.first_name}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                        />
                        {errors.last_name && <p className="text-red-500 text-xs italic">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="date_of_birth">Date of Birth</label>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    />
                    {errors.date_of_birth && <p className="text-red-500 text-xs italic">{errors.date_of_birth}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="gender">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs italic">{errors.gender}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    />
                    {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="phone">Phone Number</label>
                    <input
                        type="number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    />
                    {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="address">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    />
                    {errors.address && <p className="text-red-500 text-xs italic">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="state">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                        />
                        {errors.state && <p className="text-red-500 text-xs italic">{errors.state}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="city">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                        />
                        {errors.city && <p className="text-red-500 text-xs italic">{errors.city}</p>}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="country">Country</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    />
                    {errors.country && <p className="text-red-500 text-xs italic">{errors.country}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-black text-sm font-bold mb-2" htmlFor="profile_pic">Profile Picture</label>
                    <input
                        type="file"
                        name="profile_pic"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="appearance-none block w-full bg-white text-black font-bold border border-blue-400 rounded py-3 px-4 mb-3 focus:bg-red-200 shadow-slate-800"
                    />
                    {errors.profile_pic && <p className="text-red-500 text-xs italic">{errors.profile_pic}</p>}
                    {previewImage && (
                        <div className="mt-4">
                            <img src={previewImage} alt="Preview" className="max-w-xs mx-auto rounded-full border border-blue-400 shadow-lg" />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/user_details')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}


export default EditProfile;
