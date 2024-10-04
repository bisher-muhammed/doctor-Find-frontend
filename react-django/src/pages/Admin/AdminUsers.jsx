import React, { useEffect, useState } from 'react';
import { FaUserCheck, FaUserSlash } from 'react-icons/fa'; // Importing icons
import axios from 'axios';

function AdminUsers() {
  const [users, setUsers] = useState([]); // Users state
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const token = localStorage.getItem('access'); // Fetching token from localStorage
  const baseURL = 'http://127.0.0.1:8000'; // Base URL for API calls

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/admin/admin/users_list/`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Authorization header with JWT token
          }
        });
        console.log(response.data); // Check if this logs the correct 'is_active' value
        setUsers(response.data); // Update users state
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error fetching users list. Please check your network or authorization.');
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [token]);
  
  
  // Toggle the active status of a user
  // Toggle the active status of a user
const toggleActiveStatus = async (userId) => {
    try {
      const response = await axios.post(`${baseURL}/api/admin/admin/users/${userId}/toggle/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}` // Authorization header with token
        }
      });
  
      // Update the specific user's is_active status in the state
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, is_active: response.data.is_active } // Create a new object for the updated user
          : user
      );
      setUsers(updatedUsers); // Update state with the new array
    } catch (err) {
      console.error(err);
      setError('Error toggling user status.');
    }
  };
  

  if (loading) {
    return <div className="text-center">Loading users...</div>; // Loading state
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>; // Error state
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-normal mb-4 text-center">List of Users</h1>
      {users.length === 0 ? (
        <p className="text-center">No users found.</p> // If no users are found
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-slate-400">
              <tr>
                <th className="py-3 px-4 border-b text-left">Username</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
                <th className="py-3 px-4 border-b text-left">Phone Number</th>
                <th className="py-3 px-4 border-b text-left">Status</th>
                <th className="py-3 px-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.user?.username || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{user.user?.email || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{user.user?.phone_number || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">
                  <span className={`font-semibold ${user.is_active ? 'text-teal-800' : 'text-red-400'}`}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                  </td>
                  <td className="py-2 px-4 border-b flex items-center space-x-2">
                  <button 
                    onClick={() => toggleActiveStatus(user.id)}
                    className={`px-2 py-2 text-white rounded-full ${user.is_active ? 'bg-rose-500 hover:bg-red-600' : 'bg-teal-700 hover:bg-green-400'}`}
                    aria-label={user.is_active ? 'Set Blocked' : 'Set Active'}
                  >
                    {user.is_active ? <FaUserSlash /> : <FaUserCheck />}
                  </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
