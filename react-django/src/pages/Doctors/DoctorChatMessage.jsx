import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import UserHeader from '../../Components/Chat/UserHeader';
import CallModel from "../../Components/Chat/CallModel";
import Header from '../../Components/Doctors/Header';
import DoctorMessageInput from './DoctorMessageInput';
import { 
  FiWifi, 
  FiWifiOff, 
  FiClock, 
  FiUser, 
  FiVideo, 
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft
} from 'react-icons/fi';

const DoctorChatComponent = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [callId, setCallId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  
  const token = localStorage.getItem('access');
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const user = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Initialize user from token - KEEP IT SIMPLE LIKE OLD CODE
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        user.current = decodedToken.user_id; // Store just the ID, not an object
        setLoading(false);
      } catch (error) {
        console.error('Invalid token:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch patient information
  useEffect(() => {
    if (!roomId || !token) return;

    const fetchPatientInfo = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/chats/chat_rooms/${roomId}/patient_info/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPatientInfo(response.data);
      } catch (error) {
        console.error('Error fetching patient info:', error);
      }
    };

    fetchPatientInfo();
  }, [roomId, token, baseURL]);

  // Reset states when roomId changes
  useEffect(() => {
    setMessages([]);
    setShowModal(false);
    setCallId(null);
    setSocketConnected(false);
    setConnectionStatus('connecting');
    setPatientInfo(null);
  }, [roomId]);

  // Initialize socket connection
  useEffect(() => {
    if (!roomId || !user.current) return;
    
    // Cleanup previous socket if exists
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
    
    socket.current = io(baseURL, { 
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: 5
    });
    
    socket.current.on('connect', () => {
      console.log('Socket connected for room:', roomId);
      setSocketConnected(true);
      setConnectionStatus('connected');
      socket.current.emit('join_room', { 
        room_id: roomId, 
        user_id: user.current
      });
    });
    
    socket.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
      setConnectionStatus('disconnected');
    });

    socket.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    });

    socket.current.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      setConnectionStatus('reconnecting');
    });
    
    socket.current.on('receive_message', (data) => {
      console.log('Received message:', data);
      console.log('Current user ID:', user.current);
      console.log('Message sender:', data.sender);
      console.log('Are they equal?', data.sender === user.current);
      
      // Add timestamp if not present
      const messageWithTimestamp = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      setMessages((prevMessages) => [...prevMessages, messageWithTimestamp]);
    });

    socket.current.on('user_typing', (data) => {
      if (data.user_id !== user.current) {
        setTypingUser(data.user_name || 'Patient');
        setIsTyping(true);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    });

    socket.current.on('user_stop_typing', (data) => {
      if (data.user_id !== user.current) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });
    
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setSocketConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [roomId, baseURL]);

  // Auto scroll to bottom with smooth behavior
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest'
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch initial messages
  useEffect(() => {
    if (!roomId || !token) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/chats/chat_rooms/${roomId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const messagesWithTimestamps = response.data.map(msg => ({
          ...msg,
          timestamp: msg.timestamp || new Date().toISOString()
        }));
        setMessages(messagesWithTimestamps);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
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
  const randomID = useCallback((len = 5) => {
    let result = "";
    const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

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

  // Format message timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Connection status indicator component
  const ConnectionStatus = () => {
    const statusConfig = {
      connecting: { color: 'bg-yellow-500', text: 'Connecting...', icon: <FiClock className="animate-spin" /> },
      connected: { color: 'bg-green-500', text: 'Connected', icon: <FiWifi /> },
      disconnected: { color: 'bg-red-500', text: 'Disconnected', icon: <FiWifiOff /> },
      reconnecting: { color: 'bg-yellow-500', text: 'Reconnecting...', icon: <FiClock className="animate-spin" /> },
      error: { color: 'bg-red-500', text: 'Connection Error', icon: <FiAlertCircle /> }
    };

    const config = statusConfig[connectionStatus] || statusConfig.connecting;

    return (
      <div className={`flex items-center justify-center p-2 ${config.color} text-white text-sm font-medium`}>
        <span className="flex items-center gap-2">
          {config.icon}
          {config.text}
        </span>
      </div>
    );
  };

  // Patient info header component
  const PatientInfoHeader = () => {
    if (!patientInfo) return null;

    return (
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {patientInfo.first_name} {patientInfo.last_name}
              </h3>
              <p className="text-sm text-gray-500">Patient</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Active</p>
            <p className="text-xs text-gray-400">
              {patientInfo.last_active || 'Recently'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while initializing
  if (loading && messages.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Loading patient conversation...</p>
      </div>
    );
  }

  // Show error if no roomId or user
  if (!roomId || !user.current) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
        <FiAlertCircle className="text-red-500 text-4xl mb-4" />
        <p className="text-lg text-red-500 mb-2">Invalid room or doctor session</p>
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <UserHeader 
        key={roomId}
        handlePhoneClick={socketConnected ? handlePhoneClick : null} 
        patientInfo={patientInfo}
      />
      
      <Header />
      
      {/* Patient Info Header */}
      <PatientInfoHeader />
      
      {/* Connection status */}
      <ConnectionStatus />
      
      {/* Messages container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FiMessageSquare className="text-4xl mb-4 opacity-50" />
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation with your patient</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.id || index}_${message.timestamp}`}
                className={`flex ${message.sender === user.current ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`flex flex-col max-w-xs lg:max-w-md ${message.sender === user.current ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender name for patient messages */}
                  {message.sender !== user.current && patientInfo && (
                    <span className="text-xs text-gray-500 mb-1 px-2">
                      {patientInfo.first_name}
                    </span>
                  )}
                  
                  {/* Sender name for doctor messages */}
                  {message.sender === user.current && (
                    <span className="text-xs text-blue-600 mb-1 px-2 font-medium">
                      You (Doctor)
                    </span>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`relative p-3 rounded-2xl ${
                    message.sender === user.current 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-green-100 text-gray-800 rounded-bl-none shadow-sm border border-green-200'
                  } transition-all duration-200 hover:shadow-md`}>
                    
                    {/* Message content */}
                    {message.content && (
                      <p className="break-words whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {/* Media content */}
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Sent Image"
                        className="max-w-full h-auto object-cover cursor-pointer rounded-lg mb-1 hover:opacity-90 transition-opacity"
                      />
                    )}
                    
                    {message.video && (
                      <video
                        src={message.video}
                        controls
                        className="max-w-full h-auto object-cover cursor-pointer rounded-lg mb-1"
                      />
                    )}
                    
                    {message.voice_message && (
                      <video controls className="w-48 rounded-lg mb-1">
                        <source src={message.voice_message} type="audio/ogg" />
                        Your browser does not support the audio element.
                      </video>
                    )}
                    
                    {/* Timestamp */}
                    <div className={`text-xs mt-1 opacity-70 flex items-center gap-1 ${
                      message.sender === user.current ? 'text-blue-100' : 'text-green-700'
                    }`}>
                      {formatTime(message.timestamp)}
                      {message.sender === user.current && (
                        <FiCheckCircle className="text-xs" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-green-100 rounded-2xl rounded-bl-none p-3 shadow-sm border border-green-200">
                <div className="flex items-center space-x-1 text-green-700">
                  <span className="text-sm">{typingUser} is typing</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

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

      {/* Call Modal */}
      {showModal && (
        <CallModel
          callId={callId}
          handleAcceptCall={handleAcceptCall}
          handleDeclineCall={handleDeclineCall}
          callerName={patientInfo ? `${patientInfo.first_name} ${patientInfo.last_name}` : 'Patient'}
        />
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default DoctorChatComponent;
