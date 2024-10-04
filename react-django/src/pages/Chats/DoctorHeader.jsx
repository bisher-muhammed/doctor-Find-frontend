import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CallModel from "../../Components/Chat/CallModel";
import { FaPhone, FaSearch } from "react-icons/fa"; // Importing Font Awesome icons
import {jwtDecode} from "jwt-decode";

const DoctorHeader = ({ socket }) => {
  console.log(socket)
  const { roomId } = useParams(); // Get roomId from URL parameters
  const [doctorProfilePic, setDoctorProfilePic] = useState(null);
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const user = useRef(null);
  const [showModal, setShowModal] = useState(false); // Modal state
  const [callId, setCallId] = useState(null);
  const navigate = useNavigate(); // Ensure navigate is used for redirection

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        user.current = decodedToken.user_id;
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/chats/chatrooms/${roomId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const roomData = response.data;
        const profilePicUrl = roomData.doctor_profile.startsWith('/')
          ? `${baseURL}${roomData.doctor_profile}`
          : roomData.doctor_profile;
        setDoctorProfilePic(profilePicUrl || 'path/to/fallback/image.png');
        setDoctorFirstName(roomData.doctor_first_name || '');
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorDetails();
  }, [roomId, token]);

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
    const callId = randomID(); // Generate random ID for the call
    setCallId(callId);

    if (socket && socket.current) {
      socket.current.emit("call", {
        callId,
        sender_id: user.current,
        room_id: roomId,
        message: "Calling",
      });
      navigate(`/Call/${roomId}/${callId}`); // Navigate to the call page
    } else {
      console.error('Socket is not connected.');
    }
  };

  // Handle accepting the call
  const handleAcceptCall = () => {
    if (callId && socket && socket.current) {
      socket.current.emit("call", {
        callId,
        sender_id: user.current,
        room_id: roomId,
        message: "call_accepted",
      });
      navigate(`/Call/${roomId}/${callId}`);
    }
  };

  // Handle declining the call
  const handleDeclineCall = () => {
    if (socket && socket.current) {
      socket.current.emit("call", {
        content: "call_declined",
        sender_id: user.current,
        room_id: roomId,
      });
      setShowModal(false);
    }
  };

  // Handle incoming call messages from the socket
  useEffect(() => {
    if (!roomId || !user.current || !socket || !socket.current) return;

    const handleAudioMessage = (data) => {
      console.log('Received audio message:', data);

      if (data.content === "Calling") {
        setCallId(data.callId);
        setShowModal(true); // Show incoming call modal
      }

      if (data.content === "call_declined") {
        alert("The call was declined.");
        setShowModal(false);
      }
    };

    socket.current.on("receive_message", handleAudioMessage);

    return () => {
      if (socket.current) {
        socket.current.off("receive_message", handleAudioMessage); // Cleanup on component unmount
      }
    };
  }, [roomId, socket]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="fixed top-0 justify-center right-0 w-2/3 bg-slate-600 text-white p-4 shadow-lg z-50">
      <div className="flex items-center">
        <img
          src={doctorProfilePic}
          alt={`${doctorFirstName}'s profile`}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => (e.target.src = 'path/to/fallback/image.png')}
        />
        <div className="ml-4">
          <h3 className="text-lg font-semibold">Dr. {doctorFirstName}</h3>
        </div>
        <div className="flex space-x-4 ml-auto">
          <FaPhone color="#a3aed0" size={20} onClick={handlePhoneClick} className="cursor-pointer" />
          <FaSearch color="#a3aed0" size={20} />
        </div>
      </div>

      {showModal && (
        <CallModel
          callId={callId}
          handleAcceptCall={handleAcceptCall}
          handleDeclineCall={handleDeclineCall}
        />
      )}
    </div>
  );
};

export default DoctorHeader;
 