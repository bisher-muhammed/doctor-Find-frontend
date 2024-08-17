import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";

function SlotButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('13:00');
    const [duration, setDuration] = useState(30);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const handleGenerateSlot = async () => {
        setLoading(true);

        const token = localStorage.getItem('access');
        if (!token) {
            toast.error('No authentication token found');
            setLoading(false);
            return;
        }

        // Convert startTime and endTime from 24-hour to 12-hour format for display
        const formattedStartTime = moment(startTime, "HH:mm").format("h:mm A");
        const formattedEndTime = moment(endTime, "HH:mm").format("h:mm A");

        // Convert the 12-hour formatted time back to 24-hour format for backend
        const startTime24Hour = moment(formattedStartTime, "h:mm A").format("HH:mm");
        const endTime24Hour = moment(formattedEndTime, "h:mm A").format("HH:mm");

        if (moment(startTime24Hour, "HH:mm").isAfter(moment(endTime24Hour, "HH:mm"))) {
            toast.error('Start time cannot be after end time');
            setLoading(false);
            return;
        }

        const data = {
            start_time: startTime24Hour, // 24-hour formatted time for backend
            end_time: endTime24Hour, // 24-hour formatted time for backend
            slot_duration: duration,
            end_date: endDate
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
                    <input
                        type="time"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                        type="time"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
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
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
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
