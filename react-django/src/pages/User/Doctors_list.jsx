import axios from 'axios';
import React, { useEffect, useState } from 'react';
import User_Navbar from '../../Components/Users/User_Navbar';
import { useNavigate } from 'react-router-dom';
import { Button } from "@material-tailwind/react";
import StartChat from '../Chats/StartChat';
import { 
  FaUserMd, 
  FaClock, 
  FaStethoscope, 
  FaSearch, 
  FaFilter,
  FaMapMarkerAlt,
  FaCalendarCheck,
  FaComments
} from 'react-icons/fa';
import { 
  MdVerified, 
  MdLocationOn, 
  MdStar,
  MdWork,
  MdAccessTime
} from 'react-icons/md';
import { HiAcademicCap } from 'react-icons/hi';

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  
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
      const matchesExperience = selectedExperience === '' || 
                               (doctor.experience >= parseInt(selectedExperience));
      return matchesSearch && matchesSpecialization && matchesExperience;
    });

    // Sort doctors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.username.localeCompare(b.username);
        case 'specification':
          return (a.specification || '').localeCompare(b.specification || '');
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialization, selectedExperience, sortBy]);

  // Get unique specializations for filter dropdown
  const specializations = [...new Set(doctors.map(doctor => doctor.specification).filter(Boolean))];
  const experienceRanges = ['1', '3', '5', '10', '15'];

  const handleBookNow = (doctorId) => {
    navigate(`/doctor_details/${doctorId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('');
    setSelectedExperience('');
    setSortBy('name');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <User_Navbar setDoctors={setDoctors} />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">Finding the best doctors for you...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we load our medical experts</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <User_Navbar setDoctors={setDoctors} />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load doctors</h2>
            <p className="text-gray-600 mb-4 text-sm">We encountered an issue while fetching doctor information.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-sm px-6 py-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <User_Navbar setDoctors={setDoctors} />
      
      {/* Header Section */}
      <div className="pt-20 pb-8 px-4 bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Find Your Doctor
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Browse through our network of certified healthcare professionals and schedule your appointment with confidence
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{filteredDoctors.length}</p>
                <p className="text-sm text-gray-500">Available Doctors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            {/* Main Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    showFilters 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaFilter className="mr-2" size={14} />
                  Filters
                  {(selectedSpecialization || selectedExperience) && (
                    <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {(selectedSpecialization ? 1 : 0) + (selectedExperience ? 1 : 0)}
                    </span>
                  )}
                </button>

                {showFilters && (
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="">All Specialties</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>

                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="">Any Experience</option>
                      {experienceRanges.map(exp => (
                        <option key={exp} value={exp}>{exp}+ years</option>
                      ))}
                    </select>

                    {(selectedSpecialization || selectedExperience) && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="experience">Sort by Experience</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="specification">Sort by Specialty</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-gray-300 mb-4">
              <FaUserMd className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No matching doctors found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || selectedSpecialization || selectedExperience
                ? "We couldn't find any doctors matching your current filters. Try adjusting your search criteria." 
                : "No doctors are currently available in our network."}
            </p>
            {(searchTerm || selectedSpecialization || selectedExperience) && (
              <Button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <div 
                key={doctor.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Doctor Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <img
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                        src={doctor.profile_pic || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'}
                        alt={`Dr. ${doctor.username}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                        <MdVerified className="w-3 h-3" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            Dr. {doctor.username}
                          </h3>
                          {doctor.specification && (
                            <p className="text-blue-600 font-medium text-sm mt-1">
                              {doctor.specification}
                            </p>
                          )}
                        </div>
                        {doctor.rating && (
                          <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm">
                            <MdStar className="w-4 h-4 fill-current" />
                            <span className="font-medium ml-1">{doctor.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="space-y-3 mb-6">
                    {doctor.experience && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MdWork className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span>{doctor.experience} years of experience</span>
                      </div>
                    )}
                    
                    {doctor.location && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="truncate">{doctor.location}</span>
                      </div>
                    )}

                    {doctor.availability && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MdAccessTime className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span>{doctor.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleBookNow(doctor.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center"
                    >
                      <FaCalendarCheck className="mr-2" size={14} />
                      Book Visit
                    </Button>
                    
                    <Button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center border border-gray-300"
                    >
                      <FaComments className="mr-2" size={14} />
                      <StartChat doctorId={doctor.id} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{doctors.length}</div>
              <div className="text-sm text-gray-600">Total Doctors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">{specializations.length}</div>
              <div className="text-sm text-gray-600">Specialties</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.max(...doctors.map(d => d.experience || 0))}+
              </div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DoctorsList;
