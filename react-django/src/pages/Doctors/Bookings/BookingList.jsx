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
        dateType: 'slot_date'
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        today: 0
    });
    const [showFilters, setShowFilters] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({});
    
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
            displayDate: start.format('MMM DD, YYYY'),
            isToday: start.isSame(moment(), 'day'),
            isTomorrow: start.isSame(moment().add(1, 'day'), 'day'),
            isPast: start.isBefore(moment(), 'day')
        };
    };

    // Get status badge color and icon
    const getStatusConfig = (status) => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case 'pending':
                return {
                    color: 'text-amber-600 bg-amber-50 border-amber-200',
                    icon: '⏳',
                    bg: 'bg-amber-500'
                };
            case 'completed':
                return {
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                    icon: '✅',
                    bg: 'bg-emerald-500'
                };
            case 'cancelled':
                return {
                    color: 'text-rose-600 bg-rose-50 border-rose-200',
                    icon: '❌',
                    bg: 'bg-rose-500'
                };
            default:
                return {
                    color: 'text-gray-600 bg-gray-50 border-gray-200',
                    icon: '📄',
                    bg: 'bg-gray-500'
                };
        }
    };

    // Calculate statistics
    const calculateStats = useCallback((bookingsData) => {
        const today = moment().startOf('day');
        const statsData = {
            total: bookingsData.length,
            pending: bookingsData.filter(b => b.status === 'pending').length,
            completed: bookingsData.filter(b => b.status === 'completed').length,
            cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
            today: bookingsData.filter(b => 
                moment(b.slots?.start_time).isSame(today, 'day')
            ).length
        };
        setStats(statsData);
    }, []);

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
                calculateStats(response.data);
            } else {
                setBookings([]);
                calculateStats([]);
                toast.warning('No bookings data received');
            }
        } catch (error) {
            handleFetchError(error);
        } finally {
            setLoading(false);
        }
    }, [baseURL, navigate, handleFetchError, calculateStats]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Handle status change for bookings
    const handleStatusChange = async (bookingId, newStatus) => {
        if (!bookingId || !newStatus) {
            toast.error('Invalid booking or status');
            return;
        }

        setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));

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
            
            // Recalculate stats after status update
            calculateStats(bookings.map(b => 
                b.id === bookingId ? { ...b, status: newStatus } : b
            ));

            setStatusUpdate((prev) => {
                const updated = { ...prev };
                delete updated[bookingId];
                return updated;
            });

            toast.success(`Booking status updated to ${newStatus}`);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to update booking status';
            toast.error(errorMessage);
            
            setStatusUpdate((prev) => {
                const updated = { ...prev };
                delete updated[bookingId];
                return updated;
            });
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    // Quick status update handlers
    const handleQuickStatusUpdate = (bookingId, status) => {
        setStatusUpdate(prev => ({ ...prev, [bookingId]: status }));
        handleStatusChange(bookingId, status);
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
        setShowFilters(false);
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

                if (startDate) startDate.setHours(0, 0, 0, 0);
                if (endDate) endDate.setHours(23, 59, 59, 999);

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Quick filter handlers
    const handleQuickFilter = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Bookings</h3>
                    <p className="text-gray-500">Please wait while we fetch your appointments...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Bookings</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={fetchBookings}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Appointment Management</h1>
                    <p className="text-gray-600 text-lg">Manage and track your patient appointments</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div 
                        className={`bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${filterStatus === 'all' ? 'ring-2 ring-blue-300' : ''}`}
                        onClick={() => handleQuickFilter('all')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <div className="text-2xl">📊</div>
                        </div>
                    </div>
                    
                    <div 
                        className={`bg-white rounded-xl p-4 shadow-lg border-l-4 border-amber-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${filterStatus === 'pending' ? 'ring-2 ring-amber-300' : ''}`}
                        onClick={() => handleQuickFilter('pending')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                            </div>
                            <div className="text-2xl">⏳</div>
                        </div>
                    </div>
                    
                    <div 
                        className={`bg-white rounded-xl p-4 shadow-lg border-l-4 border-emerald-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${filterStatus === 'completed' ? 'ring-2 ring-emerald-300' : ''}`}
                        onClick={() => handleQuickFilter('completed')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                            </div>
                            <div className="text-2xl">✅</div>
                        </div>
                    </div>
                    
                    <div 
                        className={`bg-white rounded-xl p-4 shadow-lg border-l-4 border-rose-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${filterStatus === 'cancelled' ? 'ring-2 ring-rose-300' : ''}`}
                        onClick={() => handleQuickFilter('cancelled')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                <p className="text-2xl font-bold text-rose-600">{stats.cancelled}</p>
                            </div>
                            <div className="text-2xl">❌</div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Today</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
                            </div>
                            <div className="text-2xl">📅</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Filters Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search patients, emails, or booking IDs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        >
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                    </svg>
                                    Filters
                                    {showFilters && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                                </button>

                                <button
                                    onClick={fetchBookings}
                                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="created_at">Created Date</option>
                                            <option value="slot_date">Appointment Date</option>
                                            <option value="username">Patient Name</option>
                                            <option value="status">Status</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Type</label>
                                        <select
                                            value={dateFilter.dateType}
                                            onChange={(e) => setDateFilter(prev => ({ ...prev, dateType: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="slot_date">Appointment Date</option>
                                            <option value="created_at">Booking Date</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <button
                                            onClick={clearAllFilters}
                                            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-all"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                                        <input
                                            type="date"
                                            value={dateFilter.startDate}
                                            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                                        <input
                                            type="date"
                                            value={dateFilter.endDate}
                                            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => setDateFilter({ startDate: '', endDate: '', dateType: 'slot_date' })}
                                            className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all"
                                        >
                                            Clear Dates
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results Summary */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-700">
                                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                                </span>
                                {bookings.length !== filteredBookings.length && (
                                    <span className="text-gray-500">
                                        (filtered from {bookings.length} total)
                                    </span>
                                )}
                            </div>
                            
                            {(searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate) && (
                                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                                    {searchQuery && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                                            Search: "{searchQuery}"
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="ml-2 text-blue-600 hover:text-blue-800 transition"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {filterStatus !== 'all' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                                            Status: {filterStatus}
                                            <button
                                                onClick={() => setFilterStatus('all')}
                                                className="ml-2 text-green-600 hover:text-green-800 transition"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {(dateFilter.startDate || dateFilter.endDate) && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
                                            Date: {dateFilter.startDate || 'Start'} - {dateFilter.endDate || 'End'}
                                            <button
                                                onClick={() => setDateFilter({ startDate: '', endDate: '', dateType: 'slot_date' })}
                                                className="ml-2 text-purple-600 hover:text-purple-800 transition"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bookings Content */}
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-8xl mb-4">
                                {searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate ? '🔍' : '📅'}
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                                {searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate 
                                    ? 'No matching bookings found' 
                                    : 'No appointments scheduled'
                                }
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                {searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate 
                                    ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
                                    : 'When patients book appointments with you, they will appear here for management.'
                                }
                            </p>
                            {(searchQuery || filterStatus !== 'all' || dateFilter.startDate || dateFilter.endDate) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Mobile Cards View */}
                            <div className="md:hidden p-4 space-y-4">
                                {currentBookings.map((booking) => {
                                    const userUsername = booking.user?.username || 'N/A';
                                    const userEmail = booking.user?.email || 'N/A';
                                    const formatted = formatSlot(booking.slots);
                                    const statusConfig = getStatusConfig(booking.status);

                                    return (
                                        <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-semibold text-lg text-gray-800">{userUsername}</div>
                                                    <div className="text-sm text-gray-500">{userEmail}</div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                                    {statusConfig.icon} {booking.status?.toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            {/* Appointment Details */}
                                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Date:</span>
                                                    <span className="flex items-center gap-1">
                                                        {formatted.displayDate}
                                                        {formatted.isToday && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Today</span>}
                                                        {formatted.isTomorrow && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Tomorrow</span>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Time:</span>
                                                    <span>{formatted.timeRange}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Booked:</span>
                                                    <span>{moment(booking.created_at).format('MMM DD, YYYY')}</span>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-2">Update Status</label>
                                                    <div className="flex gap-2">
                                                        {['pending', 'completed', 'cancelled'].map(status => {
                                                            const config = getStatusConfig(status);
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleQuickStatusUpdate(booking.id, status)}
                                                                    disabled={updatingStatus[booking.id] || booking.status === status}
                                                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                                        booking.status === status 
                                                                            ? `${config.bg} text-white shadow-md` 
                                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                >
                                                                    {updatingStatus[booking.id] && booking.status === status ? (
                                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                                                                    ) : (
                                                                        status.charAt(0).toUpperCase() + status.slice(1)
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                
                                                <Link 
                                                    to={`/doctor/Bookings/booking_details/${booking.id}`} 
                                                    className="block w-full text-center bg-blue-50 text-blue-600 hover:bg-blue-100 py-3 px-4 rounded-lg transition-all duration-200 font-medium border border-blue-200"
                                                >
                                                    View Full Details
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Appointment</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booked On</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentBookings.map((booking) => {
                                            const userUsername = booking.user?.username || 'N/A';
                                            const userEmail = booking.user?.email || 'N/A';
                                            const formatted = formatSlot(booking.slots);
                                            const statusConfig = getStatusConfig(booking.status);

                                            return (
                                                <tr key={booking.id} className="hover:bg-blue-50 transition-all duration-200 group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{userUsername}</div>
                                                            <div className="text-sm text-gray-500">{userEmail}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-gray-900 font-medium">{formatted.displayDate}</div>
                                                        <div className="text-sm text-gray-500">{formatted.timeRange}</div>
                                                        {formatted.isToday && (
                                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">Today</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                                            {statusConfig.icon} {booking.status?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {moment(booking.created_at).format('MMM DD, YYYY')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-1">
                                                            {['pending', 'completed', 'cancelled'].map(status => {
                                                                const config = getStatusConfig(status);
                                                                return (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => handleQuickStatusUpdate(booking.id, status)}
                                                                        disabled={updatingStatus[booking.id] || booking.status === status}
                                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                                            booking.status === status 
                                                                                ? `${config.bg} text-white shadow-md` 
                                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                        title={`Mark as ${status}`}
                                                                    >
                                                                        {updatingStatus[booking.id] && booking.status === status ? (
                                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                                                                        ) : (
                                                                            status.charAt(0).toUpperCase()
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link 
                                                            to={`/doctor/Bookings/booking_details/${booking.id}`} 
                                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors group-hover:underline"
                                                        >
                                                            View Details
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-sm text-gray-600">
                                            Page {currentPage} of {totalPages} • {filteredBookings.length} total bookings
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
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
                                                            className={`px-3 py-2 rounded-lg transition-all ${
                                                                currentPage === pageNumber
                                                                    ? 'bg-blue-600 text-white shadow-lg'
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
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                            >
                                                Next
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookingList;
