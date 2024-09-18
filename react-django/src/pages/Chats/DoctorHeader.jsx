import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const DoctorHeader = () => {
  const { roomId } = useParams(); // Get roomId from URL parameters
  const [doctorProfilePic, setDoctorProfilePic] = useState(null);
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = 'http://127.0.0.1:8000'; // Update with your API base URL
  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/chats/chatrooms/${roomId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const roomData = response.data;
        // Construct full URL if it's a relative path
        const profilePicUrl = roomData.doctor_profile.startsWith('/') ? `${baseURL}${roomData.doctor_profile}` : roomData.doctor_profile;
        setDoctorProfilePic(profilePicUrl || 'path/to/fallback/image.png');
        setDoctorFirstName(roomData.doctor_first_name || '');
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [roomId, token, baseURL]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="fixed top-0 justify-center right-0 w-2/3 bg-slate-600 text-white p-4 shadow-lg z-50">
      <div className="flex items-center">
        <img
          src={doctorProfilePic}
          alt={`${doctorFirstName}'s profile`}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => e.target.src = 'path/to/fallback/image.png'} // Handle image loading errors
        />
        <div className="ml-4"> {/* Adjust margin if needed */}
          <h3 className="text-lg font-semibold">Dr. {doctorFirstName}</h3>
        </div>
      </div>
    </div>
  );
};

export default DoctorHeader;


