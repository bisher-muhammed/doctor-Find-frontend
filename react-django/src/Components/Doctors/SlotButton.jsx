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
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [endDate, setEndDate] = useState(new Date());

    const formatDatetime = (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");
    const formatDate = (date) => format(date, 'yyyy-MM-dd');

    const handleGenerateSlot = async () => {
        setLoading(true);

        const token = localStorage.getItem('access');
        if (!token) {
            toast.error('No authentication token found');
            setLoading(false);
            return;
        }

        const formattedStartTime = formatDatetime(new Date(startDate.setHours(startTime.getHours(), startTime.getMinutes())));
        const formattedEndTime = formatDatetime(new Date(startDate.setHours(endTime.getHours(), endTime.getMinutes())));
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        const startDateTime = new Date(`${formattedStartDate}T${startTime.toISOString().split('T')[1]}`);
        const endDateTime = new Date(`${formattedStartDate}T${endTime.toISOString().split('T')[1]}`);
        const currentTime = new Date();

        // Validation checks
        if (!isValid(startDateTime) || !isValid(endDateTime)) {
            toast.error('Invalid date or time');
            setLoading(false);
            return;
        }

        if (isBefore(endDateTime, startDateTime)) {
            toast.error('End time must be after start time');
            setLoading(false);
            return;
        }

        if (isToday(startDateTime) && isBefore(startDateTime, currentTime)) {
            toast.error('Start time cannot be in the past on the current day');
            setLoading(false);
            return;
        }

        const totalDuration = durationHours * 60 + durationMinutes;
        if (totalDuration <= 0) {
            toast.error('Invalid slot duration');
            setLoading(false);
            return;
        }

        const slotDurationMinutes = differenceInMinutes(endDateTime, startDateTime);
        if (slotDurationMinutes < totalDuration) {
            toast.error('The duration cannot exceed the available time between start and end.');
            setLoading(false);
            return;
        }

        const data = {
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration: totalDuration,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
        };

        try {
            // Fetch existing slots for the selected date
            const response = await axios.get(
                "http://127.0.0.1:8000/api/doctors/doctor/slots/",
                {
                    params: { date: formattedStartDate }, // Assuming the API accepts a date parameter
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const existingSlots = response.data.slots || []; // Assuming response contains slots array

            // Check for a slot with the same start time
            const slotWithSameStartTime = existingSlots.some(slot => {
                const existingStart = new Date(slot.start_time).getTime();
                const newStart = startDateTime.getTime();
                return existingStart === newStart; // Check for exact start time match
            });

            if (slotWithSameStartTime) {
                toast.error('A slot already exists with the same start time.');
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
                <div className="flex space-x-2">
                    <div className="w-1/2">
                        <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700">Duration (Hours)</label>
                        <input
                            type="number"
                            id="durationHours"
                            value={durationHours}
                            onChange={(e) => setDurationHours(Number(e.target.value))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            min="0"
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                        <input
                            type="number"
                            id="durationMinutes"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            min="0"
                        />
                    </div>
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
