import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSlots } from "../../../Redux/slotSlice";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import { MdDelete, MdEdit } from 'react-icons/md';
import SlotEdit from "./SlotEdit";



const formatSlot = (slot) => {
    if (!slot.start_time || !slot.end_time) {
        console.error('Invalid slot time:', slot);
        return { date: 'Invalid Date', timeRange: 'Invalid Time' };
    }

    const start = moment(slot.start_time);  // Removed .utc()
    const end = moment(slot.end_time);      // Removed .utc()

    const formattedDate = start.format('YYYY-MM-DD');
    const formattedStart = start.format('h:mm A');
    const formattedEnd = end.format('h:mm A');

    return {
        date: formattedDate,
        timeRange: `${formattedStart} - ${formattedEnd}`,
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
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL

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
            // Filter expired and valid slots
            const expiredSlots = response.data.filter(slot => moment(slot.start_time).isBefore(currentDateTime));
            const validSlots = response.data.filter(slot => moment(slot.start_time).isSameOrAfter(currentDateTime));
    
            // If you just want to block expired slots without deleting them,
            // you can add logic here to handle expired slots as needed.
    
            dispatch(setSlots(validSlots));
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            toast.error('Failed to load slots');
        } finally {
            setLoading(false);
        }
    }, [dispatch, token]);
    

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const handleDeleteClick = useCallback((slotId) => {
        if (slotId === undefined) {
            console.error('Slot ID is undefined');
        } else {
            console.log('Selected slot ID:', slotId);
            setSlotToDelete(slotId);
            setShowConfirm(true);
        }
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (slotToDelete !== null) {
            console.log('Slot to delete:', slotToDelete);
            try {
                await axios.delete(`${baseURL}/api/doctors/doctor/delete_slot/${slotToDelete}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    data: { id: slotToDelete }  // Pass the slot ID in the request body
                });
                toast.success('Slot deleted successfully');
                fetchSlots(); // Refresh the slots after deletion
            } catch (error) {
                console.error('Failed to delete slot:', error);
                toast.error('Failed to delete slot');
            } finally {
                setShowConfirm(false);
                setSlotToDelete(null);
            }
        }
    }, [slotToDelete, token, fetchSlots]);

    const handleCancelDelete = () => {
        setShowConfirm(false);
        setSlotToDelete(null);
    };

    const sortedSlots = useMemo(() => {
        return [...slots].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }, [slots]);

    if (loading) {
        return <div>Loading slots...</div>;
    }

    const handleEditClick = (slotId) => {
        setEditingSlot(slotId);
        setShowEdit(true);
    };

    const handleCloseEdit = () => {
        setShowEdit(false);
        setEditingSlot(null);
    };

    return (
        <div className="p-4">
            
            <h1 className="text-2xl mb-4">Manage Your Slots</h1>
            <ul className="grid grid-cols-4 gap-4">
                {sortedSlots.map(slot => {
                    const { date, timeRange } = formatSlot(slot);
                    const isBooked = slot.is_booked; // Assuming this field exists in your slot data
                    const amount = slot.amount;
                    return (
                        <li key={slot.id} className={`flex flex-col items-center p-4 border rounded shadow-md ${isBooked ? 'bg-gray-300' : 'hover:bg-emerald-500'}`}>
                            <span className={`text-black ${isBooked ? 'text-gray-600' : ''}`}>{timeRange}</span>
                            <span className={`mt-1 text-sm ${isBooked ? 'text-gray-500' : 'text-red-700'}`}>{date}</span>
                            <span className={`mt-1 text-sm ${isBooked ? 'text-gray-500' : 'text-green-700'}`}>Amount: ₹{amount}</span>
                            <div className="flex space-x-2 mt-2">
                                {!isBooked && (
                                    <>
                                        <button
                                            onClick={() => handleDeleteClick(slot.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(slot.id)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            <MdEdit size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this slot?</p>
                        <div className="flex space-x-4 mt-4">
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEdit && editingSlot && (
                <SlotEdit
                    slotId={editingSlot}
                    onClose={handleCloseEdit}
                    fetchSlots={fetchSlots} // Pass fetchSlots to refresh slots after editing
                />
            )}
        </div>
    );
};

export default SlotsPage;

