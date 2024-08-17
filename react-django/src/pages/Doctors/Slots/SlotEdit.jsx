import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse, isValid } from 'date-fns';

function SlotEdit({ slotId, onClose }) {
    const [slotData, setSlotData] = useState({
        start_time: '',
        end_time: '',
        end_date: new Date(),
        duration: 30,
        available: true,
    });
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [duration, setDuration] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access'); // Make sure token is available

    useEffect(() => {
        const fetchSlotData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/doctors/doctor/slots/${slotId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                const data = response.data;

                // Check if required data exists in response
                if (data && data.start_time && data.end_time && data.end_date) {
                    const parsedStartTime = parse(data.start_time, 'HH:mm', new Date());
                    const parsedEndTime = parse(data.end_time, 'HH:mm', new Date());
                    const parsedEndDate = new Date(data.end_date);

                    if (isValid(parsedStartTime) && isValid(parsedEndTime) && isValid(parsedEndDate)) {
                        setStartTime(parsedStartTime);
                        setEndTime(parsedEndTime);
                        setEndDate(parsedEndDate);
                        setDuration(data.duration || 30); // Default duration if not provided
                        setSlotData({
                            start_time: format(parsedStartTime, 'HH:mm'),
                            end_time: format(parsedEndTime, 'HH:mm'),
                            end_date: format(parsedEndDate, 'yyyy-MM-dd'),
                            duration: data.duration || 30,
                            available: data.available !== undefined ? data.available : true,
                        });
                    } else {
                        throw new Error('Invalid date data received');
                    }
                } else {
                    throw new Error('Missing required slot data');
                }
            } catch (error) {
                console.error('Error fetching slot data:', error);
                setError('Error fetching slot data. Please check the console for details.');
            } finally {
                setLoading(false);
            }
        };

        fetchSlotData();
    }, [slotId, token]);

    const handleStartTimeChange = (time) => {
        setStartTime(time);
        setSlotData(prev => ({ ...prev, start_time: format(time, 'HH:mm') }));
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
        setSlotData(prev => ({ ...prev, end_time: format(time, 'HH:mm') }));
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        setSlotData(prev => ({ ...prev, end_date: format(date, 'yyyy-MM-dd') }));
    };

    const handleDurationChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setDuration(value);
            setSlotData(prev => ({ ...prev, duration: value }));
        }
    };

    const handleChangeAvailable = (e) => {
        setSlotData(prev => ({ ...prev, available: e.target.checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:8000/api/doctors/doctor/slots/${slotId}/`, slotData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            onClose(); // Close the edit form after successful update
        } catch (error) {
            console.error('Error updating slot:', error);
            setError('Error updating slot. Please check the console for details.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="edit-slot-form">
            <h3>Edit Slot</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Start Time:</label>
                    <DatePicker
                        selected={startTime}
                        onChange={handleStartTimeChange}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeFormat="HH:mm"
                        dateFormat="h:mm aa"
                        className="form-control"
                    />
                </div>
                <div>
                    <label>End Time:</label>
                    <DatePicker
                        selected={endTime}
                        onChange={handleEndTimeChange}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeFormat="HH:mm"
                        dateFormat="h:mm aa"
                        className="form-control"
                    />
                </div>
                <div>
                    <label>End Date:</label>
                    <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                    />
                </div>
                <div>
                    <label>Duration (minutes):</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={handleDurationChange}
                        min="1"
                        className="form-control"
                    />
                </div>
                <div>
                    <label>Available:</label>
                    <input
                        type="checkbox"
                        checked={slotData.available}
                        onChange={handleChangeAvailable}
                    />
                </div>
                <button type="submit">Update Slot</button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default SlotEdit;
