import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { set_profile_details } from '../../../Redux/UserProfileSlice';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { MdEdit } from 'react-icons/md';

function UProfile() {
    const dispatch = useDispatch();
    const profileData = useSelector((state) => state.profile); 
    const baseURL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('access');

    // Local state for loading and error handling
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true); // Set loading to true before fetching
                const response = await axios.get(`${baseURL}/api/users/user_details/`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Include the token in the request
                    }
                });

                // Adjust this line to extract user details correctly
                const { username, email, phone_number } = response.data.user; 
                const profileDetails = { ...response.data, username, email, phone: phone_number };

                dispatch(set_profile_details(profileDetails)); // Update Redux store with fetched data
            } catch (error) {
                setError("Error fetching profile data: " + error.message);
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        if (!profileData.username) { // Check if profile data is empty
            fetchProfileData(); // Only fetch if no profile data exists
        } else {
            setLoading(false); // No fetch needed, set loading to false
        }
    }, [dispatch, profileData, token]);

    // Destructure profile data
    const { username, address, city, country, date_of_birth, first_name, gender, last_name, profile_pic, phone, state, email } = profileData;

    // Set default profile picture
    const profilePic = profile_pic ? `http://127.0.0.1:8000${profile_pic}` : 'https://via.placeholder.com/150';

    if (loading) return <div>Loading...</div>; // Show loading state
    if (error) return <div>{error}</div>; // Show error message

    return (
        <div className="min-h-screen w-full flex flex-col items-center mt-10">
            <div className="flex flex-col items-center justify-center w-full px-4 py-8 sm:py-12">
                <div className="w-full max-w-4xl bg-slate-300 rounded-lg shadow-lg p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-6 italic">
                        User Profile
                    </h1>
                    <div className="flex flex-col items-center">
                        {/* Profile Picture */}
                        <div className="mb-6">
                            <img
                                src={profilePic}
                                alt={`${first_name} ${last_name}'s Profile`}
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-gray-200 shadow-lg"
                            />
                        </div>

                        {/* Name */}
                        <Typography
                            variant="h5"
                            color="blue-gray"
                            className="text-center text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-800"
                        >
                            {first_name} {last_name}
                        </Typography>

                        {/* User Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left mt-4">
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">Username:</strong> {username || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">Email:</strong> {email || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">Phone:</strong> {phone || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">Date of Birth:</strong> {date_of_birth || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">Gender:</strong> {gender || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">Address:</strong> {address || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">State:</strong> {state || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">City:</strong> {city || 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography color="gray" variant="subtitle1">
                                    <strong className="text-black">Country:</strong> {country || 'N/A'}
                                </Typography>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex justify-center mt-8">
                            <Link to="/edit_profile">
                                <Button variant="filled" color="red" size="sm" className="flex items-center">
                                    <MdEdit className="mr-2 text-xl" /> Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UProfile;

