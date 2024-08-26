import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isValid, isAfter, isBefore, differenceInMinutes, isToday } from 'date-fns';

function SlotButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [duration, setDuration] = useState(30);
    const [endDate, setEndDate] = useState(new Date());

    const formatDatetime = (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss"); // Format as 'YYYY-MM-DDTHH:mm:ss'
    const formatDate = (date) => format(date, 'yyyy-MM-dd'); // Format date as 'YYYY-MM-DD'

    const handleGenerateSlot = async () => {
        setLoading(true);

        const token = localStorage.getItem('access');
        if (!token) {
            toast.error('No authentication token found');
            setLoading(false);
            return;
        }

        // Combine date and time
        const formattedStartTime = formatDatetime(new Date(startDate.setHours(startTime.getHours(), startTime.getMinutes())));
        const formattedEndTime = formatDatetime(new Date(startDate.setHours(endTime.getHours(), endTime.getMinutes())));
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        console.log("Formatted Start Time (UTC):", formattedStartTime);
        console.log("Formatted End Time (UTC):", formattedEndTime);
        console.log("Start Date:", formattedStartDate);
        console.log("End Date:", formattedEndDate);

        // Validation
        const startDateTime = new Date(`${formattedStartDate}T${startTime.toISOString().split('T')[1]}`);
        const endDateTime = new Date(`${formattedStartDate}T${endTime.toISOString().split('T')[1]}`);
        const endFullDateTime = new Date(`${formattedEndDate}T${endTime.toISOString().split('T')[1]}`);
        const currentTime = new Date();

        if (!isValid(startDateTime) || !isValid(endDateTime) || !isValid(endFullDateTime)) {
            toast.error('Invalid date or time');
            setLoading(false);
            return;
        }

        if (isBefore(endDateTime, startDateTime)) {
            toast.error('End time must be after start time');
            setLoading(false);
            return;
        }

        if (isBefore(new Date(`${formattedEndDate}T23:59:59`), startDateTime)) {
            toast.error('End date must be after start date');
            setLoading(false);
            return;
        }

        if (isToday(startDateTime) && isBefore(startDateTime, currentTime)) {
            toast.error('Start time cannot be in the past on the current day');
            setLoading(false);
            return;
        }

        const slotDurationMinutes = differenceInMinutes(endDateTime, startDateTime); // Duration in minutes
        if (duration <= 0 || duration > slotDurationMinutes) {
            toast.error('Invalid slot duration');
            setLoading(false);
            return;
        }

        const data = {
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration: duration,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
        };

        console.log('Payload being sent:', data);

        try {
            // Check if slot already exists
            const response = await axios.get(
                "http://127.0.0.1:8000/api/doctors/doctor/slots/",
                {
                    params: {
                        start_time: formattedStartTime,
                        end_time: formattedEndTime,
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.exists) {
                toast.error('Slot already exists');
                setLoading(false);
                return;
            }

            // Create the slot
            const createResponse = await axios.post(
                "http://127.0.0.1:8000/api/doctors/doctor/generate_slots/",
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (createResponse.status === 201) {
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
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        minDate={new Date()} // Disable past dates
                        dateFormat="yyyy-MM-dd"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
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
                        min="1"
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
                <button
                    onClick={handleGenerateSlot}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Slots'}
                </button>
            </div>
        </div>
    );
}

export default SlotButton;
