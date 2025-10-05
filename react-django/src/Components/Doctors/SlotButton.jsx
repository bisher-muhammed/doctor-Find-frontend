import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isValid, isAfter, isBefore, differenceInMinutes, isToday } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';

function SlotButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [endDate, setEndDate] = useState(new Date());
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

    const formatDatetime = (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");
    const formatDate = (date) => format(date, 'yyyy-MM-dd');

    // Frontend validation function
    const validateForm = () => {
        // Check if start date is after end date
        if (isAfter(startDate, endDate)) {
            toast.error('End date must be greater than or equal to start date');
            return false;
        }

        // Check if end time is before start time
        if (isBefore(endTime, startTime)) {
            toast.error('End time must be after start time');
            return false;
        }

        // Check duration
        const totalDuration = durationHours * 60 + durationMinutes;
        if (totalDuration <= 20) {
            toast.error('Duration must be greater than or equql to 20');
            return false;
        }

        // Check if start date is in the past (but allow today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedStartDate = new Date(startDate);
        selectedStartDate.setHours(0, 0, 0, 0);
        
        if (isBefore(selectedStartDate, today)) {
            toast.error('Cannot create slots for past dates');
            return false;
        }

        return true;
    };

    // Function to handle backend validation errors
    const handleBackendErrors = (error) => {
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            
            // Handle non_field_errors (from validate method)
            if (errorData.non_field_errors) {
                errorData.non_field_errors.forEach(errorMsg => {
                    toast.error(errorMsg);
                });
                return;
            }
            
            // Handle field-specific errors
            const errorFields = Object.keys(errorData);
            errorFields.forEach(field => {
                if (Array.isArray(errorData[field])) {
                    errorData[field].forEach(errorMsg => {
                        toast.error(`${field}: ${errorMsg}`);
                    });
                } else {
                    toast.error(`${field}: ${errorData[field]}`);
                }
            });
        } else {
            toast.error(`Error generating slot: ${error.message}`);
        }
    };

    const handleGenerateSlot = async () => {
        // Perform frontend validation first
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const token = localStorage.getItem('access');
        if (!token) {
            toast.error('No authentication token found');
            setLoading(false);
            return;
        }

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        const formattedStartTime = formatDatetime(new Date(startDate.setHours(startTime.getHours(), startTime.getMinutes())));
        const formattedEndTime = formatDatetime(new Date(startDate.setHours(endTime.getHours(), endTime.getMinutes())));

        const totalDuration = durationHours * 60 + durationMinutes;

        const data = {
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration: totalDuration,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
        };

        try {
            const response = await axios.post(
                `${baseURL}/api/doctors/doctor/generate_slots/`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 201) {
                const slotsCreated = response.data.slots_created || 0;
                toast.success(`Successfully created ${slotsCreated} slot(s)`);
                navigate('/doctor/Slots/Slots');
            } else {
                toast.error('Failed to create slot');
            }
        } catch (error) {
            console.error('Error details:', error.response?.data);
            handleBackendErrors(error);
        } finally {
            setLoading(false);
        }
    };

    // Handle end date change to ensure it's not before start date
    const handleEndDateChange = (date) => {
        if (date && isBefore(date, startDate)) {
            toast.warning('End date cannot be before start date');
            return;
        }
        setEndDate(date);
    };

    // Handle start date change to ensure end date is adjusted if needed
    const handleStartDateChange = (date) => {
        setStartDate(date);
        // If end date is before new start date, update end date
        if (date && endDate && isBefore(endDate, date)) {
            setEndDate(date);
            toast.info('End date updated to match start date');
        }
    };

    return (
        <div className="max-w-2xl mx-auto pl-16  md:pl-24 bg-white shadow-lg rounded-lg mt-10 pr-6">
            <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">Create Slots</h2>
            <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-gray-50">
                <div>
                    <label className="block text-sm font-medium text-gray-600">Start Date</label>
                    <DatePicker 
                        selected={startDate} 
                        onChange={handleStartDateChange} 
                        minDate={new Date()} 
                        dateFormat="yyyy-MM-dd" 
                        className="w-full p-2 border rounded" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600">Start Time</label>
                    <DatePicker 
                        selected={startTime} 
                        onChange={setStartTime} 
                        showTimeSelect 
                        showTimeSelectOnly 
                        timeIntervals={15} 
                        dateFormat="h:mm aa" 
                        className="w-full p-2 border rounded" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600">End Time</label>
                    <DatePicker 
                        selected={endTime} 
                        onChange={setEndTime} 
                        showTimeSelect 
                        showTimeSelectOnly 
                        timeIntervals={15} 
                        dateFormat="h:mm aa" 
                        className="w-full p-2 border rounded" 
                    />
                </div>
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-600">Duration (Hours)</label>
                        <input 
                            type="number" 
                            value={durationHours} 
                            onChange={(e) => setDurationHours(Number(e.target.value))} 
                            className="w-full p-2 border rounded" 
                            min="0" 
                            max="23"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-600">Duration (Minutes)</label>
                        <input 
                            type="number" 
                            value={durationMinutes} 
                            onChange={(e) => setDurationMinutes(Number(e.target.value))} 
                            className="w-full p-2 border rounded" 
                            min="0" 
                            max="59"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600">End Date</label>
                    <DatePicker 
                        selected={endDate} 
                        onChange={handleEndDateChange} 
                        minDate={startDate} // Prevent selecting date before start date
                        dateFormat="yyyy-MM-dd" 
                        className="w-full p-2 border rounded" 
                    />
                </div>
            </div>
            <div className="flex justify-center mt-6">
                <button 
                    type="button" 
                    onClick={handleGenerateSlot} 
                    disabled={loading} 
                    className="px-6 py-2 bg-teal-950 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Create Slot'}
                </button>
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
}

export default SlotButton;