import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import AdminSidebar from '../../Components/Admin/AdminSidebar';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 8;

  const navigate = useNavigate();
  const token = localStorage.getItem('access');
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL 

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchCompletedBookings();
    }
  }, [token, navigate]);

  const fetchCompletedBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/admin/admin/bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedBookings = Array.isArray(response.data)
        ? response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setBookings(sortedBookings);
      setFilteredBookings(sortedBookings);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Unauthorized access. Please log in again.');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch completed bookings. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setDoctorName(value);
    setCurrentPage(1);

    const filtered = bookings.filter((booking) =>
      booking.doctor.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBookings(filtered);
  };

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-row min-h-screen bg-gray-100 text-gray-800">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold mb-6 text-center">Bookings</h2>

          <input
            type="text"
            value={doctorName}
            onChange={handleFilterChange}
            placeholder="Filter by Doctor's Name"
            className="mb-4 p-2 border border-gray-300 rounded w-full md:w-1/2"
          />

          {loading && <p className="text-blue-500">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {currentBookings.length > 0 ? (
            <>
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md hidden md:table">
                <thead className="bg-slate-400">
                  <tr className="text-left text-sm">
                    <th className="py-3 px-4 border-b">Booking ID</th>
                    <th className="py-3 px-4 border-b">User</th>
                    <th className="py-3 px-4 border-b">Doctor</th>
                    <th className="py-3 px-4 border-b">Date</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{booking.id}</td>
                      <td className="py-2 px-4 border-b">
                        {booking.user?.username || booking.user?.email || booking.user?.phone_number}
                      </td>
                      <td className="py-2 px-4 border-b">{booking.doctor.username}</td>
                      <td className="py-2 px-4 border-b">
                        {moment(booking.created_at).format('MMMM Do YYYY, h:mm A')}
                      </td>
                      <td className="py-2 px-4 border-b">{booking.status}</td>
                      <td className="py-2 px-4 border-b">{booking.slots.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile View */}
              <div className="md:hidden">
                {currentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border-b border-gray-300 p-4 flex flex-col justify-between hover:bg-gray-50"
                  >
                    <div className="font-semibold">Booking ID: {booking.id}</div>
                    <div className="text-sm">User: {booking.user?.username || booking.user?.email || booking.user?.phone_number}</div>
                    <div className="text-sm">Doctor: {booking.doctor.username}</div>
                    <div className="text-sm">Date: {moment(booking.created_at).format('MMMM Do YYYY, h:mm A')}</div>
                    <div className="text-sm text-yellow-500">Amount: {booking.slots.amount}</div>
                    <div className={`font-semibold ${booking.status === 'Completed' ? 'text-teal-800' : 'text-red-400'}`}>
                      Status: {booking.status}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-4">
                <nav>
                  <ul className="inline-flex">
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i}>
                        <button
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-4 py-2 mx-1 border ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </>
          ) : (
            !loading && <p className="text-gray-500">No completed bookings found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBookings;
