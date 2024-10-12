import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "../../Components/Admin/AdminSidebar";  // Sidebar component

const SalesReport = () => {
    const [bookings, setBookings] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const baseURL = 'http://127.0.0.1:8000';
    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    // Redirect to login if token is missing
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Fetch sales report
    const fetchSalesReport = async (date) => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseURL}/api/admin/admin/sales_report/`, {
                params: { date },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBookings(response.data.bookings);
            setTotalAmount(response.data.total_amount || 0);
            setLoading(false);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Unauthorized access. Please log in again.');
                navigate('/login');
            } else {
                setError('Failed to fetch sales report. Please try again.');
            }
            setLoading(false);
        }
    };

    // Fetch sales report on date change or initial load
    useEffect(() => {
        if (token) {
            fetchSalesReport(selectedDate);
        }
    }, [selectedDate, token]);

    // Handle date change
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className="flex flex-row min-h-screen bg-gray-100 text-gray-800">
            <AdminSidebar />  {/* Sidebar */}
            <main className="flex-grow p-6">
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">Sales Report</h2>

                {/* Date picker */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full md:w-1/4 border border-gray-300 rounded-lg p-2 shadow-sm"
                    />
                </div>

                {/* Loading spinner */}
                {loading && <p className="text-blue-500">Loading...</p>}

                {/* Error display */}
                {error && <p className="text-red-500">{error}</p>}

                {/* Total amount */}
                {!loading && bookings.length > 0 && (
                    <div className="p-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Total Amount: ₹{totalAmount}</h3>
                    </div>
                )}

                {/* Table for medium and large screens */}
                {!loading && bookings.length > 0 && (
                    <div className="bg-white shadow-md rounded-lg overflow-x-auto hidden md:block">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slot Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Type</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking?.user?.username || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking?.doctor?.first_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {booking?.slots?.start_time ? new Date(booking.slots.start_time).toLocaleString() : 'N/A'} - 
                                            {booking?.slots?.end_time ? new Date(booking.slots.end_time).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{booking?.slots?.amount || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.transaction_type || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Responsive card layout for small screens */}
                {!loading && bookings.length > 0 && (
                    <div className="md:hidden">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="border-b border-gray-300 p-4 flex flex-col hover:bg-gray-50">
                                <div className="font-semibold">User: {booking?.user?.username || 'N/A'}</div>
                                <div>Doctor: {booking?.doctor?.first_name || 'N/A'}</div>
                                <div>Slot Time: {booking?.slots?.start_time ? new Date(booking.slots.start_time).toLocaleString() : 'N/A'} - {booking?.slots?.end_time ? new Date(booking.slots.end_time).toLocaleString() : 'N/A'}</div>
                                <div>Amount: ₹{booking?.slots?.amount || 'N/A'}</div>
                                <div>Transaction Type: {booking.transaction_type || 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No bookings found */}
                {!loading && bookings.length === 0 && <p className="text-gray-500">No bookings found for the selected date.</p>}
            </main>
        </div>
    );
};

export default SalesReport;

