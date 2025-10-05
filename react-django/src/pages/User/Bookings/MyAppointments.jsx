import axios from 'axios';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import * as yup from 'yup';
import { FaUserCheck, FaUserSlash, FaSearch, FaCalendarAlt } from 'react-icons/fa';

// Validation schema - updated to handle empty strings properly
const filterSchema = yup.object().shape({
  search: yup.string().max(100, 'Search term too long'),
  startDate: yup.date()
    .nullable()
    .transform((value, originalValue) => {
      // Handle empty strings and null values
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    }),
  endDate: yup.date()
    .nullable()
    .transform((value, originalValue) => {
      // Handle empty strings and null values
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    })
    .when('startDate', (startDate, schema) => {
      return startDate && startDate[0] // startDate is an array in yup 1.x
        ? schema.min(startDate[0], 'End date must be after start date')
        : schema;
    })
});

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // Store all appointments for client-side filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const token = localStorage.getItem('access');

  const fetchAppointments = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // If no filters are applied, fetch all appointments
      if (Object.keys(filterParams).length === 0) {
        const response = await axios.get(`${baseURL}/api/users/my-appointments/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('API Response (all appointments):', response.data);
        setAllAppointments(response.data);
        setAppointments(response.data);
        setCurrentPage(1);
        return;
      }

      // Try server-side filtering first
      const params = new URLSearchParams();
      
      if (filterParams.search) {
        params.append('search', filterParams.search);
      }
      
      if (filterParams.start_date) {
        params.append('start_date', filterParams.start_date);
      }
      
      if (filterParams.end_date) {
        params.append('end_date', filterParams.end_date);
      }

      if (filterParams.status) {
        params.append('status', filterParams.status);
      }

      const queryString = params.toString();
      const url = `${baseURL}/api/users/my-appointments/?${queryString}`;

      console.log('Fetching appointments with URL:', url);
      console.log('Query params:', Object.fromEntries(params));

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('API Response (filtered):', response.data);
      
      // Check if server-side filtering actually worked by comparing results
      const hasFilters = Object.keys(filterParams).length > 0;
      const serverFilteredResults = response.data;
      
      // If we have filters but got the same number of results as all appointments,
      // the server filtering might not be working - use client-side filtering
      if (hasFilters && allAppointments.length > 0 && 
          serverFilteredResults.length === allAppointments.length) {
        console.log('Server filtering seems ineffective, using client-side filtering');
        const filteredAppointments = applyClientSideFilters(allAppointments, filterParams);
        setAppointments(filteredAppointments);
      } else {
        // Server filtering worked or we don't have baseline to compare
        setAppointments(serverFilteredResults);
      }
      
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error response:', error.response?.data);
      
      // If API call fails with filters, try client-side filtering
      if (Object.keys(filterParams).length > 0 && allAppointments.length > 0) {
        console.log('API filtering failed, using client-side filtering');
        const filteredAppointments = applyClientSideFilters(allAppointments, filterParams);
        setAppointments(filteredAppointments);
      } else {
        if (error.response?.status === 400) {
          setError(error.response?.data?.detail || error.response?.data?.message || 'Invalid filter parameters.');
        } else {
          setError('Failed to fetch appointments.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const applyClientSideFilters = (appointmentsList, filterParams) => {
    console.log('Applying client-side filters:', filterParams);
    console.log('Appointments to filter:', appointmentsList);
    
    const filtered = appointmentsList.filter(appointment => {
      // Search filter (doctor name or specialty)
      if (filterParams.search) {
        const searchTerm = filterParams.search.toLowerCase();
        const doctorName = getDoctorName(appointment).toLowerCase();
        const specialty = appointment.doctor?.specification?.toLowerCase() || '';
        
        if (!doctorName.includes(searchTerm) && !specialty.includes(searchTerm)) {
          console.log(`Appointment ${appointment.id} filtered out by search`);
          return false;
        }
      }

      // Status filter
      if (filterParams.status) {
        const appointmentStatus = appointment.status.toLowerCase();
        const filterStatus = filterParams.status.toLowerCase();
        
        if (appointmentStatus !== filterStatus) {
          console.log(`Appointment ${appointment.id} filtered out by status: ${appointmentStatus} !== ${filterStatus}`);
          return false;
        }
      }

      // Date filters
      if (filterParams.start_date || filterParams.end_date) {
        if (appointment.slots && appointment.slots.start_time) {
          const appointmentDate = moment(appointment.slots.start_time).format('YYYY-MM-DD');
          
          if (filterParams.start_date && appointmentDate < filterParams.start_date) {
            console.log(`Appointment ${appointment.id} filtered out by start date`);
            return false;
          }
          
          if (filterParams.end_date && appointmentDate > filterParams.end_date) {
            console.log(`Appointment ${appointment.id} filtered out by end date`);
            return false;
          }
        }
      }

      console.log(`Appointment ${appointment.id} passed all filters`);
      return true;
    });
    
    console.log('Filtered appointments:', filtered);
    return filtered;
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const validateFilters = async (filterData) => {
    try {
      await filterSchema.validate(filterData, { abortEarly: false });
      setValidationErrors({});
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      const errors = {};
      
      // Check if error has inner array (yup validation errors)
      if (error.inner && Array.isArray(error.inner)) {
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
      } else {
        // Handle single error or other error types
        errors.general = error.message || 'Validation failed';
      }
      
      setValidationErrors(errors);
      return false;
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Prepare filter data for validation
    const filterData = {
      search: filters.search,
      startDate: filters.startDate && filters.startDate.trim() ? new Date(filters.startDate) : null,
      endDate: filters.endDate && filters.endDate.trim() ? new Date(filters.endDate) : null
    };

    const isValid = await validateFilters(filterData);
    if (isValid) {
      // Prepare clean filters for API call (only send non-empty values)
      const cleanFilters = {};
      
      if (filters.search && filters.search.trim()) {
        cleanFilters.search = filters.search.trim();
      }
      
      if (filters.startDate && filters.startDate.trim()) {
        cleanFilters.start_date = filters.startDate; // Use snake_case for API
      }
      
      if (filters.endDate && filters.endDate.trim()) {
        cleanFilters.end_date = filters.endDate; // Use snake_case for API
      }
      
      if (filters.status && filters.status.trim()) {
        cleanFilters.status = filters.status.trim();
      }
      
      console.log('Applying filters:', cleanFilters); // Debug log
      
      // Always use client-side filtering for reliability
      if (allAppointments.length > 0) {
        console.log('Using client-side filtering');
        const filteredAppointments = applyClientSideFilters(allAppointments, cleanFilters);
        setAppointments(filteredAppointments);
        setCurrentPage(1);
      } else {
        // Fallback to server-side filtering if we don't have all appointments loaded
        fetchAppointments(cleanFilters);
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setValidationErrors({});
    // Reset to show all appointments
    setAppointments(allAppointments);
    setCurrentPage(1);
  };

  const formatSlot = (slot) => {
    if (!slot || !slot.start_time || !slot.end_time) {
      console.error('Invalid slot time:', slot);
      return { date: 'Invalid Date', timeRange: 'Invalid Time' };
    }

    const start = moment(slot.start_time);
    const end = moment(slot.end_time);

    // Check if moments are valid
    if (!start.isValid() || !end.isValid()) {
      console.error('Invalid moment dates:', { start: slot.start_time, end: slot.end_time });
      return { date: 'Invalid Date', timeRange: 'Invalid Time' };
    }

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
      setUpdateError(null);
      await axios.patch(
        `${baseURL}/api/users/bookings/${id}/update/`,
        { status: newStatus.toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update both appointments and allAppointments arrays
      const updateAppointment = (prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: newStatus.toLowerCase() }
            : appointment
        );
      
      setAppointments(updateAppointment);
      setAllAppointments(updateAppointment);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setUpdateError('Failed to update appointment status.');
    }
  };

  // Helper function to get doctor name from appointment
  const getDoctorName = (appointment) => {
    if (!appointment.doctor) return 'N/A';
    
    const firstName = appointment.doctor.first_name || '';
    const lastName = appointment.doctor.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || appointment.doctor.user?.username || 'N/A';
  };

  // Pagination logic
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(appointments.length / itemsPerPage);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="spinner border-t-4 border-blue-500 w-16 h-16 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-6 text-red-600 text-center py-4">
          Your Appointments
        </h1>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Doctor
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by doctor name or specialty..."
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.search ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.search && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.search}</p>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    id="startDate"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    id="endDate"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                )}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </form>

          {/* Display general validation errors */}
          {validationErrors.general && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {validationErrors.general}
            </div>
          )}
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {updateError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {updateError}
          </div>
        )}
        
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No appointments found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {/* Mobile view */}
            <div className="md:hidden">
              {currentAppointments.map((appointment) => {
                const doctorName = getDoctorName(appointment);
                const { date, timeRange } = formatSlot(appointment.slots);

                return (
                  <div key={appointment.id} className="border-b border-gray-200 p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{doctorName}</h3>
                        {appointment.doctor?.specification && (
                          <p className="text-sm text-gray-600">{appointment.doctor.specification}</p>
                        )}
                        <p className="text-sm text-gray-500">{date}</p>
                        <p className="text-sm text-gray-500">{timeRange}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.status.toLowerCase() === 'pending' && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
                          className="bg-red-500 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block overflow-auto ml-52">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAppointments.map((appointment) => {
                    const doctorName = getDoctorName(appointment);
                    const { date, timeRange } = formatSlot(appointment.slots);

                    return (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{doctorName}</div>
                          {appointment.doctor?.specification && (
                            <div className="text-sm text-gray-500">{appointment.doctor.specification}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeRange}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(appointment.created_at).format('MMM D, YYYY')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {appointment.status.toLowerCase() === 'pending' ? (
                            <button
                              onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
                              className="bg-red-500 text-white text-sm font-medium px-2 py-1.5 rounded-md hover:bg-red-600 transition-colors"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex justify-between w-full">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="hidden sm:flex">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                          currentPage === index + 1
                            ? 'z-10 bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAppointments;