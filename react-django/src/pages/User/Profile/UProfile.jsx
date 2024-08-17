import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import User_Navbar from '../../../Components/Users/User_Navbar';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import profile_background from '../../../assets/profile_background.jpg';
import ProfileSidebar from './ProfileSidebar';

function UProfile() {
    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('access');

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/users/user_details/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Profile Data:', response.data); // Log the full profile data
                setProfileData(response.data);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Failed to fetch profile data');
                if (err.response && err.response.status === 401) {
                    navigate('/login'); // Redirect to login if unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, token]);

    if (loading) return <div className="flex justify-center items-center h-screen text-3xl text-black">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500 text-2xl">{error}</div>;
    if (!profileData) return <div className="flex justify-center items-center h-screen">No profile data available</div>;

    // Destructuring profile and user from profileData
    const { user, address, city, country, date_of_birth, first_name, gender, last_name, profile_pic, phone_number, state } = profileData;

    return (
        <div 
            className="min-h-screen w-full bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: `url(${profile_background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <User_Navbar />
            <div className="container mx-auto p-10">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <ProfileSidebar profileData={profileData} />
                    </div>
                    <div className="col-span-8">
                        <h1 className="text-3xl font-bold text-center mb-8 text-black italic">User Profile</h1>
                        <Card className="max-w-4xl mx-auto bg-cyan-50 shadow-lg rounded-3xl">
                            <CardBody className="p-8">
                                <Typography 
                                    variant="h5" 
                                    color="blue-gray" 
                                    className="text-2xl font-semibold mb-6 text-red-600"
                                >
                                    Profile Information
                                </Typography>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">Username:</strong> {user?.username || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">Email:</strong> {user?.email || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">Phone:</strong> {user?.phone_number || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">First Name:</strong> {first_name || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">Last Name:</strong> {last_name || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black p-4">Date of Birth:</strong> {date_of_birth || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">Gender:</strong> {gender || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">Address:</strong> {address || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">State:</strong> {state || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">City:</strong> {city || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="red" variant="subtitle1">
                                            <strong className="text-black">Country:</strong> {country || 'N/A'}
                                        </Typography>
                                    </div>
                                </div>
                                <Link to="/edit_profile" className="text-blue-500 hover:underline mt-4 block">
                                    Edit Profile
                                </Link>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default UProfile;

