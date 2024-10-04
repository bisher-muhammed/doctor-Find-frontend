import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardBody, Typography, Button } from "@material-tailwind/react";
import { FaUserMd, FaCalendarAlt,FaCreditCard,FaWallet,FaCheck  } from 'react-icons/fa';

import moment from 'moment';
import User_Navbar from '../../Components/Users/User_Navbar';
import PaymentSuccessMessage from '../../Components/Users/PaymentSuccessMessage';

function DoctorDetails() {
    const authentication_user = useSelector(state => state.authUser); // Get authenticated user
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null); // Track selected slot
    const [paymentMethod, setPaymentMethod] = useState('razorpay'); // Default payment method
    const [paymentSuccess, setPaymentSuccess] = useState(false); // Payment success flag
    const token = localStorage.getItem('access');
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000'; // Base URL for API

    // Format slot time for display
    const formatSlot = (slot) => {
        if (!slot.start_time || !slot.end_time) {
            return { date: 'Invalid Date', timeRange: 'Invalid Time' };
        }

        const start = moment(slot.start_time);
        const end = moment(slot.end_time);

        const formattedDate = start.format('YYYY-MM-DD');
        const formattedStart = start.format('h:mm A');
        const formattedEnd = end.format('h:mm A');

        return {
            date: formattedDate,
            timeRange: `${formattedStart} - ${formattedEnd}`,
        };
    };

    // Fetch doctor details on component mount
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

    // Handle slot selection
    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
    };

    // Handle payment method selection
    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    // Handle booking and payment process
    const handleBookNow = async () => {
        if (!selectedSlot) {
            alert("Please select a slot before booking.");
            return;
        }
    
        try {
            const response = await axios.post(
                `${baseURL}/api/users/book-slot/${doctorId}/${selectedSlot.id}/`,
                { payment_method: paymentMethod },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            const { razorpay_order_id, razorpay_key_id, amount, currency, booking_id } = response.data;
    
            if (paymentMethod === 'razorpay') {
                const options = {
                    key: razorpay_key_id,
                    amount: amount,
                    currency: currency,
                    name: "Doctor Appointment",
                    description: `Booking for ${doctor.username}`,
                    order_id: razorpay_order_id,
                    handler: async (response) => {
                        try {
                            await axios.post(`${baseURL}/api/users/verify-payment/`, {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                booking_id: booking_id
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                }
                            });
    
                            setPaymentSuccess(true);
    
                            // Introduce a small delay before starting the redirect
                            setTimeout(() => {
                                navigate('/appointments');
                            }, 5000); // 3 seconds delay to show the success message
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            alert("Payment verification failed. Please try again.");
                        }
                    },
                    theme: {
                        color: "#3399cc",
                    },
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else if (paymentMethod === 'wallet') {
                try {
                    await axios.post(
                        `${baseURL}/api/users/wallet_payment/`,
                        { booking_id: booking_id },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    setPaymentSuccess(true);
    
                    // Same small delay before redirecting
                    setTimeout(() => {
                        navigate('/appointments');
                    }, 5000); // 3 seconds delay to show the success message
                } catch (error) {
                    console.error('Wallet payment failed:', error);
                    alert("Wallet payment failed. Please try again.");
                }
            }
        } catch (error) {
            console.error('Error booking the slot:', error);
            alert("Error booking the slot. Please try again.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <User_Navbar />
            <div className="flex flex-col md:flex-row">
                {/* Doctor Card Section */}
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
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

                {/* Available Slots Section */}
                <div className="w-full md:w-2/3 px-4">
                    <Typography variant="h5" align="center" className="text-gray-800 mb-6 font-bold">Available Slots</Typography>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {slots && slots.length > 0 ? (
                            slots.map(slot => {
                                const { date, timeRange } = formatSlot(slot);
                                return (
                                    <div
                                        key={slot.id}
                                        className={`p-4 border rounded-lg cursor-pointer ${selectedSlot?.id === slot.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'}`}
                                        onClick={() => handleSlotClick(slot)}
                                    >
                                        <Typography className="font-semibold text-lg">{date}</Typography>
                                        <Typography className="text-gray-600">{timeRange}</Typography>
                                    </div>
                                );
                            })
                        ) : (
                            <Typography align="center" variant="body1">No available slots.</Typography>
                        )}
                    </div>
                    {selectedSlot && (
                        <div className="mt-4">
                            <Typography variant="h6" className="font-semibold text-center mb-4">Selected Slot</Typography>
                            <Typography align="center" className="text-lg">
                                {formatSlot(selectedSlot).date} - {formatSlot(selectedSlot).timeRange}
                            </Typography>
                        </div>
                    )}

                    {paymentSuccess && (
                        <PaymentSuccessMessage />
                    )}
                    <div className="mt-8">
                        <Typography align="center" className="mb-4  font-semibold">Select Payment Method:</Typography>
                        <div className="flex justify-center space-x-4">
                            <Button onClick={() => handlePaymentMethodChange('razorpay')} color={paymentMethod === 'razorpay' ? 'blue' : 'gray'} className="flex items-center space-x-2">
                                <FaCreditCard className="w-5 h-5" />
                                <span>Razorpay</span>
                            </Button>
                            <Button onClick={() => handlePaymentMethodChange('wallet')} color={paymentMethod === 'wallet' ? 'blue' : 'gray'} className="flex items-center space-x-2">
                                <FaWallet className="w-5 h-5" />
                                <span>Wallet</span>
                            </Button>
                        </div>
                        <Button color="teal" onClick={handleBookNow} className="mt-6 mx-auto block items-center justify-center space-x-2">
                        <FaCheck className="w-5 h-5" /> {/* Icon */}
                        <span>Book Now</span>
                    </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default DoctorDetails;
