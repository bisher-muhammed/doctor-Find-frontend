import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { set_profile_details } from '../../../Redux/UserProfileSlice';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@material-tailwind/react";
import { 
  MdEdit, 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdCake, 
  MdTransgender, 
  MdLocationOn, 
  MdFlag, 
  MdPublic 
} from 'react-icons/md';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaCity,
  FaGlobeAmericas 
} from 'react-icons/fa';

function UProfile() {
    const dispatch = useDispatch();
    const profileData = useSelector((state) => state.profile); 
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const token = localStorage.getItem('access');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${baseURL}/api/users/user_details/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { username, email, phone_number } = response.data.user; 
                const profileDetails = { 
                    ...response.data, 
                    username, 
                    email, 
                    phone: phone_number 
                };

                dispatch(set_profile_details(profileDetails));
            } catch (error) {
                console.error('Profile fetch error:', error);
                setError("Unable to load profile data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        // Always fetch fresh data when component mounts
        fetchProfileData();
    }, [dispatch, baseURL, token]);

    const { 
        username, 
        address, 
        city, 
        country, 
        date_of_birth, 
        first_name, 
        gender, 
        last_name, 
        profile_pic, 
        phone, 
        state, 
        email 
    } = profileData;

    const profilePic = profile_pic ? `${baseURL}${profile_pic}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
    
    // Safe icon mapping with fallbacks
    const profileFields = [
        { label: "Username", value: username, icon: <FaUser className="text-blue-500" /> },
        { label: "Email", value: email, icon: <MdEmail className="text-green-500" /> },
        { label: "Phone", value: phone, icon: <MdPhone className="text-purple-500" /> },
        { label: "Date of Birth", value: date_of_birth ? new Date(date_of_birth).toLocaleDateString() : null, icon: <MdCake className="text-pink-500" /> },
        { label: "Gender", value: gender, icon: <MdTransgender className="text-indigo-500" /> },
        { label: "Address", value: address, icon: <MdLocationOn className="text-red-500" /> },
        { label: "State", value: state, icon: <MdPublic className="text-orange-500" /> },
        { label: "City", value: city, icon: <FaCity className="text-teal-500" /> },
        { label: "Country", value: country, icon: <MdFlag className="text-yellow-500" /> },
    ];

    // Enhanced loading skeleton
    if (loading) {
        return (
            <div className="w-full px-4 py-6 animate-pulse">
                <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-8">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full"></div>
                        <div className="h-6 bg-gray-300 rounded w-48 mt-4"></div>
                    </div>
                    <div className="mt-6 space-y-4">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full px-4 py-6">
                <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button 
                        color="red" 
                        onClick={() => window.location.reload()}
                        className="mt-2"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-6">
            <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img 
                                    src={profilePic} 
                                    alt={`${first_name} ${last_name}'s Profile`} 
                                    className={`w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                                        imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                    }`}
                                    onLoad={() => setImageLoaded(true)}
                                />
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gray-300 rounded-full animate-pulse"></div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">
                                    {first_name || 'User'} {last_name || ''}
                                </h1>
                                <p className="text-blue-100 opacity-90">@{username || 'username'}</p>
                            </div>
                        </div>
                        <Link to="/edit_profile" className="mt-4 md:mt-0">
                            <Button 
                                variant="filled" 
                                color="white" 
                                size="lg"
                                className="flex items-center text-blue-600 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                            >
                                <MdEdit className="mr-2 text-xl" /> 
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {profileFields.map((field, index) => (
                            <div 
                                key={field.label}
                                className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 hover:scale-[1.02] ${
                                    index % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                                } border border-gray-100`}
                            >
                                <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                                    {field.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        {field.label}
                                    </label>
                                    <p className="text-gray-800 font-medium truncate">
                                        {field.value || (
                                            <span className="text-gray-400 italic">Not provided</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Actions */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
                        <Link to="/edit_profile" className="flex-1 max-w-xs mx-auto">
                            <Button 
                                variant="filled" 
                                color="red" 
                                size="lg"
                                fullWidth
                                className="flex items-center justify-center hover:shadow-lg transition-all duration-200"
                            >
                                <MdEdit className="mr-2 text-xl" /> 
                                Edit Profile
                            </Button>
                        </Link>
                        <Button 
                            variant="outlined" 
                            color="blue" 
                            size="lg"
                            className="flex-1 max-w-xs mx-auto hover:shadow-lg transition-all duration-200"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            Back to Top
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UProfile;
