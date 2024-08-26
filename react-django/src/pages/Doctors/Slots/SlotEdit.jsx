import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, differenceInMinutes } from 'date-fns';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { updateSlot } from '../../../Redux/slotSlice';
import moment from 'moment-timezone';

const SlotEdit = ({ slotId, onClose, onSave }) => {
    const [slot, setSlot] = useState(null);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [slotDuration, setSlotDuration] = useState(30);
    const [endDate, setEndDate] = useState(new Date());
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
                const { start_time, end_time, end_date } = response.data;
                setStartTime(new Date(start_time));
                setEndTime(new Date(end_time));
                setSlotDuration(differenceInMinutes(new Date(end_time), new Date(start_time)));
                setEndDate(new Date(end_date));
                setSlot(response.data);
            } catch (error) {
                console.error('Failed to fetch slot details:', error);
                toast.error('Failed to load slot details');
            } finally {
                setLoading(false);
            }
        };

        fetchSlot();
    }, [slotId, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Format times for backend
        const formatTime = (date) => format(date, "h:mm a");
        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);

        // Format endDate to string
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        // Validate times
        if (startTime >= endTime) {
            toast.error('Start time cannot be after end time');
            return;
        }

        const payload = {
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration: slotDuration,
            end_date: formattedEndDate,
        };

        console.log("Payload being sent:", payload);

        try {
            const response = await axios.patch(
                `http://127.0.0.1:8000/api/doctors/doctor/single_slot/${slotId}/`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Slot updated successfully:', response.data);
            toast.success('Slot updated successfully');
            if (onSave) onSave(); // Notify parent component on save
        } catch (error) {
            console.error('Failed to update slot:', error.response?.data || error.message);
            toast.error('Failed to update slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
                <h2 className="text-lg mb-4">Edit Slot</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Start Time:</label>
                        <DatePicker
                            selected={startTime}
                            onChange={date => {
                                setStartTime(date);
                                if (endTime < date) {
                                    setEndTime(date);
                                }
                                setSlotDuration(differenceInMinutes(endTime, date));
                            }}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
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
                                setSlotDuration(differenceInMinutes(date, startTime));
                            }}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            minDate={startTime}
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
                            minDate={new Date()}
                            dateFormat="yyyy-MM-dd"
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SlotEdit;
