import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isValid, isAfter, isBefore, differenceInMinutes, isToday, addDays } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';

function SlotButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('single'); // 'single' or 'recurring'
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [endDate, setEndDate] = useState(addDays(new Date(), 7));
    const [selectedDays, setSelectedDays] = useState([]);
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

    const weekDays = [
        { id: 0, label: 'Sun', full: 'Sunday' },
        { id: 1, label: 'Mon', full: 'Monday' },
        { id: 2, label: 'Tue', full: 'Tuesday' },
        { id: 3, label: 'Wed', full: 'Wednesday' },
        { id: 4, label: 'Thu', full: 'Thursday' },
        { id: 5, label: 'Fri', full: 'Friday' },
        { id: 6, label: 'Sat', full: 'Saturday' }
    ];

    const formatDatetime = (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");
    const formatDate = (date) => format(date, 'yyyy-MM-dd');

    // Calculate total duration in minutes
    const totalDuration = durationHours * 60 + durationMinutes;

    // Calculate time difference between start and end time
    const timeDifference = differenceInMinutes(endTime, startTime);

    // Calculate estimated slots
    const estimatedSlots = timeDifference > 0 ? Math.floor(timeDifference / totalDuration) : 0;

    // Toggle day selection for recurring slots
    const toggleDaySelection = (dayId) => {
        setSelectedDays(prev => 
            prev.includes(dayId) 
                ? prev.filter(id => id !== dayId)
                : [...prev, dayId]
        );
    };

    // Frontend validation function
    const validateForm = () => {
        // Check if start date is after end date for recurring slots
        if (activeTab === 'recurring' && isAfter(startDate, endDate)) {
            toast.error('End date must be greater than or equal to start date');
            return false;
        }

        // Check if end time is before or equal to start time
        if (isBefore(endTime, startTime) || endTime.getTime() === startTime.getTime()) {
            toast.error('End time must be after start time');
            return false;
        }

        // Check duration
        if (totalDuration < 20) {
            toast.error('Duration must be at least 20 minutes');
            return false;
        }

        // Check if time range is sufficient for at least one slot
        if (timeDifference < totalDuration) {
            toast.error('Time range is too short for the specified duration');
            return false;
        }

        // Check if start date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedStartDate = new Date(startDate);
        selectedStartDate.setHours(0, 0, 0, 0);
        
        if (isBefore(selectedStartDate, today)) {
            toast.error('Cannot create slots for past dates');
            return false;
        }

        // For recurring slots, check if days are selected
        if (activeTab === 'recurring' && selectedDays.length === 0) {
            toast.error('Please select at least one day for recurring slots');
            return false;
        }

        return true;
    };

    // Function to handle backend validation errors
    const handleBackendErrors = (error) => {
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            
            if (errorData.non_field_errors) {
                errorData.non_field_errors.forEach(errorMsg => {
                    toast.error(errorMsg);
                });
                return;
            }
            
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

        const data = {
            start_time: formatDatetime(new Date(startDate.setHours(startTime.getHours(), startTime.getMinutes()))),
            end_time: formatDatetime(new Date(startDate.setHours(endTime.getHours(), endTime.getMinutes()))),
            duration: totalDuration,
            start_date: formatDate(startDate),
            end_date: activeTab === 'single' ? formatDate(startDate) : formatDate(endDate),
            recurring_days: activeTab === 'recurring' ? selectedDays : [],
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
                setTimeout(() => {
                    navigate('/doctor/Slots/Slots');
                }, 1500);
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

    // Handle end date change
    const handleEndDateChange = (date) => {
        if (date && isBefore(date, startDate)) {
            toast.warning('End date cannot be before start date');
            return;
        }
        setEndDate(date);
    };

    // Handle start date change
    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date && endDate && isBefore(endDate, date)) {
            setEndDate(date);
        }
    };

    // Quick duration presets
    const durationPresets = [
        { label: '30 min', hours: 0, minutes: 30 },
        { label: '45 min', hours: 0, minutes: 45 },
        { label: '1 hour', hours: 1, minutes: 0 },
        { label: '1.5 hours', hours: 1, minutes: 30 },
        { label: '2 hours', hours: 2, minutes: 0 },
    ];

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl mt-8 p-8 border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Time Slots</h2>
                <p className="text-gray-600">Schedule appointments for your patients</p>
            </div>

            {/* Tab Selection */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                        activeTab === 'single' 
                            ? 'bg-white text-teal-700 shadow-sm' 
                            : 'text-gray-600 hover:text-teal-600'
                    }`}
                    onClick={() => setActiveTab('single')}
                >
                    Single Day
                </button>
                <button
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                        activeTab === 'recurring' 
                            ? 'bg-white text-teal-700 shadow-sm' 
                            : 'text-gray-600 hover:text-teal-600'
                    }`}
                    onClick={() => setActiveTab('recurring')}
                >
                    Recurring
                </button>
            </div>

            <div className="space-y-6">
                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {activeTab === 'single' ? 'Appointment Date' : 'Start Date'}
                        </label>
                        <DatePicker 
                            selected={startDate} 
                            onChange={handleStartDateChange} 
                            minDate={new Date()} 
                            dateFormat="MMMM d, yyyy" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                            popperPlacement="bottom-start"
                        />
                    </div>
                    
                    {activeTab === 'recurring' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Date
                            </label>
                            <DatePicker 
                                selected={endDate} 
                                onChange={handleEndDateChange} 
                                minDate={startDate}
                                dateFormat="MMMM d, yyyy" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                                popperPlacement="bottom-start"
                            />
                        </div>
                    )}
                </div>

                {/* Day Selection for Recurring Slots */}
                {activeTab === 'recurring' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Repeat On Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {weekDays.map(day => (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleDaySelection(day.id)}
                                    className={`px-4 py-2 rounded-lg border transition-all ${
                                        selectedDays.includes(day.id)
                                            ? 'bg-teal-100 border-teal-500 text-teal-700 font-medium'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-teal-300'
                                    }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Time
                        </label>
                        <DatePicker 
                            selected={startTime} 
                            onChange={setStartTime} 
                            showTimeSelect 
                            showTimeSelectOnly 
                            timeIntervals={15} 
                            dateFormat="h:mm aa" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Time
                        </label>
                        <DatePicker 
                            selected={endTime} 
                            onChange={setEndTime} 
                            showTimeSelect 
                            showTimeSelectOnly 
                            timeIntervals={15} 
                            dateFormat="h:mm aa" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                        />
                    </div>
                </div>

                {/* Duration Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Slot Duration
                    </label>
                    
                    {/* Quick Presets */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            QUICK PRESETS
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {durationPresets.map(preset => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                        setDurationHours(preset.hours);
                                        setDurationMinutes(preset.minutes);
                                    }}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                        durationHours === preset.hours && durationMinutes === preset.minutes
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-teal-300'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Duration Input */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                HOURS
                            </label>
                            <input 
                                type="number" 
                                value={durationHours} 
                                onChange={(e) => setDurationHours(Math.max(0, Number(e.target.value)))} 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                                min="0" 
                                max="23"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                MINUTES
                            </label>
                            <input 
                                type="number" 
                                value={durationMinutes} 
                                onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, Number(e.target.value))))} 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                                min="0" 
                                max="59"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                        <p><span className="font-medium">Duration:</span> {durationHours}h {durationMinutes}m</p>
                        <p><span className="font-medium">Time Range:</span> {format(startTime, 'h:mm aa')} - {format(endTime, 'h:mm aa')}</p>
                        {activeTab === 'single' ? (
                            <p><span className="font-medium">Date:</span> {format(startDate, 'MMMM d, yyyy')}</p>
                        ) : (
                            <p><span className="font-medium">Period:</span> {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}</p>
                        )}
                        <p><span className="font-medium">Estimated Slots:</span> {estimatedSlots} per day</p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                    <button 
                        type="button" 
                        onClick={handleGenerateSlot} 
                        disabled={loading} 
                        className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Slots...
                            </span>
                        ) : (
                            `Create ${estimatedSlots > 0 ? estimatedSlots + ' ' : ''}Slot${estimatedSlots !== 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            </div>

            <ToastContainer 
                position="top-right" 
                autoClose={5000} 
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

export default SlotButton;
