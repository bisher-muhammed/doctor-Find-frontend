import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRooms, setLoading, setError } from "../../Redux/ChatSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from '../../Components/Doctors/Header';

function DoctorChatRoomList() {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.chat.rooms);
  const loading = useSelector((state) => state.chat.loading);
  const error = useSelector((state) => state.chat.error);
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const token = localStorage.getItem('access');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      setLocalLoading(true);
      dispatch(setLoading(true));
      
      const response = await axios.get(`${baseURL}/api/doctors/doctor/chat-rooms/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Fetched rooms data:", response.data); 
      dispatch(setRooms(response.data));
      dispatch(setError(null));
    } catch (err) {
      console.error('Error fetching rooms:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to load chat rooms'));
    } finally {
      dispatch(setLoading(false));
      setLocalLoading(false);
    }
  }, [dispatch, token, baseURL]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleStartChat = (roomId) => {
    navigate(`/doctor/messages/${roomId}`);
  };

  const handleRefresh = () => {
    fetchRooms();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.patient_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.patient_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort rooms by last activity (you might want to add last_message_timestamp to your room object)
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    return new Date(b.last_activity || b.created_at) - new Date(a.last_activity || a.created_at);
  });

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';
  };

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Chat Rooms</h1>
                <p className="text-gray-600 mt-1">Manage your patient conversations</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={localLoading}
                className="mt-3 sm:mt-0 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                {localLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={() => dispatch(setError(null))}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {sortedRooms.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {sortedRooms.map((room) => {
                const profilePicUrl = room.patient_profile
                  ? room.patient_profile.startsWith('/')
                    ? `${baseURL}${room.patient_profile}`
                    : room.patient_profile
                  : null;

                return (
                  <div
                    key={room.id}
                    onClick={() => handleStartChat(room.id)}
                    className="flex items-center p-4 hover:bg-teal-50 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="relative">
                      {profilePicUrl ? (
                        <img
                          src={profilePicUrl}
                          alt="Patient Profile"
                          className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-white group-hover:border-teal-200 transition-colors duration-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`h-12 w-12 rounded-full mr-4 bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold border-2 border-white group-hover:border-teal-200 transition-colors duration-200 ${profilePicUrl ? 'hidden' : 'flex'}`}
                      >
                        {getInitials(room.patient_username)}
                      </div>
                      {room.is_online && (
                        <div className="absolute bottom-0 left-8 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {room.patient_username}
                        </h3>
                        <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                          {formatLastActivity(room.last_activity)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm truncate mt-1">
                        {room.last_message || "No messages yet"}
                      </p>
                    </div>
                    
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat rooms found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchTerm ? 'No patients match your search criteria.' : 'You don\'t have any active chat rooms with patients yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Loading overlay for refresh */}
        {localLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mr-3"></div>
              <span className="text-gray-700">Updating chat rooms...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorChatRoomList;
