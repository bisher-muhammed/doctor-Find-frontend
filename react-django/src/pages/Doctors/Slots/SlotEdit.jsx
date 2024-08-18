import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, differenceInMinutes, addMinutes } from 'date-fns';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { updateSlot } from '../../../Redux/slotSlice';

const SlotEdit = ({ slotId, onClose }) => {
    const [slot, setSlot] = useState(null);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [slotDuration, setSlotDuration] = useState(30); // Default duration in minutes
    const [endDate, setEndDate] = useState(new Date()); // End date picker
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const token = localStorage.getItem('access');

    useEffect(() => {
        const fetchSlot = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/doctors/doctor/single_slot/${slotId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                const { start_time, end_time } = response.data;
                const start = parseISO(start_time);
                const end = parseISO(end_time);
                setSlot(response.data);
                setStartTime(start);
                setEndTime(end);
                setSlotDuration(differenceInMinutes(end, start));
                setEndDate(end); // Set end date from end_time
            } catch (error) {
                console.error('Failed to fetch slot details:', error);
                toast.error('Failed to load slot details');
            } finally {
                setLoading(false);
            }
        };

        fetchSlot();
    }, [slotId, token]);

    const handleSubmit = async () => {
        try {
            const start_time = format(startTime, "yyyy-MM-dd'T'HH:mm:ssXXX");
            const end_time = format(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX");
            const end_date = format(endDate, 'yyyy-MM-dd'); // Updated end date

            await axios.patch(`http://127.0.0.1:8000/api/doctors/doctor/single_slot/${slotId}/`, {
                start_time,
                end_time,
                duration: slotDuration,
                end_date, // Include end_date
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            toast.success('Slot updated successfully');
            dispatch(updateSlot({ id: slotId, start_time, end_time, duration: slotDuration }));
            onClose();
        } catch (error) {
            console.error('Failed to update slot:', error.response ? error.response.data : error.message);
            toast.error('Failed to update slot');
        }
    };

    if (loading) {
        return <div>Loading slot details...</div>;
    }

    if (!slot) {
        return <div>No slot details found.</div>;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-lg mb-4">Edit Slot</h2>
                <div className="mb-4">
                    <label className="block mb-2">Start Time:</label>
                    <DatePicker
                        selected={startTime}
                        onChange={date => {
                            setStartTime(date);
                            // Adjust end time if it’s before the new start time
                            if (endTime < date) {
                                setEndTime(date);
                            }
                            // Update slot duration
                            setSlotDuration(differenceInMinutes(endTime, date));
                        }}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="h:mm aa"
                        className="w-full border rounded p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">End Time:</label>
                    <DatePicker
                        selected={endTime}
                        onChange={date => {
                            setEndTime(date);
                            // Update slot duration when end time changes
                            setSlotDuration(differenceInMinutes(date, startTime));
                        }}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="h:mm aa"
                        minDate={startTime} // Ensure end time cannot be before start time
                        className="w-full border rounded p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Slot Duration (minutes):</label>
                    <input
                        type="number"
                        value={slotDuration}
                        onChange={e => setSlotDuration(Number(e.target.value))}
                        min="1"
                        className="w-full border rounded p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">End Date:</label>
                    <DatePicker
                        selected={endDate}
                        onChange={date => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="w-full border rounded p-2"
                    />
                </div>
                <div className="flex space-x-4 mt-4">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SlotEdit;
