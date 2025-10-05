import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import UserHeader from '../../Components/Chat/UserHeader';
import CallModel from "../../Components/Chat/CallModel";
import Header from '../../Components/Doctors/Header';
import DoctorMessageInput from './DoctorMessageInput';

const DoctorChatComponent = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [callId, setCallId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('access');
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const scrollRef = useRef(null);
  const socket = useRef(null);
  const user = useRef(null);
  const navigate = useNavigate();

  // Initialize user from token
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        user.current = decodedToken.user_id;
        setLoading(false);
      } catch (error) {
        console.error('Invalid token:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  // Reset states when roomId changes
  useEffect(() => {
    setMessages([]);
    setShowModal(false);
    setCallId(null);
    setSocketConnected(false);
  }, [roomId]);

  // Initialize socket connection
  useEffect(() => {
    if (!roomId || !user.current) return;
    
    // Cleanup previous socket if exists
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
    
    socket.current = io(baseURL, { transports: ['websocket'] });
    
    socket.current.on('connect', () => {
      console.log('Socket connected for room:', roomId);
      setSocketConnected(true);
      socket.current.emit('join_room', { room_id: roomId, user_id: user.current });
    });
    
    socket.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });
    
    socket.current.on('receive_message', (data) => {
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      setSocketConnected(false);
    };
  }, [roomId, baseURL]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial messages
  useEffect(() => {
    if (!roomId || !token) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/chats/chat_rooms/${roomId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, [roomId, token, baseURL]);

  // Handle incoming call messages
  useEffect(() => {
    if (!roomId || !user.current || !socket.current) return;

    const handleAudioMessage = (data) => {
      console.log('Received audio message:', data);

      if (data.content === "Calling") {
        setCallId(data.callId);
        setShowModal(true);
      }

      if (data.content === "call_declined") {
        alert("The call was declined.");
        setShowModal(false);
      }
    };

    socket.current.on("receive_message", handleAudioMessage);

    return () => {
      if (socket.current) {
        socket.current.off("receive_message", handleAudioMessage);
      }
    };
  }, [roomId, socket.current]);

  // Generate random ID for calls
  const randomID = (len = 5) => {
    let result = "";
    const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Handle phone click to initiate a call
  const handlePhoneClick = () => {
    if (!socketConnected || !socket.current) {
      alert('Connection not established. Please wait and try again.');
      return;
    }

    const callId = randomID();
    setCallId(callId);

    socket.current.emit("call", {
      callId,
      sender: user.current,
      room_id: roomId,
      message: "Calling",
    });
    navigate(`/doctor/Doctor_call/${roomId}/${callId}`);
  };

  // Handle accepting the call
  const handleAcceptCall = () => {
    if (callId && socket.current) {
      socket.current.emit("call", {
        callId,
        sender: user.current,
        room_id: roomId,
        message: "call_accepted",
      });
      navigate(`/doctor/Doctor_call/${roomId}/${callId}`);
    }
  };

  // Handle declining the call
  const handleDeclineCall = () => {
    if (socket.current) {
      socket.current.emit("call", {
        message: "call_declined",
        sender: user.current,
        room_id: roomId,
      });
      setShowModal(false);
    }
  };

  // Show loading state while initializing
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Show error if no roomId or user
  if (!roomId || !user.current) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500">Invalid room or user session</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header always shows once roomId and user are available */}
      <UserHeader 
        key={roomId} // Force re-render when roomId changes
        handlePhoneClick={socketConnected ? handlePhoneClick : null} 
      />
      
      <Header />
      
      {/* Connection status indicator */}
      {!socketConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm">
          <p className="flex items-center">
            <span className="animate-pulse mr-2">●</span>
            Connecting to chat...
          </p>
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === user.current ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div className={`flex flex-col max-w-xs ${message.sender === user.current ? 'items-end' : 'items-start'}`}>
              {message.content && (
                <p className={`p-3 rounded-lg ${message.sender === user.current ? 'bg-slate-800 text-white' : 'bg-slate-400 text-black'}`}>
                  {message.content}
                </p>
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="Sent Image"
                  className="max-w-xs h-auto object-cover cursor-pointer rounded-lg mb-2"
                />
              )}
              {message.video && (
                <video
                  src={message.video}
                  controls
                  className="max-w-sm h-auto object-cover cursor-pointer rounded-lg mb-2"
                />
              )}
              {message.voice_message && (
                <video controls className="w-48 rounded-lg mb-2">
                  <source src={message.voice_message} type="audio/ogg" />
                  Your browser does not support the audio element.
                </video>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Call Modal */}
      {showModal && (
        <CallModel
          callId={callId}
          handleAcceptCall={handleAcceptCall}
          handleDeclineCall={handleDeclineCall}
        />
      )}

      {/* Message Input */}
      <DoctorMessageInput
        roomId={roomId}
        socket={socket}
        user={user}
        baseURL={baseURL}
        token={token}
        socketConnected={socketConnected}
      />
    </div>
  );
};

export default DoctorChatComponent;