import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function BookingDetails() {
    const { id } = useParams(); // Capture the booking ID from the URL
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('access');
    const baseURL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/doctors/doctor/booking_detail/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                setBooking(response.data);
                console.log(response.data)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching booking details:', error);
                setLoading(false);
            }
        };
        fetchBookingDetails();
    }, [id]); // Run this effect when `id` changes

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!booking) {
        return <div>No booking details found.</div>;
    }

    return (
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Booking Details for ID: {booking.id}</h1>
            <div className="space-y-4">
                <p className="text-lg text-gray-600"><span className="font-semibold">Doctor:</span> Dr. {booking.doctor.first_name}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Patient:</span> {booking.user.username}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Slot Start Time:</span> {new Date(booking.slots.start_time).toLocaleString()}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Slot End Time:</span> {new Date(booking.slots.end_time).toLocaleString()}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded ${booking.status === 'completed' ? 'bg-green-500 text-white' : booking.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>{booking.status}</span></p>
            </div>
        </div>
    );
}
export default BookingDetails;
