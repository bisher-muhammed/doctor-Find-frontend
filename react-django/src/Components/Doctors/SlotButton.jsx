import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

function SlotButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState(new Date()); // Default to current time
    const [endTime, setEndTime] = useState(new Date()); // Default to current time
    const [duration, setDuration] = useState(30); // Default slot duration
    const [endDate, setEndDate] = useState(new Date()); // Default to current date

    const handleGenerateSlot = async () => {
        setLoading(true);

        const token = localStorage.getItem('access');
        if (!token) {
            toast.error('No authentication token found');
            setLoading(false);
            return;
        }

        // Format the times for backend
        const formatTime = (date) => format(date, "h:mm a");
        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);

        // Format endDate to string
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        // Validate times
        if (startTime >= endTime) {
            toast.error('Start time cannot be after end time');
            setLoading(false);
            return;
        }

        const data = {
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration: duration,
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
                        dateFormat="h:mm aa" // 12-hour format for display
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
                        dateFormat="h:mm aa" // 12-hour format for display
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
