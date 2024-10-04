import React, { useEffect, useState, useRef} from "react";
import axios from "axios";
import { useParams,useNavigate } from "react-router-dom";
import CallModel from "../../Components/Chat/CallModel";
import { FaPhone, FaSearch } from "react-icons/fa"; // Importing Font Awesome icons
import {jwtDecode} from "jwt-decode";


const UserHeader = (socket) => {
  const { roomId } = useParams(); // Get roomId from URL parameters
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = 'http://127.0.0.1:8000'; // Update with your API base URL
  const token = localStorage.getItem('access');

  const user = useRef(null);
  const [showModal, setShowModal] = useState(false); // Modal state
  const [callId, setCallId] = useState(null);
  const navigate = useNavigate(); // Ensure navigate is used for redirection

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/chats/chatrooms/${roomId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const roomData = response.data;
        
        console.log("Fetched room data:", roomData); // Debugging line

        // Safeguard against undefined values
        const profilePicUrl = roomData.patient_profile && roomData.patient_profile.startsWith('/')
          ? `${baseURL}${roomData.patient_profile}`
          : roomData.patient_profile || 'path/to/fallback/image.png';
        
        console.log("Profile picture URL:", profilePicUrl); // Debugging line

        setUserProfilePic(profilePicUrl);
        setUserName(roomData.patient_username || '');
      } catch (err) {
        console.error("Error fetching user details:", err); // Debugging line
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [roomId, token, baseURL]);


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
      navigate(`doctor/DoctorCall/${roomId}/${callId}`); // Navigate to the call page
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
      navigate(`doctor/DoctorCall/${roomId}/${callId}`);
    }
  };

  // Handle declining the call
  const handleDeclineCall = () => {
    if (socket && socket.current) {
      socket.current.emit("call", {
        message: "call_declined",
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
    <div className="fixed top-0 justify-center right-0 w-2/3  bg-slate-600 text-white p-4 shadow-lg z-50">
      <div className="flex items-center">
        <img
          src={userProfilePic}
          alt={`${userName}'s profile`}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => e.target.src = 'path/to/fallback/image.png'} // Handle image loading errors
        />
        <div className="ml-4">
        <h3 className="text-lg font-semibold">{userName}</h3>
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

export default UserHeader;
