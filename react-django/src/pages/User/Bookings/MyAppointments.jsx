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
      await axios.patch(
        `${baseURL}/api/users/bookings/${id}/update/`,
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner border-t-4 border-blue-500 w-16 h-16 rounded-full animate-spin"></div>
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 text-center">
        Your Appointments
      </h1>
      {updateError && <p className="text-red-500 text-center">{updateError}</p>}
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found.</p>
      ) : (
        <div className="w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto mt-8 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Slot Date
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Time Range
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Update Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const doctorUsername = appointment.doctor.username || 'N/A';
                  const { date, timeRange } = formatSlot(appointment.slots || {});

                  return (
                    <tr
                      key={appointment.id}
                      className={`hover:bg-gray-100 ${
                        appointment.status === 'cancelled' ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base">
                        {doctorUsername}
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base">
                        {date}
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base">
                        {timeRange}
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base">
                        {new Date(appointment.created_at).toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm lg:text-base">
                        {appointment.status.toLowerCase() === 'pending' ? (
                          <button
                            onClick={() =>
                              handleStatusChange(appointment.id, 'Cancelled')
                            }
                            className="bg-red-500 text-white font-semibold py-1 sm:py-2 px-2 sm:px-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-gray-400">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
