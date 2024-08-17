import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSlots, toggleSlotSelection } from "../../../Redux/slotSlice";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";

const formatSlot = (slot) => {
    if (!slot.start_time || !slot.end_time) {
        console.error('Invalid slot time:', slot);
        return { date: 'Invalid Date', timeRange: 'Invalid Time' };
    }

    const start = moment(slot.start_time).utc();
    const end = moment(slot.end_time).utc();

    const formattedDate = start.format('YYYY-MM-DD'); // Format the date
    const formattedStart = start.format('h:mm A'); // 12-hour format with AM/PM
    const formattedEnd = end.format('h:mm A'); // 12-hour format with AM/PM

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

    const fetchSlots = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/doctors/doctor/slots/", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            console.log('API Response:', response.data); // Debug API response

            const currentDateTime = moment.utc(); // Get current UTC time
            const expiredSlots = response.data.filter(slot => moment(slot.start_time).utc().isBefore(currentDateTime));
            const validSlots = response.data.filter(slot => moment(slot.start_time).utc().isSameOrAfter(currentDateTime));

            // Delete expired slots from the backend
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
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [dispatch, token]);

    const handleSlotSelection = (slotId) => {
        dispatch(toggleSlotSelection({ slotId }));
    };

    const handleSubmit = async () => {
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
    };

    const sortedSlots = [...slots].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Manage Your Slots</h1>
            <ul className="grid grid-cols-4 gap-4">
                {sortedSlots.map(slot => {
                    const { date, timeRange } = formatSlot(slot);
                    return (
                        <li key={slot.id} className="flex flex-col items-center p-4 border rounded shadow-md hover:bg-emerald-500">
                            <span className="text-black">{timeRange}</span>
                            <span className="mt-1 text-sm text-red-700 ">{date}</span>
                            <button
                                onClick={() => handleSlotSelection(slot.id)}
                                className={`mt-2 px-3 py-1 rounded ${selectedSlots.includes(slot.id) ? 'bg-green-500' : 'bg-red-500'} text-white`}
                            >
                                {selectedSlots.includes(slot.id) ? 'Deselect' : 'Select'}
                            </button>
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
        </div>
    );
};

export default SlotsPage;
