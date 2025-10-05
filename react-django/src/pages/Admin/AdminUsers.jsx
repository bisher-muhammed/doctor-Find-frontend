import React, { useEffect, useState } from 'react';
import { FaUserCheck, FaUserSlash } from 'react-icons/fa';
import axios from 'axios';
import AdminSidebar from "../../Components/Admin/AdminSidebar";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const usersPerPage = 8; // Number of users per page

  const token = localStorage.getItem('access');
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/admin/admin/users_list/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setUsers(response.data);
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
  const toggleActiveStatus = async (userId) => {
    try {
      const response = await axios.post(`${baseURL}/api/admin/admin/users/${userId}/toggle/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedUsers = users.map(user =>
        user.id === userId
          ? { ...user, is_active: response.data.is_active }
          : user
      );
      setUsers(updatedUsers);
    } catch (err) {
      console.error(err);
      setError('Error toggling user status.');
    }
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Get the users for the current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div className="text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div className="p-4 flex-grow">
        <h1 className="text-3xl font-normal mb-4 text-center">List of Users</h1>
        {users.length === 0 ? (
          <p className="text-center">No users found.</p>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md hidden md:table">
              <thead className="bg-slate-400">
                <tr className="text-left text-sm">
                  <th className="py-3 px-4 border-b">Username</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Phone Number</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{user.user?.username || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{user.user?.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{user.user?.phone_number || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`font-semibold ${user.is_active ? 'text-teal-800' : 'text-red-400'}`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b flex items-center justify-center">
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

            <div className="md:hidden">
              {currentUsers.map((user) => (
                <div key={user.id} className="border-b border-gray-300 p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-semibold">{user.user?.username || 'N/A'}</div>
                    <div className="text-sm">{user.user?.email || 'N/A'}</div>
                    <div className="text-sm">{user.user?.phone_number || 'N/A'}</div>
                    <span className={`font-semibold ${user.is_active ? 'text-teal-800' : 'text-red-400'}`}>
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleActiveStatus(user.id)}
                    className={`mt-2 md:mt-0 px-2 py-2 text-white rounded-full ${user.is_active ? 'bg-rose-500 hover:bg-red-600' : 'bg-teal-700 hover:bg-green-400'}`}
                    aria-label={user.is_active ? 'Set Blocked' : 'Set Active'}
                  >
                    {user.is_active ? <FaUserSlash /> : <FaUserCheck />}
                  </button>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
