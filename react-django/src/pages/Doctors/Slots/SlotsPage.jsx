import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSlots } from "../../../Redux/slotSlice";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import { 
    MdDelete, 
    MdEdit, 
    MdEventAvailable, 
    MdEventBusy, 
    MdSchedule,
    MdFilterList,
    MdRefresh,
    MdAdd,
    MdSearch
} from 'react-icons/md';
import SlotEdit from "./SlotEdit";

const formatSlot = (slot) => {
    if (!slot.start_time || !slot.end_time) {
        console.error('Invalid slot time:', slot);
        return { date: 'Invalid Date', timeRange: 'Invalid Time', datetime: moment() };
    }

    const start = moment(slot.start_time);
    const end = moment(slot.end_time);

    const formattedDate = start.format('YYYY-MM-DD');
    const formattedStart = start.format('h:mm A');
    const formattedEnd = end.format('h:mm A');
    const displayDate = start.format('MMM D, YYYY');
    const dayOfWeek = start.format('ddd');

    return {
        date: formattedDate,
        timeRange: `${formattedStart} - ${formattedEnd}`,
        displayDate,
        dayOfWeek,
        datetime: start,
        isToday: start.isSame(moment(), 'day'),
        isTomorrow: start.isSame(moment().add(1, 'day'), 'day')
    };
};

