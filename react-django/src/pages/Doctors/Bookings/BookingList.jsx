import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import Header from '../../../Components/Doctors/Header';

function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState({});
    const navigate = useNavigate();
    


    // Updated formatSlot function
    const formatSlot = (slot) => {
        if (!slot.start_time || !slot.end_time) {
            console.error('Invalid slot time:', slot);
            return { date: 'Invalid Date', timeRange: 'Invalid Time' };
        }

        // Convert to UTC moment objects and format
        const start = moment(slot.start_time).utc();
        const end = moment(slot.end_time).utc();

        const formattedDate = start.format('YYYY-MM-DD');
        const formattedStart = start.format('h:mm A');
        const formattedEnd = end.format('h:mm A');

        return {
            date: formattedDate,
            timeRange: `${formattedStart} - ${formattedEnd}`,
        };
    };

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
                if (error.response && error.response.status === 401) {
                    toast.error('Session expired. Please log in again.');
                    navigate('/doctor/login');
                } else {
                    setError(error.message);
                    toast.error('Failed to load bookings');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [navigate]);

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/doctors/bookings/${bookingId}/update/`, { status: newStatus }, {
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

    if (loading) {
        return <div>Loading bookings...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <Header />
            <h1 className="text-2xl mb-4">Your Bookings</h1>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Range</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => {
                            // Check if booking and its properties are defined
                            const doctorUsername = booking.user?.username || 'N/A';
                            const userUsername = booking.user?.username || 'N/A';
                            const { date, timeRange } = formatSlot(booking.slots || {});

                            return (
                                <tr key={booking.id}>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">{userUsername}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{timeRange}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{booking.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={statusUpdate[booking.id] || booking.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                setStatusUpdate((prev) => ({ ...prev, [booking.id]: newStatus }));
                                                handleStatusChange(booking.id, newStatus);
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BookingList;
