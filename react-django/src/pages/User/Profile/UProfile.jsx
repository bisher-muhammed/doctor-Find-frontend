import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { set_profile_details } from '../../../Redux/UserProfileSlice';

import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@material-tailwind/react";
import { MdEdit } from 'react-icons/md';
// 51.20.127.171

function UProfile() {
    const dispatch = useDispatch();
    const profileData = useSelector((state) => state.profile); 
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const token = localStorage.getItem('access');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseURL}/api/users/user_details/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { username, email, phone_number } = response.data.user; 
                const profileDetails = { ...response.data, username, email, phone: phone_number };

                dispatch(set_profile_details(profileDetails));
            } catch (error) {
                setError("Error fetching profile data: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (!profileData.username) {
            fetchProfileData();
        } else {
            setLoading(false);
        }
    }, [dispatch, profileData, token]);

    const { username, address, city, country, date_of_birth, first_name, gender, last_name, profile_pic, phone, state, email } = profileData;

    console.log('profile datas',profileData)

    const profilePic = profile_pic ? `${baseURL}${profile_pic}` : 'https://via.placeholder.com/150';
    console.log('profile_pic',profilePic)

    if (loading) return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

    return (
        <div className="w-full px-4 py-6">
          <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <img 
                src={profilePic} 
                alt={`${first_name} ${last_name}'s Profile`} 
                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-gray-300 shadow-md"
              />
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mt-4">
                {first_name} {last_name}
              </h1>
            </div>
    
            {/* User Details in Table Format */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {[
                    { label: "Username", value: username },
                    { label: "Email", value: email },
                    { label: "Phone", value: phone },
                    { label: "Date of Birth", value: date_of_birth },
                    { label: "Gender", value: gender },
                    { label: "Address", value: address },
                    { label: "State", value: state },
                    { label: "City", value: city },
                    { label: "Country", value: country },
                  ].map((item, index) => (
                    <tr key={item.label} className={`border-t ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-sm md:text-base">{item.label}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600 text-sm md:text-base">{item.value || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
    
            {/* Edit Button */}
            <div className="flex justify-center mt-6">
              <Link to="/edit_profile">
                <Button variant="filled" color="red" size="md" className="flex items-center">
                  <MdEdit className="mr-2 text-xl" /> Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    export default UProfile;







