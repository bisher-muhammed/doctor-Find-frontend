import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const UserHeader = () => {
  const { roomId } = useParams(); // Get roomId from URL parameters
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = 'http://127.0.0.1:8000'; // Update with your API base URL
  const token = localStorage.getItem('access');

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
      </div>
    </div>
  );
};

export default UserHeader;
