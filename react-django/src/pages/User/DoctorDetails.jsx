import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Badge,
} from "@material-tailwind/react";
import {
  FaUserMd,
  FaEnvelope,
  FaClock,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaWallet,
  FaCreditCard,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaStar,
  FaRegClock,
} from 'react-icons/fa';
import { MdVerified, MdAccessTime, MdPayment } from 'react-icons/md';
import axios from 'axios';
import moment from 'moment';
import User_Navbar from '../../Components/Users/User_Navbar';
import PaymentSuccessMessage from '../../Components/Users/PaymentSuccessMessage';

const DoctorDetails = () => {
  const authentication_user = useSelector(state => state.authUser);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slotsData, setSlotsData] = useState({});
  const [isBooking, setIsBooking] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  
  // New state for wallet balance error
  const [showBalanceError, setShowBalanceError] = useState(false);
  const [balanceErrorMessage, setBalanceErrorMessage] = useState('');

  const token = localStorage.getItem('access');
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!authentication_user.isAuthenticated) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        
        // Fetch doctor details first
        const doctorResponse = await axios.get(
          `${baseURL}/api/users/available_slots/${doctorId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setDoctorDetails(doctorResponse.data);
        
        // Organize slots by date for better filtering
        const slotsGroupedByDate = {};
        doctorResponse.data.slots?.forEach(slot => {
          const dateKey = moment(slot.start_time).format('YYYY-MM-DD');
          if (!slotsGroupedByDate[dateKey]) {
            slotsGroupedByDate[dateKey] = [];
          }
          slotsGroupedByDate[dateKey].push(slot);
        });
        setSlotsData(slotsGroupedByDate);
        
      } catch (error) {
        setError(error.response?.data || 'Error loading doctor details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [doctorId, token, authentication_user, navigate]);

  // ✅ CORRECT: Single useEffect for wallet balance - REMOVED DUPLICATE
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setWalletLoading(true);
        const walletResponse = await axios.get(
          `${baseURL}/api/users/wallet_view/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Wallet API Response:', walletResponse.data); // Debug log
        
        // Based on your API response structure
        if (walletResponse.data && walletResponse.data.wallet) {
          const balance = parseFloat(walletResponse.data.wallet.balance);
          console.log('Wallet balance found:', balance);
          setWalletBalance(balance);
        } else {
          console.warn('Wallet data not found in response:', walletResponse.data);
          setWalletBalance(0);
        }
        
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        console.error('Error response:', error.response?.data);
        setWalletBalance(0); // Set default balance on error
      } finally {
        setWalletLoading(false);
      }
    };

    if (authentication_user.isAuthenticated) {
      fetchWalletBalance();
    }
  }, [authentication_user, token, baseURL]);

  useEffect(() => {
    const dateKey = moment(selectedDate).format('YYYY-MM-DD');
    setAvailableSlots(slotsData[dateKey] || []);
    setSelectedSlot(null); // Clear selected slot when date changes
  }, [selectedDate, slotsData]);

  // Rest of your component remains the same...
  // Check if a date has available slots
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = moment(date).format('YYYY-MM-DD');
      const slots = slotsData[dateKey];
      if (slots && slots.length > 0) {
        return (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
          </div>
        );
      }
    }
    return null;
  };

  // Disable dates without slots
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = moment(date).format('YYYY-MM-DD');
      const isPast = moment(date).isBefore(moment(), 'day');
      return isPast || !slotsData[dateKey];
    }
    return false;
  };

  const handlePaymentMethodChange = async (method) => {
    if (!selectedSlot) {
      alert("Please select a slot before booking.");
      return;
    }

    // Check wallet balance for wallet payments
    if (method === 'wallet' && walletBalance !== null) {
      const slotAmount = parseFloat(selectedSlot.amount) || 0;
      if (slotAmount > walletBalance) {
        setBalanceErrorMessage(`Insufficient wallet balance. Required: ₹${slotAmount}, Available: ₹${walletBalance}`);
        setShowBalanceError(true);
        return;
      }
    }

    setIsBooking(true);
    try {
      const response = await axios.post(
        `${baseURL}/api/users/book-slot/${doctorId}/${selectedSlot.id}/`,
        { payment_method: method },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { razorpay_order_id, razorpay_key_id, amount, currency, booking_id } = response.data;

      if (method === 'razorpay') {
        const options = {
          key: razorpay_key_id,
          amount,
          currency,
          name: "MediCare Appointment",
          description: `Appointment with Dr. ${doctorDetails?.doctor?.username}`,
          order_id: razorpay_order_id,
          handler: async (response) => {
            try {
              await axios.post(
                `${baseURL}/api/users/verify-payment/`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  booking_id
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setPaymentSuccess(true);
              setShowModal(true);
              setTimeout(() => navigate('/appointments'), 3000);
            } catch (error) {
              console.error('Payment verification failed:', error);
              alert("Payment verification failed. Please try again.");
            }
          },
          prefill: {
            name: authentication_user.user?.username || '',
            email: authentication_user.user?.email || '',
          },
          theme: {
            color: "#2563eb"
          },
          modal: {
            ondismiss: function() {
              setIsBooking(false);
            }
          }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else if (method === 'wallet') {
        await axios.post(
          `${baseURL}/api/users/wallet_payment/`,
          { booking_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPaymentSuccess(true);
        setShowModal(true);
        // Update wallet balance after successful payment
        const newBalance = walletBalance - (parseFloat(selectedSlot.amount) || 0);
        setWalletBalance(newBalance);
        setTimeout(() => navigate('/appointments'), 5000);
      }
    } catch (error) {
      console.error('Error booking the slot:', error);
      
      // Check if it's a wallet balance error
     if (error.response?.data?.error === "Insufficient wallet balance.") {
        setBalanceErrorMessage(
          `Insufficient wallet balance. Required: ₹${slotAmount}, Available: ₹${walletBalance}`
        );
        setShowBalanceError(true);

      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Error booking the slot. Please try again.";
        alert(errorMessage);
      }
    } finally {
      setIsBooking(false);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = moment(currentMonth).add(direction, 'month').toDate();
    setCurrentMonth(newMonth);
  };

  const handleCloseBalanceError = () => {
    setShowBalanceError(false);
    setBalanceErrorMessage('');
  };

  const getNextAvailableDates = () => {
    const dates = [];
    let currentDate = moment();
    
    for (let i = 0; i < 7 && dates.length < 3; i++) {
      const dateKey = currentDate.format('YYYY-MM-DD');
      if (slotsData[dateKey] && slotsData[dateKey].length > 0) {
        dates.push({
          date: currentDate.toDate(),
          slots: slotsData[dateKey].length
        });
      }
      currentDate = currentDate.add(1, 'day');
    }
    return dates;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Spinner className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-100"></div>
        </div>
        <Typography variant="h5" className="text-gray-700 mb-2">Loading Doctor Details</Typography>
        <Typography className="text-gray-500">Please wait while we prepare your booking experience</Typography>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <Typography variant="h5" color="red" className="mb-4">Unable to Load Details</Typography>
          <Typography className="text-gray-600 mb-6">{error}</Typography>
          <div className="flex space-x-3">
            <Button onClick={() => window.location.reload()} className="bg-blue-600 flex-1">
              Try Again
            </Button>
            <Button onClick={() => navigate('/doctors')} variant="outlined" className="flex-1">
              Back to Doctors
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const quickDates = getNextAvailableDates();
  const slotAmount = selectedSlot ? parseFloat(selectedSlot.amount) || 0 : 0;
  const isWalletSufficient = walletBalance !== null && slotAmount <= walletBalance;

  return (
    <div className="min-h-screen bg-gray-50">
      <User_Navbar />
      
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <button 
              onClick={() => navigate('/doctors')}
              className="flex items-center space-x-2 text-blue-100 hover:text-white mb-6 transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
              <span>Back to Doctors</span>
            </button>
            <Typography variant="h1" className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Appointment
            </Typography>
            <Typography className="text-blue-100 text-xl max-w-2xl">
              Schedule a consultation with {doctorDetails?.doctor?.username}, {doctorDetails?.doctor?.specification}
            </Typography>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 -mt-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Enhanced Doctor Profile Card */}
          <div className="xl:col-span-1">
            <Card className="shadow-xl border-0 overflow-hidden sticky top-8 transition-all duration-300 hover:shadow-2xl">
              <div className="relative">
                <CardHeader floated={false} className="h-72 relative overflow-hidden bg-gradient-to-b from-slate-400 to-red-100">
                  <img 
                    src={`${baseURL}${doctorDetails?.doctor?.profile_pic}`} 
                    alt={doctorDetails?.doctor?.username} 
                    className="w-full h-full object-cover mix-blend-overlay opacity-90" 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face';
                    }}
                  />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full flex items-center space-x-1 shadow-lg">
                    <MdVerified className="w-4 h-4" />
                    <span className="text-sm font-semibold">Verified</span>
                  </div>
                </CardHeader>
              </div>

              <CardBody className="p-6">
                <div className="text-center mb-6">
                  <Typography variant="h3" className="font-bold text-gray-900 mb-2">
                    Dr. {doctorDetails?.doctor?.username}
                  </Typography>
                  <Chip 
                    value={doctorDetails?.doctor?.specification}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold py-2 px-4"
                  />
                </div>

                {/* Enhanced Doctor Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaUserMd className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <Typography className="text-sm text-gray-600 font-medium">Experience</Typography>
                      <Typography className="font-semibold text-gray-800 text-lg">{doctorDetails?.doctor?.experience} years</Typography>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <FaEnvelope className="text-gray-600 text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography className="text-sm text-gray-600 font-medium">Email</Typography>
                      <Typography className="font-semibold text-gray-800 truncate">{doctorDetails?.doctor?.email}</Typography>
                    </div>
                  </div>

                  {doctorDetails?.doctor?.location && (
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <FaMapMarkerAlt className="text-green-600 text-lg" />
                      </div>
                      <div>
                        <Typography className="text-sm text-gray-600 font-medium">Location</Typography>
                        <Typography className="font-semibold text-gray-800">{doctorDetails?.doctor?.location}</Typography>
                      </div>
                    </div>
                  )}

                  {/* Wallet Balance Section */}
                  <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <FaWallet className="text-amber-600 text-lg" />
                    </div>
                    <div>
                      <Typography className="text-sm text-gray-600 font-medium">Wallet Balance</Typography>
                      {walletLoading ? (
                        <div className="flex items-center space-x-2">
                          <Spinner className="h-4 w-4" />
                          <Typography className="text-sm text-gray-500">Loading balance...</Typography>
                        </div>
                      ) : walletBalance !== null ? (
                        <Typography className="font-semibold text-gray-800 text-lg">
                          ₹{walletBalance.toFixed(2)}
                        </Typography>
                      ) : (
                        <Typography className="text-sm text-red-500">Unable to load balance</Typography>
                      )}
                    </div>
                  </div>
                </div>

                {doctorDetails?.doctor?.bio && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <Typography className="text-sm text-gray-600 font-medium mb-2">About Doctor</Typography>
                    <Typography className="text-gray-700 leading-relaxed text-sm">{doctorDetails?.doctor?.bio}</Typography>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Quick Dates Card */}
            {quickDates.length > 0 && (
              <Card className="mt-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
                <CardBody className="p-6">
                  <Typography variant="h5" className="font-bold text-gray-800 mb-4 flex items-center">
                    <FaRegClock className="mr-2 text-green-600" />
                    Quick Book
                  </Typography>
                  <Typography className="text-gray-600 text-sm mb-4">
                    Next available dates:
                  </Typography>
                  <div className="space-y-3">
                    {quickDates.map((quickDate, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(quickDate.date)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          moment(selectedDate).isSame(quickDate.date, 'day')
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <Typography className="font-semibold text-gray-800">
                              {moment(quickDate.date).format('MMM DD')}
                            </Typography>
                            <Typography className="text-gray-600 text-sm">
                              {moment(quickDate.date).format('ddd')}
                            </Typography>
                          </div>
                          <Badge color="green" className="text-xs">
                            {quickDate.slots} slots
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Enhanced Booking Section */}
          <div className="xl:col-span-2">
            <Card className="shadow-xl border-0">
              <CardBody className="p-8">
                
                {/* Enhanced Calendar Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <FaCalendarAlt className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-800">Select Date</Typography>
                        <Typography className="text-gray-600">Choose your preferred appointment date</Typography>
                      </div>
                    </div>
                    <Chip 
                      value={moment(selectedDate).format('MMMM YYYY')}
                      className="bg-blue-100 text-blue-800 font-semibold"
                    />
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    {/* Custom Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        size="sm"
                        variant="text"
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                        onClick={() => navigateMonth(-1)}
                      >
                        <FaChevronLeft className="w-4 h-4" />
                        <span className="font-medium">Prev</span>
                      </Button>
                      
                      <Typography variant="h5" className="font-bold text-gray-800">
                        {moment(currentMonth).format('MMMM YYYY')}
                      </Typography>
                      
                      <Button
                        size="sm"
                        variant="text"
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                        onClick={() => navigateMonth(1)}
                      >
                        <span className="font-medium">Next</span>
                        <FaChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6 mb-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-600">Unavailable</span>
                      </div>
                    </div>

                    <Calendar 
                      onChange={setSelectedDate} 
                      value={selectedDate}
                      activeStartDate={currentMonth}
                      onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
                      tileContent={tileContent}
                      tileDisabled={tileDisabled}
                      className="w-full custom-calendar"
                    />
                  </div>
                </div>

                {/* Enhanced Time Slots */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 p-3 rounded-xl">
                        <FaClock className="text-indigo-600 text-xl" />
                      </div>
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-800">Available Time Slots</Typography>
                        <Typography className="text-gray-600">
                          {moment(selectedDate).format('dddd, MMMM DD, YYYY')}
                        </Typography>
                      </div>
                    </div>
                    {availableSlots.length > 0 && (
                      <Chip 
                        value={`${availableSlots.length} slots available`}
                        className="bg-green-100 text-green-800 font-semibold"
                      />
                    )}
                  </div>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={isBooking}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            selectedSlot?.id === slot.id 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105 border-blue-600' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                          } ${isBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold">
                              {moment(slot.start_time).format('h:mm A')}
                            </div>
                            <div className="text-sm opacity-75">
                              to {moment(slot.end_time).format('h:mm A')}
                            </div>
                            {selectedSlot?.id === slot.id && (
                              <div className="mt-2">
                                <div className="inline-flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                                  <FaCheckCircle className="w-3 h-3" />
                                  <span>Selected</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <FaClock className="text-gray-400 text-2xl" />
                      </div>
                      <Typography variant="h5" className="text-gray-500 mb-2">No slots available</Typography>
                      <Typography className="text-gray-400">Please select a different date to see available time slots</Typography>
                    </div>
                  )}
                </div>

                {/* Enhanced Payment Section */}
                {selectedSlot && (
                  <div className="border-t-2 border-gray-100 pt-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-green-100 p-3 rounded-xl">
                        <MdPayment className="text-green-600 text-2xl" />
                      </div>
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-800">Complete Booking</Typography>
                        <Typography className="text-gray-600">Secure your appointment with payment</Typography>
                      </div>
                    </div>

                    {/* Enhanced Booking Summary */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                      <Typography variant="h5" className="font-bold text-gray-800 mb-4 flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Appointment Summary
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Doctor:</span>
                            <span className="font-semibold text-gray-800">Dr. {doctorDetails?.doctor?.username}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Specialization:</span>
                            <span className="font-semibold text-gray-800">{doctorDetails?.doctor?.specification}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold text-gray-800">{moment(selectedDate).format('MMM DD, YYYY')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-semibold text-gray-800">
                              {moment(selectedSlot.start_time).format('h:mm A')} - {moment(selectedSlot.end_time).format('h:mm A')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t pt-4 mt-4">
                        <span className="text-gray-600 font-semibold text-lg">Consultation Fee:</span>
                        <span className="font-bold text-2xl text-blue-600">{formatCurrency(selectedSlot.amount)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        disabled={isBooking}
                        className={`group relative overflow-hidden py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                          isBooking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
                        }`}
                        onClick={() => handlePaymentMethodChange('razorpay')}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-700 group-hover:to-blue-800"></div>
                        <div className="relative flex items-center justify-center space-x-3">
                          <FaCreditCard className="w-5 h-5" />
                          <span>Pay with Razorpay</span>
                        </div>
                        {isBooking && <Spinner className="absolute right-4 w-5 h-5" />}
                      </Button>

                      <Button 
                      disabled={isBooking || !isWalletSufficient}
                      className={`group relative overflow-hidden py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                        (isBooking || !isWalletSufficient) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
                      }`}
                      onClick={() => handlePaymentMethodChange('wallet')}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${
                        !isWalletSufficient 
                          ? 'from-gray-400 to-gray-500' 
                          : 'from-green-600 to-green-700 group-hover:from-green-700 group-hover:to-green-800'
                      }`}></div>
                      <div className="relative flex items-center justify-center space-x-3">
                        <FaWallet className="w-5 h-5" />
                        <span>
                          {!isWalletSufficient 
                            ? `Insufficient - ₹${walletBalance.toFixed(2)}` 
                            : 'Pay with Wallet'
                          }
                        </span>
                      </div>
                      {isBooking && <Spinner className="absolute right-4 w-5 h-5" />}
                    </Button>
                    </div>

                    {walletBalance !== null && selectedSlot.amount && (
                      <div className="mt-4 text-center">
                        <Typography className={`text-sm ${
                          isWalletSufficient ? 'text-gray-600' : 'text-red-600 font-semibold'
                        }`}>
                          Wallet Balance: <span className="font-semibold">₹{walletBalance.toFixed(2)}</span>
                          {!isWalletSufficient && (
                            <span className="ml-2">
                              (Required: ₹{parseFloat(selectedSlot.amount).toFixed(2)})
                            </span>
                          )}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Insufficient Balance Error Dialog */}
      <Dialog 
        open={showBalanceError} 
        handler={handleCloseBalanceError}
        className="relative max-w-md"
      >
        <DialogHeader className="flex items-center space-x-3 pb-4 border-b border-gray-200">
          <div className="bg-red-100 p-3 rounded-full">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div>
            <Typography variant="h4" className="text-gray-800 font-bold">
              Insufficient Balance
            </Typography>
          </div>
        </DialogHeader>
        
        <DialogBody className="pt-6 pb-6">
          <div className="text-center">
            <Typography className="text-gray-700 text-lg mb-4 font-medium">
              {balanceErrorMessage}
            </Typography>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Typography className="text-red-800 text-sm">
                Your wallet balance is insufficient for this appointment.
              </Typography>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Typography className="text-blue-800 text-sm font-medium mb-2">
                💡 Recommended Action:
              </Typography>
              <Typography className="text-blue-700 text-sm">
                Please use the Razorpay payment option to complete your booking securely.
              </Typography>
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter className="pt-0">
          <Button
            variant="text"
            color="gray"
            onClick={handleCloseBalanceError}
            className="mr-3"
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600"
            onClick={() => {
              handleCloseBalanceError();
              handlePaymentMethodChange('razorpay');
            }}
          >
            Use Razorpay
          </Button>
        </DialogFooter>
      </Dialog>

      {paymentSuccess && (
        <PaymentSuccessMessage 
          onClose={() => {
            setShowModal(false);
            navigate('/appointments');
          }}
          doctorName={doctorDetails?.doctor?.username}
          appointmentDate={moment(selectedDate).format('MMMM DD, YYYY')}
          appointmentTime={selectedSlot ? `${moment(selectedSlot.start_time).format('h:mm A')} - ${moment(selectedSlot.end_time).format('h:mm A')}` : ''}
          bookingId={selectedSlot?.id}
        />
      )}

      <style jsx>{`
        .custom-calendar :global(.react-calendar) {
          border: none;
          background: transparent;
        }
        .custom-calendar :global(.react-calendar__navigation) {
          display: none;
        }
        .custom-calendar :global(.react-calendar__tile) {
          padding: 1rem;
          border-radius: 0.75rem;
          margin: 2px;
          transition: all 0.2s;
        }
        .custom-calendar :global(.react-calendar__tile:hover) {
          background-color: #dbeafe;
        }
        .custom-calendar :global(.react-calendar__tile--active) {
          background-color: #2563eb;
          color: white;
        }
        .custom-calendar :global(.react-calendar__tile:disabled) {
          background-color: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default DoctorDetails;
