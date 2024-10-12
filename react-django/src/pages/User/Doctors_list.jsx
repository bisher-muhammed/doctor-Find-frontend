import axios from 'axios';
import React, { useEffect, useState } from 'react';
import User_Navbar from '../../Components/Users/User_Navbar';
import { useNavigate } from 'react-router-dom';
import {
  Button,
} from "@material-tailwind/react";
import StartChat from '../Chats/StartChat';

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/users/doctors_list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(response.data);
      } catch (error) {
        setError(error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [token, navigate]);

  if (loading) return <div className="text-center py-10">Loading doctors...</div>; // Show a loading message
  if (error) return <div className="text-red-500 text-center py-8">{error.message}</div>; // Display error messages

  return (
    <main className="container mx-auto p-4">
      <User_Navbar setDoctors={setDoctors} />
      <h2 className="pt-20 text-lime-950 font-serif mb-8 text-2xl font-bold text-center">Meet Our Expert Doctors</h2>

      {doctors.length === 0 ? (
        <p className="text-center text-lg">No verified doctors found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 lg:px-4 sm:px-4 px-2"> {/* Adjusted for 4 columns and smaller px values */}
        {doctors.map(doctor => (
          <div className="w-64 mx-auto mt-4 transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-md duration-300 hover:scale-100 hover:shadow-lg" key={doctor.id}> {/* Reduced width of the cards */}
            <img 
              className="h-48 w-full object-cover object-center" 
              src={doctor.profile_pic || 'https://via.placeholder.com/150'} // Fallback image if no profile pic
              alt={`${doctor.username}'s profile`} 
            />
            <div className="p-4">
              <h2 className="mb-2 text-lg font-medium dark:text-white text-gray-900">
                {doctor.username}
              </h2>
              <p className="mb-2 text-base dark:text-gray-300 text-gray-700">
                <strong>Specification:</strong> {doctor.specification}
              </p>
              <p className="mb-2 text-base dark:text-gray-300 text-gray-700">
                <strong>Experience:</strong> {doctor.experience} years
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <Button 
                  onClick={() => navigate(`/doctor_details/${doctor.id}`)} 
                  className="mb-2 mr-0 sm:mr-2 py-2 px-6"  
                  color="teal"
                >
                  Book Now
                </Button>
                <div className="mb-2 sm:mb-0">
                  <StartChat doctorId={doctor.id} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
     )}
    </main>
  );
}

export default DoctorsList;
