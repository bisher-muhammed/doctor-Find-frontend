import axios from 'axios';
import React, { useState, useEffect } from 'react';
import moment from 'moment'; // Ensure moment is installed

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/users/my-appointments/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch appointments.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  const formatSlot = (slot) => {
    if (!slot.start_time || !slot.end_time) {
      console.error('Invalid slot time:', slot);
      return { date: 'Invalid Date', timeRange: 'Invalid Time' };
    }

    // Convert to UTC moment objects and format
    const start = moment(slot.start_time);
    const end = moment(slot.end_time);

    const formattedDate = start.format('YYYY-MM-DD');
    const formattedStart = start.format('h:mm A');
    const formattedEnd = end.format('h:mm A');

    return {
      date: formattedDate,
      timeRange: `${formattedStart} - ${formattedEnd}`,
    };
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${baseURL}/api/users/bookings/${id}/update/`, 
        { status: newStatus.toLowerCase() }, // Ensure status is lowercase
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the appointment status in the state
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: newStatus.toLowerCase() }
            : appointment
        )
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setUpdateError('Failed to update appointment status.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Your Appointments</h1>
      {updateError && <p className="text-red-500">{updateError}</p>}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const doctorUsername = appointment.doctor.username || 'N/A';
              const { date, timeRange } = formatSlot(appointment.slots || {});

              return (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{doctorUsername}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{timeRange}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(appointment.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.status.toLowerCase() === 'pending' ? (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
                        className="bg-slate-700 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span>No action</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyAppointments;

