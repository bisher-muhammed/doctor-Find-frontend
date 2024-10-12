import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardBody, Typography, Button, Spinner, Radio } from "@material-tailwind/react";
import { FaUserMd, FaCalendarAlt, FaCreditCard, FaWallet, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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

    // Filter states
    const [showFilter, setShowFilter] = useState(false); // Toggle filter box
    const [dateFilter, setDateFilter] = useState(''); // Date filter input
    const [timeFilter, setTimeFilter] = useState(''); // Time filter input
    const [filteredSlots, setFilteredSlots] = useState([]); // Filtered slots

    // Format the slot time for display
    const formatSlot = (slot) => {
        const start = moment(slot.start_time);
        const end = moment(slot.end_time);
        return {
            date: start.format('YYYY-MM-DD'),
            timeRange: `${start.format('h:mm A')} - ${end.format('h:mm A')}`
        };
    };

    // Fetch doctor details and available slots
    useEffect(() => {
        const fetchDetails = async () => {
            if (authentication_user.isAuthenticated && !authentication_user.isAdmin && !authentication_user.isDoctor) {
                try {
                    const response = await axios.get(`${baseURL}/api/users/available_slots/${doctorId}/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setDoctorDetails(response.data);
                    setFilteredSlots(response.data.slots); // Set filtered slots initially to all available slots
                } catch (error) {
                    setError(error.response ? error.response.data : error.message);
                    if (error.response && error.response.status === 401) {
                        navigate('/login');
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

    // Filter slots based on date or time
    useEffect(() => {
        if (doctorDetails && doctorDetails.slots) {
            const filtered = doctorDetails.slots.filter(slot => {
                const { date, timeRange } = formatSlot(slot);
                const timeMatch = timeFilter ? timeRange.includes(timeFilter) : true;
                const dateMatch = dateFilter ? date === dateFilter : true;
                return timeMatch && dateMatch;
            });
            setFilteredSlots(filtered);
        }
    }, [dateFilter, timeFilter, doctorDetails]);

    // Handle payment method selection
    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    // Handle booking confirmation and payment
    const handleBookNow = async () => {
        if (!selectedSlot) {
            alert("Please select a slot before booking.");
            return;
        }

        try {
            const response = await axios.post(`${baseURL}/api/users/book-slot/${doctorId}/${selectedSlot.id}/`, {
                payment_method: paymentMethod,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { razorpay_order_id, razorpay_key_id, amount, currency, booking_id } = response.data;

            if (paymentMethod === 'razorpay') {
                const options = {
                    key: razorpay_key_id,
                    amount,
                    currency,
                    name: "Doctor Appointment",
                    order_id: razorpay_order_id,
                    handler: async (response) => {
                        try {
                            await axios.post(`${baseURL}/api/users/verify-payment/`, {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                booking_id
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            setPaymentSuccess(true);
                            setTimeout(() => { navigate('/appointments'); }, 5000);
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            alert("Payment verification failed. Please try again.");
                        }
                    },
                    theme: { color: "#3399cc" },
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else if (paymentMethod === 'wallet') {
                await axios.post(`${baseURL}/api/users/wallet_payment/`, { booking_id }, { headers: { Authorization: `Bearer ${token}` } });
                setPaymentSuccess(true);
                setTimeout(() => { navigate('/appointments'); }, 5000);
            }
        } catch (error) {
            console.error('Error booking the slot:', error);
            alert("Error booking the slot. Please try again.");
        }
    };

    // Loading and error states
    if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    if (error) return <div className="text-center p-4">Error loading details: {error}</div>;

    const { doctor } = doctorDetails || {};

    return (
        <div className="container mx-auto p-4 min-h-screen">
            <User_Navbar />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20">
                <div className="md:col-span-1">
                    {doctor ? (
                        <Card className="shadow-lg rounded-lg border border-gray-200 py-7">
                            <CardHeader className="relative h-56">
                                <img src={`${baseURL}${doctor.profile_pic}`} alt={doctor.username} className="object-cover w-full h-full rounded-t-lg" />
                            </CardHeader>
                            <CardBody>
                                <Typography variant="h5" className="text-center mb-4">{doctor.username || 'Username not available'}</Typography>
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center">
                                        <FaUserMd className="text-blue-500 mr-2" />
                                        <span>Specification: <strong>{doctor.specification || 'Not available'}</strong></span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="text-red-500 mr-2" />
                                        <span>Experience: <strong>{doctor.experience} years</strong></span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="text-teal-500 mr-2" />
                                        <span>Email: <strong>{doctor.email}</strong></span>
                                    </div>
                                </div>
                                <Typography variant="body2" className="mt-4 text-gray-700">{doctor.bio || 'Bio not available'}</Typography>
                            </CardBody>
                        </Card>
                    ) : <Typography align="center">Doctor details not available.</Typography>}
                </div>

                <div className="md:col-span-2">
                    <Typography variant="h5" className="text-center font-bold mb-6">Available Slots</Typography>

                    {/* Filter Button */}
                    <div className="flex justify-between items-center mb-4">
                        <Button 
                            onClick={() => setShowFilter(!showFilter)}
                            className="flex items-center"
                        >
                            Filter Slots 
                            {showFilter ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                        </Button>
                    </div>

                    {/* Filter Box */}
                    {showFilter && (
                        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                            <div>
                                <label className="block mb-2">Filter by Date:</label>
                                <input 
                                    type="date" 
                                    value={dateFilter} 
                                    onChange={(e) => setDateFilter(e.target.value)} 
                                    className="border rounded p-2 mb-4 w-full"
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Filter by Time:</label>
                                <input 
                                    type="text" 
                                    value={timeFilter} 
                                    onChange={(e) => setTimeFilter(e.target.value)} 
                                    className="border rounded p-2 w-full" 
                                    placeholder="Enter time range (e.g., 10:00 AM)"
                                />
                            </div>
                        </div>
                    )}

                    {/* Available slots */}
                    {filteredSlots.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredSlots.map(slot => (
                                <div
                                    key={slot.id}
                                    className={`p-4 border rounded-lg ${selectedSlot?.id === slot.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                    onClick={() => setSelectedSlot(slot)}
                                >
                                    <h5 className="text-lg font-semibold">{formatSlot(slot).date}</h5>
                                    <p className="text-gray-700">{formatSlot(slot).timeRange}</p>
                                    {selectedSlot?.id === slot.id && <FaCheck className="text-green-500 mt-2" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Typography variant="body2" className="text-center">No available slots.</Typography>
                    )}

                    {/* Payment Method */}
                    <div className="mt-6">
                        <Typography variant="h6" className="font-bold mb-4">Select Payment Method</Typography>
                        <div className="flex items-center space-x-6">
                            <Radio 
                                name="paymentMethod" 
                                label="Razorpay" 
                                value="razorpay" 
                                checked={paymentMethod === 'razorpay'} 
                                onChange={() => handlePaymentMethodChange('razorpay')} 
                            />
                            <Radio 
                                name="paymentMethod" 
                                label="Wallet" 
                                value="wallet" 
                                checked={paymentMethod === 'wallet'} 
                                onChange={() => handlePaymentMethodChange('wallet')} 
                            />
                        </div>
                    </div>

                    {/* Book Now Button */}
                    <div className="mt-6 flex justify-center">
                        <Button onClick={handleBookNow} disabled={!selectedSlot}>
                            <FaCreditCard className="mr-2" />
                            Book Now
                        </Button>
                    </div>

                    {/* Payment Success Message */}
                    {paymentSuccess && <PaymentSuccessMessage />}
                </div>
            </div>
        </div>
    );
}

export default DoctorDetails;
