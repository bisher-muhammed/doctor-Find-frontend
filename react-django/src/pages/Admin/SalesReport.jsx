import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const SalesReport = () => {
    const [bookings, setBookings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [walletTransactions, setWalletTransactions] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(8); // Number of records per page

    const baseURL = import.meta.env.VITE_REACT_APP_API_URL
    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const fetchSalesReport = async (date) => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseURL}/api/admin/admin/sales_report/`, {
                params: { date },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBookings(response.data.bookings || []);
            setTransactions(response.data.transactions || []);
            setWalletTransactions(response.data.wallet_transactions || []);
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

    useEffect(() => {
        if (token) {
            fetchSalesReport(selectedDate);
        }
    }, [selectedDate, token]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setCurrentPage(0); // Reset to the first page when date changes
    };

    const handlePrint = () => {
        window.print();
    };

    // Combine transactions and wallet transactions into one table
    const combinedTransactions = [
        ...transactions.map(transaction => ({
            ...transaction,
            method: 'Razorpay',  // or any other identifier for regular transactions
        })),
        ...walletTransactions.map(walletTransaction => ({
            id: walletTransaction.id,
            amount: walletTransaction.amount,
            status: walletTransaction.status,
            method: 'Wallet',
            username: walletTransaction.username
        }))
    ];

    // Pagination logic
    const totalPages = Math.ceil(combinedTransactions.length / itemsPerPage); // Total number of pages
    const displayedTransactions = combinedTransactions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage); // Current page transactions

    return (
        <div className="flex flex-row min-h-screen bg-gray-100 text-gray-800">
        <AdminSidebar />
        <main className="flex-grow p-6">
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Sales Report</h2>

            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Select Date:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full md:w-1/4 border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {loading && <p className="text-blue-500">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && (
                <>
                    <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Total Amount: ₹{totalAmount}</h3>
                        <button
                            onClick={handlePrint}
                            className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded shadow"
                        >
                            Print/Save PDF
                        </button>
                    </div>

                    {/* Display Combined Transactions */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Transactions</h3>

                        {/* Table for larger screens */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse border bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-teal-100">
                                        <th className="border px-4 py-2 text-left">Transaction ID</th>
                                        <th className="border px-4 py-2 text-left">Amount</th>
                                        <th className="border px-4 py-2 text-left">Status</th>
                                        <th className="border px-4 py-2 text-left">Method</th>
                                        <th className="border px-4 py-2 text-left">User Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedTransactions.map((transaction, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="border px-4 py-2">{transaction.id}</td>
                                            <td className="border px-4 py-2">₹{transaction.amount}</td>
                                            <td className="border px-4 py-2">{transaction.status}</td>
                                            <td className="border px-4 py-2">{transaction.method}</td>
                                            <td className="border px-4 py-2">{transaction.username || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* List format for smaller screens */}
                        <div className="md:hidden">
                            {displayedTransactions.map((transaction, index) => (
                                <div key={index} className="border p-4 mb-4 rounded-md shadow-sm bg-white">
                                    <p><strong>Transaction ID:</strong> {transaction.id}</p>
                                    <p><strong>Amount:</strong> ₹{transaction.amount}</p>
                                    <p><strong>Status:</strong> {transaction.status}</p>
                                    <p><strong>Method:</strong> {transaction.method}</p>
                                    <p><strong>User Name:</strong> {transaction.username || 'N/A'}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                disabled={currentPage === 0}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </main>
    </div>
    )
}
export default SalesReport;

