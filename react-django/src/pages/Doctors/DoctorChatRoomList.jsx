import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRooms } from "../../Redux/ChatSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from '../../Components/Doctors/Header'


function DoctorChatRoomList() {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.chat.rooms);
  const loading = useSelector((state) => state.chat.loading);
  const error = useSelector((state) => state.chat.error);
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL
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
        console.log("Fetched rooms data:", response.data); 
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

  {
    return (
      <div className="container mx-auto shadow-lg rounded-lg overflow-hidden px-2">
        <Header/>
        
        <div className="px-5 py-5 flex justify-between items-center bg-white border-b">
          <div className="font-semibold text-2xl text-gray-700 mt-2">Chat Rooms</div>
        </div>
  
        {/* Chat list */}
        <div className="flex flex-row bg-gray-100">
          {/* Chat room list */}
          <div className="flex flex-col w-full border-r overflow-y-auto">
            {/* Search component */}
            <div className="border-b py-4 px-2 bg-white">
              <input
                type="text"
                placeholder="Search chats"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 px-4 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
  
            {/* Chat rooms */}
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const profilePicUrl = room.patient_profile
                  ? room.patient_profile.startsWith('/')
                    ? `${baseURL}${room.patient_profile}`
                    : room.patient_profile
                  : 'path/to/fallback/image.png'; // Fallback image path
  
                return (
                  <div
                    key={room.id}
                    onClick={() => handleStartChat(room.id)}
                    className="flex items-center py-4 px-4 hover:bg-teal-50 border-b cursor-pointer transition duration-200"
                  >
                    <img
                      src={profilePicUrl}
                      alt="Patient Profile"
                      className="h-12 w-12 rounded-full object-cover mr-4"
                      onError={(e) => (e.target.src = 'path/to/fallback/image.png')} // Fallback in case of error
                    />
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-700">{room.patient_username}</div>
                      <span className="text-gray-500">Last message preview...</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">No chat rooms available</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DoctorChatRoomList;

