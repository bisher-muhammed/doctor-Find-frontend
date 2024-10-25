import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardBody, Typography, Button, Spinner } from "@material-tailwind/react";
import { FaUserMd, FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import moment from 'moment';
import User_Navbar from '../../Components/Users/User_Navbar';
import PaymentSuccessMessage from '../../Components/Users/PaymentSuccessMessage';


function DoctorDetails() {
    const authentication_user = useSelector(state => state.authUser);
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(''); // Track selected payment method
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const token = localStorage.getItem('access');
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const baseURL = 'http://127.0.0.1:8000';

    // Filter states
    const [showFilter, setShowFilter] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');
    const [filteredSlots, setFilteredSlots] = useState([]);

    // Format slot time for display
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
        handleBookNow(method); // Call the bookNow function once the method is selected
    };

    // Handle booking confirmation and payment
    const handleBookNow = async (method) => {
        if (!selectedSlot) {
            alert("Please select a slot before booking.");
            return;
        }

        try {
            const response = await axios.post(`${baseURL}/api/users/book-slot/${doctorId}/${selectedSlot.id}/`, {
                payment_method: method,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { razorpay_order_id, razorpay_key_id, amount, currency, booking_id } = response.data;

            if (method === 'razorpay') {
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
                            setShowModal(true);
                            setTimeout(() => { navigate('/appointments'); }, 3000);
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            alert("Payment verification failed. Please try again.");
                        }
                    },
                    theme: { color: "#3399cc" },
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else if (method === 'wallet') {
                await axios.post(`${baseURL}/api/users/wallet_payment/`, { booking_id }, { headers: { Authorization: `Bearer ${token}` } });
                setPaymentSuccess(true);
                setShowModal(true);
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
                                    placeholder="E.g., 10:00 AM - 11:00 AM" 
                                    value={timeFilter} 
                                    onChange={(e) => setTimeFilter(e.target.value)} 
                                    className="border rounded p-2 w-full"
                                />
                            </div>
                        </div>
                    )}


{filteredSlots.length > 0 ? (
    filteredSlots.map(slot => (
        <div 
            key={slot.id} 
            className={`p-4 border rounded-lg mb-4 ${selectedSlot?.id === slot.id ? 'border-blue-500 bg-blue-100 shadow-lg' : 'border-gray-300 bg-white'}`}
            onClick={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)} // Toggle selected slot
        >
            <div className="flex justify-between">
                <Typography variant="subtitle1" className="font-semibold text-gray-700">Date: {formatSlot(slot).date}</Typography>
                <Typography variant="subtitle1" className="font-semibold text-gray-700">Time: {formatSlot(slot).timeRange}</Typography>
            </div>

            {/* Render Payment Buttons directly under the selected slot */}
            {selectedSlot?.id === slot.id && (
                <div className="mt-4 space-x-4 flex justify-center">
                    <Button 
                        className={`bg-green-500 text-white hover:bg-green-600 transition duration-150`} 
                        onClick={() => handlePaymentMethodChange('razorpay')}
                    >
                        Razorpay
                    </Button>
                    <Button 
                        className={`bg-blue-500 text-white hover:bg-blue-600 transition duration-150`} 
                        onClick={() => handlePaymentMethodChange('wallet')}
                    >
                        Wallet
                    </Button>
                </div>
            )}
        </div>
    ))
) : (
    <Typography align="center" className="mt-6">No slots available for the selected filters.</Typography>
)}

</div>
</div>


{paymentSuccess && (
    <PaymentSuccessMessage showModal={showModal} setShowModal={setShowModal} />
)}

        </div>
    );
}

export default DoctorDetails;
