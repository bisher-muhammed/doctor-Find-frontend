import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentRoom } from '../../Redux/ChatSlice'; // Notice we removed setMessages import
import { useNavigate } from 'react-router-dom';

const StartChat = ({ doctorId }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL
  const token = localStorage.getItem('access');

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/api/chats/start_chat/${doctorId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { room_id } = response.data;
   
      // Set current room ID in Redux
      dispatch(setCurrentRoom(room_id));

      // Navigate to chat page
      navigate(`/chats/${room_id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      className="w-full mb-2"
      color="teal"
      disabled={loading}
    >
      {loading ? 'Starting Chat...' : 'Start Chat'}
    </button>
  );
};

export default StartChat;
