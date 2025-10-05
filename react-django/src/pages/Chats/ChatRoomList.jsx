import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { searchItems } from '../../utils/SearchUtils';

function ChatRoomList() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/chats/chatrooms/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRooms(response.data);
        setFilteredRooms(response.data);  // Initialize with all rooms
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token, baseURL]);

  // Apply search functionality on rooms whenever the search term changes
  useEffect(() => {
    const result = searchItems(rooms, searchTerm, ['doctor_first_name']);
    setFilteredRooms(result);
  }, [searchTerm, rooms]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  // Handle chat room navigation
  const handleStartChat = (roomId) => {
    navigate(`/chats/${roomId}`);
  };

  return (
    <div className="container mx-auto shadow-lg rounded-lg">
      {/* Header */}
      <div className="px-5 py-5 flex justify-between items-center bg-white border-b-2">
        <div className="font-semibold text-2xl">Chat Rooms</div>
      </div>

      {/* Chat list */}
      <div className="flex flex-row justify-between bg-white">
        {/* Chat room list */}
        <div className="flex flex-col w-full border-r-2 overflow-y-auto">
          {/* Search component */}
          <div className="border-b-2 py-4 px-2">
            <input
              type="text"
              placeholder="Search chats"
              className="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}  // Update search term
            />
          </div>

          {/* Chat rooms */}
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              // Construct full URL for doctor's profile picture if necessary
              const doctorProfilePic = room.doctor_profile.startsWith('/')
                ? `${baseURL}${room.doctor_profile}`
                : room.doctor_profile;

              return (
                <div
                  key={room.id}
                  onClick={() => handleStartChat(room.id)}
                  className="flex flex-row py-4 px-2 items-center border-b-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="w-1/4">
                    <img
                      src={doctorProfilePic || 'path/to/fallback/image.png'}
                      className="object-cover h-12 w-12 rounded-full"
                      alt="Doctor Profile"
                      onError={(e) => e.target.src = 'path/to/fallback/image.png'}  // Fallback image in case of error
                    />
                  </div>
                  <div className="w-full">
                    <div className="text-lg font-semibold">Dr. {room.doctor_first_name}</div>
                    <span className="text-gray-500">Last message preview...</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">No chat rooms available</div>
          )}
        </div>

        {/* Chat room content placeholder */}
        {/* <div className="w-full p-5">
          <h2 className="text-xl font-semibold">Select a chat to start messaging</h2>
        </div> */}
      </div>
    </div>
  );
}

export default ChatRoomList;
