import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: '',
        dateType: 'slot_date' // 'slot_date' or 'created_at'
    });
    const bookingsPerPage = 8;
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const navigate = useNavigate();

    // Function to format slot details
    const formatSlot = (slot) => {
        if (!slot?.start_time || !slot?.end_time) {
            return { date: 'Invalid Date', timeRange: 'Invalid Time' };
        }

        const start = moment(slot.start_time);
        const end = moment(slot.end_time);

        return {
            date: start.format('YYYY-MM-DD'),
            timeRange: `${start.format('h:mm A')} - ${end.format('h:mm A')}`,
        };
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    // Handle fetch error
    const handleFetchError = useCallback((error) => {
        if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.');
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            navigate('/doctor/login');
        } else if (error.response?.status === 403) {
            toast.error('Access denied. Doctor profile required.');
            navigate('/doctor/profile');
        } else {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to load bookings';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    }, [navigate]);

    // Fetch bookings from API
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/doctor/login');
                return;
            }

            const response = await axios.get(`${baseURL}/api/doctors/doctor/bookings/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (Array.isArray(response.data)) {
                setBookings(response.data);
            } else {
                setBookings([]);
                toast.warning('No bookings data received');
            }
        } catch (error) {
            handleFetchError(error);
        } finally {
            setLoading(false);
        }
    }, [baseURL, navigate, handleFetchError]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Handle status change for bookings
    const handleStatusChange = async (bookingId, newStatus) => {
        if (!bookingId || !newStatus) {
            toast.error('Invalid booking or status');
            return;
        }

        try {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/doctor/login');
                return;
            }

            await axios.patch(
                `${baseURL}/api/doctors/bookings/${bookingId}/update/`, 
                { status: newStatus }, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === bookingId ? { ...booking, status: newStatus } : booking
                )
            );
            
            // Clear the status update state for this booking
            setStatusUpdate((prev) => {
                const updated = { ...prev };
                delete updated[bookingId];
                return updated;
            });

            toast.success('Booking status updated successfully');
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to update booking status';
            toast.error(errorMessage);
            
            // Reset the select to original status
            setStatusUpdate((prev) => {
                const updated = { ...prev };
                delete updated[bookingId];
                return updated;
            });
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilterStatus('all');
        setSearchQuery('');
        setDateFilter({
            startDate: '',
            endDate: '',
            dateType: 'slot_date'
        });
        setSortBy('created_at');
        setSortOrder('desc');
    };

    // Filter and sort bookings
    const getFilteredAndSortedBookings = () => {
        let filtered = bookings;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(booking => {
                const username = booking.user?.username?.toLowerCase() || '';
                const userEmail = booking.user?.email?.toLowerCase() || '';
                const userFirstName = booking.user?.first_name?.toLowerCase() || '';
                const userLastName = booking.user?.last_name?.toLowerCase() || '';
                const bookingId = booking.id?.toString() || '';
                
                return username.includes(query) || 
                       userEmail.includes(query) || 
                       userFirstName.includes(query) || 
                       userLastName.includes(query) || 
                       bookingId.includes(query) ||
                       `${userFirstName} ${userLastName}`.includes(query);
            });
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(booking => booking.status === filterStatus);
        }

        // Apply date filter
        if (dateFilter.startDate || dateFilter.endDate) {
            filtered = filtered.filter(booking => {
                let bookingDate;
                
                if (dateFilter.dateType === 'slot_date') {
                    bookingDate = booking.slots?.start_time ? new Date(booking.slots.start_time) : null;
                } else {
                    bookingDate = booking.created_at ? new Date(booking.created_at) : null;
                }

                if (!bookingDate) return false;

                const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
                const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

                // Set time to start/end of day for accurate comparison
                if (startDate) {
                    startDate.setHours(0, 0, 0, 0);
                }
                if (endDate) {
                    endDate.setHours(23, 59, 59, 999);
                }

                if (startDate && endDate) {
                    return bookingDate >= startDate && bookingDate <= endDate;
                } else if (startDate) {
                    return bookingDate >= startDate;
                } else if (endDate) {
                    return bookingDate <= endDate;
                }

                return true;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'slot_date':
                    aValue = new Date(a.slots?.start_time || 0);
                    bValue = new Date(b.slots?.start_time || 0);
                    break;
                case 'username':
                    aValue = a.user?.username || '';
                    bValue = b.user?.username || '';
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    };

    // Pagination logic
    const filteredBookings = getFilteredAndSortedBookings();
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, sortBy, sortOrder, searchQuery, dateFilter]);

    // Change page function
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <span className="text-xl text-gray-600">Loading bookings...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Bookings</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchBookings}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Your Bookings</h1>
                
                {/* Filters and Controls */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by patient name, username, email, or booking ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Date Type</label>
                                <select
                                    value={dateFilter.dateType}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, dateType: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="slot_date">Appointment Date</option>
                                    <option value="created_at">Booking Created Date</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setDateFilter({ startDate: '', endDate: '', dateType: 'slot_date' })}
                                    className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition duration-200"
                                >
                                    Clear Dates
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Status Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="created_at">Created Date</option>
                                    <option value="slot_date">Slot Date</option>
                                    <option value="username">Patient Name</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Order</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={clearAllFilters}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear All
                            </button>
                            <button
                                onClick={fetchBookings}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 gap-2">
                    <div>
                        Showing {currentBookings.length} of {filteredBookings.length} bookings
                        {bookings.length !== filteredBookings.length && ` (filtered from ${bookings.length} total)`}
                    </div>
                    {(searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate) && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500">Active filters:</span>
                            {searchQuery && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    Search: "{searchQuery}"
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filterStatus !== 'all' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    Status: {filterStatus}
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className="ml-1 text-green-600 hover:text-green-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {(dateFilter.startDate || dateFilter.endDate) && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                    Date: {dateFilter.startDate || 'Start'} - {dateFilter.endDate || 'End'}
                                    <button
                                        onClick={() => setDateFilter({ startDate: '', endDate: '', dateType: 'slot_date' })}
                                        className="ml-1 text-purple-600 hover:text-purple-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">
                        {searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate ? '🔍' : '📅'}
                    </div>
                    <p className="text-xl text-gray-600 mb-2">
                        {searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate 
                            ? 'No bookings match your filters' 
                            : 'No bookings found'
                        }
                    </p>
                    <p className="text-gray-500 mb-4">
                        {searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate 
                            ? 'Try adjusting your search or filters to see more results.' 
                            : 'You don\'t have any bookings yet.'
                        }
                    </p>
                    {(searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate) && (
                        <button
                            onClick={clearAllFilters}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {currentBookings.map((booking) => {
                            const userUsername = booking.user?.username || 'N/A';
                            const { date, timeRange } = formatSlot(booking.slots);

                            return (
                                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="font-semibold text-lg text-gray-800">{userUsername}</div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status?.toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Date:</span>
                                            <span>{date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Time:</span>
                                            <span>{timeRange}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Created:</span>
                                            <span>{moment(booking.created_at).format('MMM DD, YYYY')}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Update Status</label>
                                            <select
                                                value={statusUpdate[booking.id] || booking.status}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value;
                                                    setStatusUpdate((prev) => ({ ...prev, [booking.id]: newStatus }));
                                                    handleStatusChange(booking.id, newStatus);
                                                }}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        
                                        <Link 
                                            to={`/doctor/Bookings/booking_details/${booking.id}`} 
                                            className="block w-full text-center bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 px-4 rounded-md transition duration-200 font-medium"
                                        >
                                            View Full Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop/Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentBookings.map((booking) => {
                                        const userUsername = booking.user?.username || 'N/A';
                                        const { date, timeRange } = formatSlot(booking.slots);

                                        return (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{userUsername}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{timeRange}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                        {booking.status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {moment(booking.created_at).format('MMM DD, YYYY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={statusUpdate[booking.id] || booking.status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            setStatusUpdate((prev) => ({ ...prev, [booking.id]: newStatus }));
                                                            handleStatusChange(booking.id, newStatus);
                                                        }}
                                                        className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link 
                                                        to={`/doctor/Bookings/booking_details/${booking.id}`} 
                                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 bg-white border border-gray-300 text-gray-500 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            
                            {/* Page numbers */}
                            <div className="flex space-x-1">
                                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = index + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = index + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + index;
                                    } else {
                                        pageNumber = currentPage - 2 + index;
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            className={`px-3 py-2 rounded-md transition ${
                                                currentPage === pageNumber
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 bg-white border border-gray-300 text-gray-500 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default BookingList;