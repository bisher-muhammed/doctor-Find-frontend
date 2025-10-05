import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the context
export const PContext = createContext();

// Custom hook to use the ProfileContext
export const useProfileContext = () => {
  const context = useContext(PContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileContextProvider');
  }
  return context;
};

// Provider component
const ProfileContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL
  const [token, setToken] = useState(localStorage.getItem('access'));
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile data function
  const fetchProfile = async () => {
    if (!token) {
      setError('No token available');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${baseURL}/api/users/user_details/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Profile Data:', response.data); 
      setProfileData(response.data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to fetch profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]); // Re-run effect if token changes

  return (
    <PContext.Provider value={{ profileData, loading, error }}>
      {children}
    </PContext.Provider>
  );
};

export default ProfileContextProvider;
