import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState({});
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const bookingsPerPage = 8; // Number of bookings per page
    const navigate = useNavigate();

    // Function to format slot details
    const formatSlot = (slot) => {
        if (!slot.start_time || !slot.end_time) {
            return { date: 'Invalid Date', timeRange: 'Invalid Time' };
        }

        const start = moment(slot.start_time);
        const end = moment(slot.end_time);

        return {
            date: start.format('YYYY-MM-DD'),
            timeRange: `${start.format('h:mm A')} - ${end.format('h:mm A')}`,
        };
    };

    // Fetch bookings from API
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/doctors/doctor/bookings/", {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                setBookings(response.data);
            } catch (error) {
                handleFetchError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [navigate]);

    // Handle fetch error
    const handleFetchError = (error) => {
        if (error.response && error.response.status === 401) {
            toast.error('Session expired. Please log in again.');
            navigate('/doctor/login');
        } else {
            setError(error.message);
            toast.error('Failed to load bookings');
        }
    };

    // Handle status change for bookings
    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/doctors/bookings/${bookingId}/update/`, 
                { status: newStatus }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === bookingId ? { ...booking, status: newStatus } : booking
                )
            );
            toast.success('Booking status updated successfully');
        } catch (error) {
            toast.error('Failed to update booking status');
        }
    };

    // Pagination logic
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(bookings.length / bookingsPerPage);

    // Change page function
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Loading and error handling
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><span className="text-xl">Loading bookings...</span></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Your Bookings</h1>
            {bookings.length === 0 ? (
                <p className="text-center">No bookings found.</p>
            ) : (
                <>
                    {/* Mobile View */}
                    <div className="md:hidden">
                        {currentBookings.map((booking) => {
                            const userUsername = booking.user?.username || 'N/A';
                            const { date, timeRange } = formatSlot(booking.slots || {});

                            return (
                                <div key={booking.id} className="border border-gray-300 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
                                    <div className="font-semibold">{userUsername}</div>
                                    <div>{date}</div>
                                    <div>{timeRange}</div>
                                    <div className={`font-semibold ${booking.status === 'pending' ? 'text-yellow-600' : booking.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                                        {booking.status}
                                    </div>
                                    <div className="mt-2">
                                        <select
                                            value={statusUpdate[booking.id] || booking.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                setStatusUpdate((prev) => ({ ...prev, [booking.id]: newStatus }));
                                                handleStatusChange(booking.id, newStatus);
                                            }}
                                            className="border border-gray-300 rounded-md p-1 focus:outline-none focus:ring focus:ring-blue-300"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <Link to={`/doctor/Bookings/booking_details/${booking.id}`} className="text-blue-500 hover:underline mt-2 block">
                                        View Full Details
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop/Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Range</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentBookings.map((booking) => {
                                    const userUsername = booking.user?.username || 'N/A';
                                    const { date, timeRange } = formatSlot(booking.slots || {});

                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-100 transition duration-200">
                                            <td className="px-4 py-4 whitespace-nowrap">{userUsername}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">{date}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">{timeRange}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`font-semibold ${booking.status === 'pending' ? 'text-yellow-600' : booking.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">{new Date(booking.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <select
                                                    value={statusUpdate[booking.id] || booking.status}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        setStatusUpdate((prev) => ({ ...prev, [booking.id]: newStatus }));
                                                        handleStatusChange(booking.id, newStatus);
                                                    }}
                                                    className="border border-gray-300 rounded-md p-1 focus:outline-none focus:ring focus:ring-blue-300"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <Link to={`/doctor/Bookings/booking_details/${booking.id}`} className="text-blue-500 hover:underline">
                                                    View Full Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination controls */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 text-gray-600 rounded-l-md hover:bg-gray-300"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={`px-3 py-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-gray-300`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-200 text-gray-600 rounded-r-md hover:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default BookingList;

