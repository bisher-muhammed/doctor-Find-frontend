import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse } from 'date-fns';

function SlotButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState(new Date()); // Start time as Date object
    const [endTime, setEndTime] = useState(new Date()); // End time as Date object
    const [duration, setDuration] = useState(30);
    const [endDate, setEndDate] = useState(new Date()); // End date as Date object

    const handleGenerateSlot = async () => {
        setLoading(true);

        const token = localStorage.getItem('access');
        if (!token) {
            toast.error('No authentication token found');
            setLoading(false);
            return;
        }

        // Convert to 12-hour format
        const formatTime = (date) => format(date, "h:mm a");
        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);

        // Convert endDate to string
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        // Validate times to ensure end time is after start time
        if (startTime >= endTime) {
            toast.error('Start time cannot be after end time');
            setLoading(false);
            return;
        }

        const data = {
            start_time: formattedStartTime, // 12-hour formatted time
            end_time: formattedEndTime, // 12-hour formatted time
            slot_duration: duration,
            end_date: formattedEndDate
        };

        console.log('Payload being sent:', data);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/doctors/doctor/generate_slots/",
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 201) {
                toast.success('Slot successfully created');
                navigate('/doctor/Slots/Slots');
            } else {
                toast.error('Failed to create slot');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            console.error('Error generating slot:', errorMessage);
            toast.error(`Error generating slot: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-4 border p-4 rounded-lg shadow-md">
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                    <DatePicker
                        selected={startTime}
                        onChange={(date) => setStartTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                    <DatePicker
                        selected={endTime}
                        onChange={(date) => setEndTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="slotDuration" className="block text-sm font-medium text-gray-700">Slot Duration (minutes)</label>
                    <input
                        type="number"
                        id="slotDuration"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        minDate={new Date()} // Prevent past dates
                        dateFormat="yyyy-MM-dd"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>
            <button
                onClick={handleGenerateSlot}
                className={`px-4 py-2 rounded ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate Slot'}
            </button>
        </div>
    );
}

export default SlotButton;
