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
} from "@material-tailwind/react";
import {
  FaUserMd,
  FaEnvelope,
  FaClock,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from 'react-icons/fa';
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
        const response = await axios.get(
          `${baseURL}/api/users/available_slots/${doctorId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDoctorDetails(response.data);
        
        // Organize slots by date for better filtering
        const slotsGroupedByDate = {};
        response.data.slots?.forEach(slot => {
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

  useEffect(() => {
    const dateKey = moment(selectedDate).format('YYYY-MM-DD');
    setAvailableSlots(slotsData[dateKey] || []);
    setSelectedSlot(null); // Clear selected slot when date changes
  }, [selectedDate, slotsData]);

  // Check if a date has available slots
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = moment(date).format('YYYY-MM-DD');
      const slots = slotsData[dateKey];
      if (slots && slots.length > 0) {
        return (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
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
    setPaymentMethod(method);
    if (!selectedSlot) {
      alert("Please select a slot before booking.");
      return;
    }

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
          name: "Doctor Appointment",
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
          theme: { color: "#3399cc" }
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
        setTimeout(() => navigate('/appointments'), 5000);
      }
    } catch (error) {
      console.error('Error booking the slot:', error);
      
      // Check if it's a wallet balance error
      if (error.response?.data?.error === "Insufficient wallet balance.") {
        setBalanceErrorMessage(error.response.data.error);
        setShowBalanceError(true);
      } else {
        // For other errors, use the existing alert
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Error booking the slot. Please try again.";
        alert(errorMessage);
      }
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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Spinner className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <Typography className="text-gray-600">Loading doctor details...</Typography>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Typography variant="h6" color="red" className="mb-4">{error}</Typography>
          <Button onClick={() => window.location.reload()} className="bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <User_Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-950 to-green-300 text-white py-16">
        <div className="container mx-auto px-6 text-center mt-5">
          <Typography variant="h2" className="mb-4 font-bold">
            Book Your Appointment
          </Typography>
          <Typography className="text-blue-100 text-lg max-w-2xl mx-auto">
            Schedule a consultation with our experienced medical professionals. Choose your preferred date and time slot.
          </Typography>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Doctor Profile Card */}
          <div className="xl:col-span-1">
            <Card className="shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-all duration-500 sticky top-8">
              <div className="relative">
                <CardHeader floated={false} className="h-64 relative overflow-hidden">
                  <img 
                    src={`${baseURL}${doctorDetails?.doctor?.profile_pic}`} 
                    alt={doctorDetails?.doctor?.username} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </CardHeader>
                
                {/* Verified Badge */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Verified</span>
                </div>
              </div>

              <CardBody className="p-6">
                <div className="text-center mb-6">
                  <Typography variant="h4" color="blue-gray" className="mb-2 font-bold">
                    Dr. {doctorDetails?.doctor?.username}
                  </Typography>
                  <Chip 
                    value={doctorDetails?.doctor?.specification}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-4"
                  />
                </div>

                {/* Doctor Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaUserMd className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <Typography className="text-sm text-gray-600 font-medium">Experience</Typography>
                      <Typography className="font-semibold text-gray-800">{doctorDetails?.doctor?.experience} years</Typography>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-xl">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <FaEnvelope className="text-indigo-600 text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography className="text-sm text-gray-600 font-medium">Email</Typography>
                      <Typography className="font-semibold text-gray-800 truncate text-sm">{doctorDetails?.doctor?.email}</Typography>
                    </div>
                  </div>

                  {doctorDetails?.doctor?.bio && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <Typography className="text-sm text-gray-600 font-medium mb-2">About</Typography>
                      <Typography className="text-gray-700 leading-relaxed text-sm">{doctorDetails?.doctor?.bio}</Typography>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="xl:col-span-2">
            <Card className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-500">
              <CardBody className="p-8">
                
                {/* Enhanced Calendar Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FaCalendarAlt className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-800">Select Date</Typography>
                        <Typography className="text-gray-600 text-sm">Choose an available appointment date</Typography>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
                    {/* Custom Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        size="sm"
                        variant="text"
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                        onClick={() => navigateMonth(-1)}
                      >
                        <FaChevronLeft />
                        <span>Previous</span>
                      </Button>
                      
                      <Typography variant="h6" className="font-semibold text-gray-800">
                        {moment(currentMonth).format('MMMM YYYY')}
                      </Typography>
                      
                      <Button
                        size="sm"
                        variant="text"
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                        onClick={() => navigateMonth(1)}
                      >
                        <span>Next</span>
                        <FaChevronRight />
                      </Button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6 mb-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-600">Not Available</span>
                      </div>
                    </div>

                    <Calendar 
                      onChange={setSelectedDate} 
                      value={selectedDate}
                      activeStartDate={currentMonth}
                      onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
                      tileContent={tileContent}
                      tileDisabled={tileDisabled}
                      className="w-full [&_.react-calendar]:border-0 [&_.react-calendar]:bg-transparent [&_.react-calendar__navigation]:hidden [&_.react-calendar__tile]:transition-all [&_.react-calendar__tile]:duration-200 [&_.react-calendar__tile]:p-4 [&_.react-calendar__tile]:rounded-lg [&_.react-calendar__tile]:margin-1 [&_.react-calendar__tile:hover]:bg-blue-100 [&_.react-calendar__tile--active]:bg-blue-600 [&_.react-calendar__tile--active]:text-white [&_.react-calendar__tile:disabled]:bg-gray-100 [&_.react-calendar__tile:disabled]:text-gray-400 [&_.react-calendar__tile:disabled]:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Enhanced Time Slots */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <FaClock className="text-indigo-600 text-xl" />
                      </div>
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-800">Available Time Slots</Typography>
                        <Typography className="text-gray-600 text-sm">
                          {moment(selectedDate).format('dddd, MMMM DD, YYYY')}
                        </Typography>
                      </div>
                    </div>
                    {availableSlots.length > 0 && (
                      <Chip 
                        value={`${availableSlots.length} slots available`}
                        className="bg-green-100 text-green-800"
                      />
                    )}
                  </div>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSlots.map(slot => (
                        <Button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 text-center rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            selectedSlot?.id === slot.id 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105' 
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                          }`}
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
                                <Chip value="Selected" size="sm" className="bg-white/20 text-white" />
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <FaClock className="text-gray-400 text-2xl" />
                      </div>
                      <Typography variant="h6" className="text-gray-500 mb-2">No slots available</Typography>
                      <Typography className="text-gray-400">Please select a different date or check back later</Typography>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                {selectedSlot && (
                  <div className="border-t-2 border-gray-100 pt-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-800">Complete Booking</Typography>
                        <Typography className="text-gray-600 text-sm">Choose your payment method</Typography>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
                      <Typography variant="h6" className="font-bold text-gray-800 mb-4">Booking Summary</Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Doctor:</span>
                            <span className="font-semibold">Dr. {doctorDetails?.doctor?.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Specialization:</span>
                            <span className="font-semibold">{doctorDetails?.doctor?.specification}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold">{moment(selectedDate).format('MMM DD, YYYY')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-semibold">
                              {moment(selectedSlot.start_time).format('h:mm A')} - {moment(selectedSlot.end_time).format('h:mm A')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between border-t pt-4 mt-4">
                        <span className="text-gray-600 font-medium">Consultation Fee:</span>
                        <span className="font-bold text-xl text-blue-600">{selectedSlot.amount}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                        onClick={() => handlePaymentMethodChange('razorpay')}
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="flex items-center justify-center space-x-3">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Pay with Razorpay</span>
                        </div>
                      </Button>

                      <Button 
                        className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                        onClick={() => handlePaymentMethodChange('wallet')}
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="flex items-center justify-center space-x-3">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 8V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1m18 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0H3M9 12h6" />
                          </svg>
                          <span>Pay with Wallet</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Insufficient Balance Error Dialog */}
      <Dialog 
        open={showBalanceError} 
        handler={handleCloseBalanceError}
        className="relative"
        size="sm"
      >
        <DialogHeader className="flex items-center space-x-3 pb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div>
            <Typography variant="h4" className="text-gray-800 font-bold">
              Payment Failed
            </Typography>
          </div>
        </DialogHeader>
        
        <DialogBody className="pt-0 pb-6">
          <div className="text-center">
            <Typography className="text-gray-700 text-lg mb-4">
              {balanceErrorMessage}
            </Typography>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Typography className="text-red-800 text-sm">
                Your wallet doesn't have sufficient balance to complete this payment. 
                choose Razorpay payment option.
              </Typography>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Typography className="text-blue-800 text-sm font-medium mb-2">
                💡 What you can do:
              </Typography>
              <ul className="text-blue-700 text-sm text-left space-y-1">
                <li>• Use Razorpay payment option instead</li>
              </ul>
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
        </DialogFooter>
      </Dialog>

      {paymentSuccess && <PaymentSuccessMessage showModal={showModal} setShowModal={setShowModal} />}
    </div>
  );
};

export default DoctorDetails;