import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const token = localStorage.getItem('access');
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(`${baseURL}/api/doctors/doctor/booking_detail/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                
                setBooking(response.data);
                console.log('Booking details fetched successfully:', response.data);
            } catch (error) {
                console.error('Error fetching booking details:', error);
                setError('Failed to load booking details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id && token) {
            fetchBookingDetails();
        } else {
            setError('Missing booking ID or authentication token.');
            setLoading(false);
        }
    }, [id, token, baseURL]);

    const handleBackToBookings = () => {
        navigate('/doctor/Bookings/bookings'); // fixed with leading slash// Adjust this path according to your routing structure
    };

    const getStatusColor = (status) => {
        const statusColors = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            default: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return statusColors[status] || statusColors.default;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            })
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleBackToBookings}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">No Booking Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find the booking details you're looking for.</p>
                    <button
                        onClick={handleBackToBookings}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    const startDateTime = formatDateTime(booking.slots.start_time);
    const endDateTime = formatDateTime(booking.slots.end_time);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleBackToBookings}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition duration-200 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Bookings
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                    <p className="text-gray-600 mt-1">Booking ID: #{booking.id}</p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Status Banner */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">Appointment Information</h2>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Doctor Information */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Doctor</h3>
                                <p className="text-xl font-semibold text-gray-900 mt-1">
                                    Dr. {booking.doctor.first_name} {booking.doctor.last_name || ''}
                                </p>
                                {booking.doctor.specialization && (
                                    <p className="text-gray-600 mt-1">{booking.doctor.specialization}</p>
                                )}
                            </div>
                        </div>

                        {/* Patient Information */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Patient</h3>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{booking.user.username}</p>
                                {booking.user.email && (
                                    <p className="text-gray-600 mt-1">{booking.user.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Appointment Time */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Appointment Schedule</h3>
                                    <div className="mt-2 space-y-2">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">{startDateTime.date}</p>
                                            <p className="text-gray-600">
                                                {startDateTime.time} - {endDateTime.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        {booking.notes && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
                                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{booking.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Booking created on {new Date(booking.created_at || booking.slots.start_time).toLocaleDateString()}
                            </p>
                            <button
                                onClick={handleBackToBookings}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Back to All Bookings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingDetails;