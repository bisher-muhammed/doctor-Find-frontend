import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCheck, FaUserSlash } from 'react-icons/fa'; // Importing icons
import AdminSidebar from "../../Components/Admin/AdminSidebar";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access');
  const baseURL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/admin/admin/doctors_list/`, {
          headers: {
            'Authorization': `Bearer ${token}` // Pass token in Authorization header
          }
        });
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error fetching doctors list. Please check your network or authorization.');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [token]);

  const toggleActiveStatus = async (doctorId) => {
    try {
      const response = await axios.post(`${baseURL}/api/admin/admin/doctors/${doctorId}/toggle/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedDoctor = { ...doctors.find(doctor => doctor.id === doctorId), is_active: response.data.is_active };
      const updatedDoctors = doctors.map(doctor => doctor.id === doctorId ? updatedDoctor : doctor);
      setDoctors(updatedDoctors);
    } catch (err) {
      console.error(err);
      setError('Error toggling doctor status.');
    }
  };

  if (loading) {
    return <div className="text-center">Loading doctors...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div className="p-4 flex-grow">
        <h1 className="text-3xl font-normal mb-4 text-center">List of Doctors</h1>
        {doctors.length === 0 ? (
          <p className="text-center">No doctors found.</p>
        ) : (
          <div className="overflow-hidden"> {/* Use overflow-hidden to avoid scroll */}
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md hidden md:table"> {/* Show table on medium screens and above */}
              <thead className="bg-slate-400">
                <tr>
                  <th className="py-3 px-4 border-b text-left">First Name</th>
                  <th className="py-3 px-4 border-b text-left">Last Name</th>
                  <th className="py-3 px-4 border-b text-left">Specification</th>
                  <th className="py-3 px-4 border-b text-left">Email</th>
                  <th className="py-3 px-4 border-b text-left">Experience</th>
                  <th className="py-3 px-4 border-b text-left">Status</th>
                  <th className="py-3 px-4 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">Dr: {doctor.first_name}</td>
                    <td className="py-2 px-4 border-b">{doctor.last_name}</td>
                    <td className="py-2 px-4 border-b">{doctor.specification}</td>
                    <td className="py-2 px-4 border-b">{doctor.email}</td>
                    <td className="py-2 px-4 border-b">{doctor.experience}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`font-semibold ${doctor.is_active ? 'text-teal-800' : 'text-red-400'}`}>
                        {doctor.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b flex items-center space-x-2">
                      <button 
                        onClick={() => toggleActiveStatus(doctor.id)}
                        className={`px-2 py-2 text-white rounded-full ${doctor.is_active ? 'bg-rose-500 hover:bg-red-600' : 'bg-teal-700 hover:bg-green-400'}`}
                        aria-label={doctor.is_active ? 'Set Blocked' : 'Set Active'}
                      >
                        {doctor.is_active ? <FaUserSlash /> : <FaUserCheck />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Responsive layout for smaller screens */}
            <div className="md:hidden"> {/* Hide the original table on small screens */}
              {doctors.map((doctor) => (
                <div key={doctor.id} className="border-b border-gray-300 p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-semibold">Dr: {doctor.first_name} {doctor.last_name}</div>
                    <div className="text-sm">{doctor.specification}</div>
                    <div className="text-sm">{doctor.email}</div>
                    <div className="text-sm">{doctor.experience}</div>
                    <span className={`font-semibold ${doctor.is_active ? 'text-teal-800' : 'text-red-400'}`}>
                      {doctor.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleActiveStatus(doctor.id)}
                    className={`mt-2 md:mt-0 px-2 py-2 text-white rounded-full ${doctor.is_active ? 'bg-rose-500 hover:bg-red-600' : 'bg-teal-700 hover:bg-green-400'}`}
                    aria-label={doctor.is_active ? 'Set Blocked' : 'Set Active'}
                  >
                    {doctor.is_active ? <FaUserSlash /> : <FaUserCheck />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDoctors;

