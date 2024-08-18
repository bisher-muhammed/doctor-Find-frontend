import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSlots, toggleSlotSelection } from "../../../Redux/slotSlice";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import { MdDelete } from 'react-icons/md';

const formatSlot = (slot) => {
    if (!slot.start_time || !slot.end_time) {
        console.error('Invalid slot time:', slot);
        return { date: 'Invalid Date', timeRange: 'Invalid Time' };
    }

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

const SlotsPage = () => {
    const dispatch = useDispatch();
    const slots = useSelector(state => state.slots.slots);
    const selectedSlots = useSelector(state => state.slots.selectedSlots);
    const token = localStorage.getItem('access');
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/doctors/doctor/slots/", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const currentDateTime = moment.utc();
            const expiredSlots = response.data.filter(slot => moment(slot.start_time).utc().isBefore(currentDateTime));
            const validSlots = response.data.filter(slot => moment(slot.start_time).utc().isSameOrAfter(currentDateTime));

            await Promise.all(expiredSlots.map(async (slot) => {
                try {
                    await axios.delete(`http://127.0.0.1:8000/api/doctors/doctor/slots/${slot.id}/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log(`Deleted expired slot with ID: ${slot.id}`);
                } catch (deleteError) {
                    console.error(`Failed to delete expired slot with ID: ${slot.id}`, deleteError);
                }
            }));

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

    const handleSlotSelection = useCallback((slotId) => {
        dispatch(toggleSlotSelection({ slotId }));
    }, [dispatch]);

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
                await axios.delete(`http://127.0.0.1:8000/api/doctors/doctor/delete_slot/${slotToDelete}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
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

    const handleSubmit = useCallback(async () => {
        try {
            await axios.post("http://127.0.0.1:8000/api/doctors/doctor/selected_slots/", { slots: selectedSlots }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            toast.success('Selected slots saved successfully');
        } catch (error) {
            console.error('Failed to save selected slots:', error);
            toast.error('Failed to save selected slots');
        }
    }, [selectedSlots, token]);

    const sortedSlots = useMemo(() => {
        return [...slots].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }, [slots]);

    if (loading) {
        return <div>Loading slots...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Manage Your Slots</h1>
            <ul className="grid grid-cols-4 gap-4">
                {sortedSlots.map(slot => {
                    const { date, timeRange } = formatSlot(slot);
                    return (
                        <li key={slot.id} className="flex flex-col items-center p-4 border rounded shadow-md hover:bg-emerald-500">
                            <span className="text-black">{timeRange}</span>
                            <span className="mt-1 text-sm text-red-700">{date}</span>
                            <div className="flex space-x-2 mt-2">
                                <button
                                    onClick={() => handleSlotSelection(slot.id)}
                                    className={`px-3 py-1 rounded ${selectedSlots.includes(slot.id) ? 'bg-green-500' : 'bg-red-500'} text-white`}
                                >
                                    {selectedSlots.includes(slot.id) ? 'Deselect' : 'Select'}
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(slot.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    <MdDelete size={20} />
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <button
                onClick={handleSubmit}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
                Save Selected Slots
            </button>

            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this slot?</p>
                        <div className="flex space-x-4 mt-4">
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlotsPage;
