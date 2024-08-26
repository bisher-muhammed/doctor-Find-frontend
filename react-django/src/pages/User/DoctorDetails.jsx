import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardBody, CardFooter, Typography, Button } from "@material-tailwind/react";
import { FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import User_Navbar from '../../Components/Users/User_Navbar';

function DoctorDetails() {
    const authentication_user = useSelector(state => state.authUser);
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const token = localStorage.getItem('access');
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000'; // Base URL for your API

    useEffect(() => {
        const fetchDetails = async () => {
            if (authentication_user.isAuthenticated && !authentication_user.isAdmin && !authentication_user.isDoctor) {
                try {
                    const response = await axios.get(`${baseURL}/api/users/available_slots/${doctorId}/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        }
                    });
                    setDoctorDetails(response.data);
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        navigate('/login');
                    } else {
                        console.error('Error fetching details:', error.response ? error.response.data : error.message);
                        setError(error.response ? error.response.data : error.message);
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                setError('User is not authenticated or does not have the right role.');
                setLoading(false);
            }
        };

        fetchDetails();
    }, [doctorId, token, authentication_user, navigate]);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4">Error loading details: {error}</div>;

    const { doctor, slots } = doctorDetails || {};

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
    };

    const handleBookNow = () => {
        alert(`Booking slot: ${selectedSlot.start_time}`);
        // Redirect to booking page or open a modal for booking
    };

    return (
        <div className="container mx-auto p-4 flex flex-wrap">
            <User_Navbar />
            <div className="w-full md:w-1/3 pr-4 mb-4 md:mb-0">
                {doctor ? (
                    <Card className="shadow-lg rounded-lg mb-4 border border-gray-200 w-90 mt-14 pt-6 mx-5">
                        <CardHeader className="relative h-56">
                            <img
                                src={`${baseURL}${doctor.profile_pic}`} // Prepend base URL to the profile_pic
                                alt={`${doctor.username}'s profile`}
                                className="object-cover rounded-t-lg w-full h-full"
                            />
                        </CardHeader>
                        <CardBody className="p-6">
                            <Typography variant="h5" color="blue-gray" className="mb-2 font-semibold text-xl text-center">
                                {doctor.username || 'Username not available'}
                            </Typography>
                            <div className="mb-4">
                                <Typography className="flex items-center mb-2 text-lg font-semibold text-blue-600">
                                    <FaUserMd className="mr-2 text-blue-500" />
                                    Specification:
                                    <span className="ml-2 text-gray-700">{doctor.specification || 'Not available'}</span>
                                </Typography>
                                <Typography className="flex items-center mb-2 text-lg font-semibold text-red-600">
                                    <FaCalendarAlt className="mr-2 text-red-500" />
                                    Experience:
                                    <span className="ml-2 text-gray-700">{doctor.experience} years</span>
                                </Typography>
                                <Typography className="flex items-center mb-2 text-lg font-semibold text-teal-900">
                                    <FaCalendarAlt className="mr-2 text-teal-500" />
                                    Email:
                                    <span className="ml-2 text-gray-700">{doctor.email}</span>
                                </Typography>
                            </div>
                            <Typography className="text-lg font-semibold text-red-400">
                                Bio:
                                <p className="mt-1 text-gray-900">{doctor.bio || 'Not available'}</p>
                            </Typography>
                        </CardBody>
                    </Card>
                ) : (
                    <Typography align="center" variant="body1">Doctor details not available.</Typography>
                )}
            </div>
            <div className="w-full md:w-2/3">
                <Typography variant="h5" align="center" className="text-gray-800 mb-6 font-bold">Available Slots</Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {slots && slots.length > 0 ? (
                        slots.map(slot => (
                            <div
                                key={slot.id}
                                className={`p-6 border rounded-lg shadow-lg cursor-pointer ${selectedSlot?.id === slot.id ? 'bg-slate-300 border-teal-500' : 'bg-white border-gray-300'}`}
                                onClick={() => handleSlotClick(slot)}
                            >
                                <Typography variant="body1" className="text-lg font-semibold mb-2">
                                    {new Date(slot.start_time).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </Typography>
                                <Typography variant="body1" className="text-red-600 font-semibold mb-2">
                                    {`${new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                </Typography>
                                <Typography variant="body1" className="text-teal-800 font-semibold">
                                    Duration: {slot.duration} minutes
                                </Typography>
                                {selectedSlot?.id === slot.id && (
                                    <Button className="mt-4 w-full" color="teal" onClick={handleBookNow}>
                                        Book Now
                                    </Button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center">
                            <Typography variant="body1">No available slots found.</Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DoctorDetails;
