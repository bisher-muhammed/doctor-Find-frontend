import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRooms } from "../../Redux/ChatSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function DoctorChatRoomList() {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.chat.rooms);
  const loading = useSelector((state) => state.chat.loading);
  const error = useSelector((state) => state.chat.error);
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/doctors/doctor/chat-rooms/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        dispatch(setRooms(response.data));
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    };

    fetchRooms();
  }, [dispatch, token, baseURL]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  // Handle chat room navigation
  const handleStartChat = (roomId) => {
    navigate(`/doctor/messages/${roomId}`);
  };

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.patient_username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto shadow-lg rounded-lg">
      
      
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
            />
          </div>
          {/* Chat rooms */}
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              // Construct full URL for profile picture if necessary
              const profilePicUrl = room.patient_profile
                ? room.patient_profile.startsWith('/')
                  ? `${baseURL}${room.patient_profile}`
                  : room.patient_profile
                : 'path/to/fallback/image.png'; // Fallback image path

              return (
                <div
                  key={room.id}
                  onClick={() => handleStartChat(room.id)}
                  className="flex flex-row py-4 px-2 items-center border-b-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="w-1/4">
                    <img
                      src={profilePicUrl} // Handle image URL and fallback
                      className="object-cover h-12 w-12 rounded-full"
                      alt="Patient Profile"
                      onError={(e) => (e.target.src = 'path/to/fallback/image.png')} // Fallback in case of error
                    />
                  </div>
                  <div className="w-full">
                    <div className="text-lg font-semibold">{room.patient_username}</div> {/* Display patient's username */}
                    <span className="text-gray-500">Last message preview...</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">No chat rooms available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorChatRoomList;