const SlotsPage = () => {
    const dispatch = useDispatch();
    const slots = useSelector(state => state.slots.slots);
    const token = localStorage.getItem('access');
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [editingSlot, setEditingSlot] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'available', 'booked', 'today', 'upcoming'
    const [searchTerm, setSearchTerm] = useState('');
    const [groupByDate, setGroupByDate] = useState(true);
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseURL}/api/doctors/doctor/slots/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
    
            const currentDateTime = moment();
            const validSlots = response.data.filter(slot => 
                moment(slot.start_time).isSameOrAfter(currentDateTime)
            );
    
            dispatch(setSlots(validSlots));
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            toast.error('Failed to load slots');
        } finally {
            setLoading(false);
        }
    }, [dispatch, token, baseURL]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const handleDeleteClick = useCallback((slotId) => {
        if (slotId === undefined) {
            console.error('Slot ID is undefined');
            toast.error('Invalid slot selected');
        } else {
            setSlotToDelete(slotId);
            setShowConfirm(true);
        }
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (slotToDelete !== null) {
            try {
                await axios.delete(`${baseURL}/api/doctors/doctor/delete_slot/${slotToDelete}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    data: { id: slotToDelete }
                });
                toast.success('Slot deleted successfully');
                fetchSlots();
            } catch (error) {
                console.error('Failed to delete slot:', error);
                toast.error('Failed to delete slot');
            } finally {
                setShowConfirm(false);
                setSlotToDelete(null);
            }
        }
    }, [slotToDelete, token, fetchSlots, baseURL]);

    const handleCancelDelete = () => {
        setShowConfirm(false);
        setSlotToDelete(null);
    };

    const handleEditClick = (slotId) => {
        setEditingSlot(slotId);
        setShowEdit(true);
    };

    const handleCloseEdit = () => {
        setShowEdit(false);
        setEditingSlot(null);
    };

    // Filter and sort slots
    const filteredAndSortedSlots = useMemo(() => {
        let filtered = [...slots];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(slot => {
                const formatted = formatSlot(slot);
                return formatted.timeRange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       formatted.displayDate.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        // Apply status filter
        switch (filter) {
            case 'available':
                filtered = filtered.filter(slot => !slot.is_booked);
                break;
            case 'booked':
                filtered = filtered.filter(slot => slot.is_booked);
                break;
            case 'today':
                filtered = filtered.filter(slot => 
                    moment(slot.start_time).isSame(moment(), 'day')
                );
                break;
            case 'upcoming':
                filtered = filtered.filter(slot => 
                    moment(slot.start_time).isAfter(moment(), 'day')
                );
                break;
            default:
                // 'all' - no additional filtering
                break;
        }

        // Sort by date and time
        return filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }, [slots, filter, searchTerm]);

    // Group slots by date
    const groupedSlots = useMemo(() => {
        if (!groupByDate) return { 'All Slots': filteredAndSortedSlots };

        const groups = {};
        filteredAndSortedSlots.forEach(slot => {
            const formatted = formatSlot(slot);
            const dateKey = formatted.displayDate;
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(slot);
        });
        return groups;
    }, [filteredAndSortedSlots, groupByDate]);

    // Statistics
    const stats = useMemo(() => {
        const total = slots.length;
        const available = slots.filter(slot => !slot.is_booked).length;
        const booked = slots.filter(slot => slot.is_booked).length;
        const today = slots.filter(slot => 
            moment(slot.start_time).isSame(moment(), 'day')
        ).length;

        return { total, available, booked, today };
    }, [slots]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Time Slots</h1>
                        <p className="text-gray-600">View and manage your appointment availability</p>
                    </div>
                    <button
                        onClick={fetchSlots}
                        className="mt-4 lg:mt-0 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center"
                    >
                        <MdRefresh className="mr-2" />
                        Refresh
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MdSchedule className="text-blue-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <MdEventAvailable className="text-green-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <MdEventBusy className="text-orange-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Booked</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.booked}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MdEventAvailable className="text-purple-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Today</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                            {/* Search */}
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search slots..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Slots</option>
                                    <option value="available">Available</option>
                                    <option value="booked">Booked</option>
                                    <option value="today">Today</option>
                                    <option value="upcoming">Upcoming</option>
                                </select>
                                <MdFilterList className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Group Toggle */}
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={groupByDate}
                                onChange={(e) => setGroupByDate(e.target.checked)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600">Group by date</span>
                        </label>
                    </div>
                </div>

                {/* Slots Grid */}
                <div className="space-y-6">
                    {Object.keys(groupedSlots).length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                            <MdEventAvailable className="mx-auto text-4xl text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No slots found</h3>
                            <p className="text-gray-600 mb-4">Create new slots to start accepting appointments</p>
                        </div>
                    ) : (
                        Object.entries(groupedSlots).map(([date, dateSlots]) => (
                            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {groupByDate && (
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                                        <p className="text-sm text-gray-600">
                                            {dateSlots.length} slot{dateSlots.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {dateSlots.map(slot => {
                                            const formatted = formatSlot(slot);
                                            const isBooked = slot.is_booked;
                                            
                                            return (
                                                <div
                                                    key={slot.id}
                                                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                                                        isBooked
                                                            ? 'bg-gray-50 border-gray-300 opacity-75'
                                                            : 'bg-white border-teal-100 hover:border-teal-300 hover:shadow-md'
                                                    }`}
                                                >
                                                    {/* Status Badge */}
                                                    <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${
                                                        isBooked
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {isBooked ? 'Booked' : 'Available'}
                                                    </div>

                                                    {/* Time */}
                                                    <div className="text-center mb-3">
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {formatted.timeRange}
                                                        </div>
                                                        {!groupByDate && (
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                {formatted.displayDate}
                                                            </div>
                                                        )}
                                                        {formatted.isToday && (
                                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                                                                Today
                                                            </span>
                                                        )}
                                                        {formatted.isTomorrow && (
                                                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full mt-1">
                                                                Tomorrow
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Amount */}
                                                    <div className="text-center mb-4">
                                                        <span className="text-sm text-gray-600">Amount:</span>
                                                        <div className="text-lg font-bold text-green-600">
                                                            ₹{slot.amount}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    {!isBooked && (
                                                        <div className="flex justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleEditClick(slot.id)}
                                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                                title="Edit slot"
                                                            >
                                                                <MdEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(slot.id)}
                                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                                title="Delete slot"
                                                            >
                                                                <MdDelete size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <MdDelete className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Slot</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this time slot? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEdit && editingSlot && (
                <SlotEdit
                    slotId={editingSlot}
                    onClose={handleCloseEdit}
                    fetchSlots={fetchSlots}
                />
            )}
        </div>
    );
};

export default SlotsPage;
