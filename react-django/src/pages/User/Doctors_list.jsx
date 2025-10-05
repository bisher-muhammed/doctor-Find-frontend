import axios from 'axios';
import React, { useEffect, useState } from 'react';
import User_Navbar from '../../Components/Users/User_Navbar';
import { useNavigate } from 'react-router-dom';
import { Button } from "@material-tailwind/react";
import StartChat from '../Chats/StartChat';
import { FaPaperPlane, FaUserMd, FaClock, FaStethoscope, FaSearch, FaFilter } from 'react-icons/fa';
import { MdVerified, MdLocationOn, MdStar } from 'react-icons/md';

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseURL}/api/users/doctors_list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(response.data);
        setFilteredDoctors(response.data);
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
  }, [token, navigate, baseURL]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = doctors.filter(doctor => {
      const matchesSearch = doctor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specification?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = selectedSpecialization === '' || 
                                   doctor.specification === selectedSpecialization;
      return matchesSearch && matchesSpecialization;
    });

    // Sort doctors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'name':
          return a.username.localeCompare(b.username);
        case 'specification':
          return (a.specification || '').localeCompare(b.specification || '');
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialization, sortBy]);

  // Get unique specializations for filter dropdown
  const specializations = [...new Set(doctors.map(doctor => doctor.specification).filter(Boolean))];

  const handleBookNow = (doctorId) => {
    navigate(`/doctor_details/${doctorId}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <User_Navbar setDoctors={setDoctors} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 font-medium">Finding the best doctors for you...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <User_Navbar setDoctors={setDoctors} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <User_Navbar setDoctors={setDoctors} />
      
      {/* Hero Section */}
      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Meet Our <span className="text-blue-600">Expert Doctors</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Connect with qualified healthcare professionals and book your appointment today
          </p>
          
          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Specialization Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
                <option value="specification">Sort by Specialization</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-600">{filteredDoctors.length}</span> 
            {filteredDoctors.length === 1 ? ' doctor' : ' doctors'}
          </p>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <FaUserMd className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedSpecialization 
                ? "Try adjusting your search or filter criteria" 
                : "No verified doctors are currently available"}
            </p>
            {(searchTerm || selectedSpecialization) && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialization('');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map(doctor => (
              <div 
                key={doctor.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              >
                {/* Doctor Image */}
                <div className="relative overflow-hidden">
                  <img
                    className="h-56 w-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    src={doctor.profile_pic || 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Dr'}
                    alt={`Dr. ${doctor.username}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Dr';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full flex items-center text-xs font-medium">
                      <MdVerified className="w-3 h-3 mr-1" />
                      Verified
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                      <FaUserMd className="text-blue-600 mr-2" />
                      Dr. {doctor.username}
                    </h3>
                    
                    {doctor.specification && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaStethoscope className="text-teal-500 mr-2 flex-shrink-0" />
                        <span className="font-medium">{doctor.specification}</span>
                      </div>
                    )}
                    
                    {doctor.experience && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaClock className="text-orange-500 mr-2 flex-shrink-0" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                    )}

                    {doctor.location && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <MdLocationOn className="text-red-500 mr-2 flex-shrink-0" />
                        <span>{doctor.location}</span>
                      </div>
                    )}

                    {/* Rating Display (if available) */}
                    {doctor.rating && (
                      <div className="flex items-center text-gray-600">
                        <MdStar className="text-yellow-500 mr-1" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-sm ml-1">({doctor.total_reviews || 0} reviews)</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleBookNow(doctor.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                      size="lg"
                    >
                      Book Appointment
                    </Button>
                    
                    <div className="relative">
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg"
                        size="lg"
                      >
                        <FaPaperPlane className="mr-2" size={16} />
                        <StartChat doctorId={doctor.id} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}

export default DoctorsList;