import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaUser, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux'; // Import useSelector

import { set_authentication } from "../../../Redux/authenticationSlice"

function ProfileSidebar() {
    // Use useSelector to get profile data from the Redux store
    const profileData = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize useNavigate
    const authentication_user = useSelector((state) => state.authUser);

    // Handle loading and error states as needed
    const loading = false; // Replace with actual loading state if applicable
    const error = null; // Replace with actual error state if applicable

    console.log('ProfileSidebar State:', profileData);

    if (loading) {
        return <div>Loading...</div>; // Loading state
    }

    if (error) {
        return <div>{error}</div>; // Error state
    }

    const logout = () => {
        // Check if user is an admin before logging out
        if (authentication_user.isAuthenticated) {
            localStorage.clear(); // Clear local storage

            // Dispatch the authentication state reset
            dispatch(
                set_authentication({
                    userid: null,
                    name: null,
                    token: null,
                    isAuthenticated: false,
                    isAdmin: false,
                    isActive: false,
                    isDoctor: false,
                })
            );

            // Redirect to login page
            navigate("/login");
        } else {
            // Notify user they are not authorized to log out
            alert("You are not authorized to log out from this section.");
        }
    };

    // Profile picture URL logic
    const profilePic = profileData?.profile_pic 
        ? `http://127.0.0.1:8000${profileData.profile_pic}` 
        : 'default-image-url';

    return (
        <aside id="profile-sidebar" className="fixed top-0 left-0 mt-12 z-40 w-64 h-screen transition-transform bg-gray-50 dark:bg-black" aria-label="Sidebar">
            <div className="h-full px-4 py-6 overflow-y-auto">
                <div className="flex flex-col items-center mb-6">
                    <img src={profilePic} className="w-24 h-24 bg-gray-300 rounded-full mb-4" alt="Profile" />
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{profileData?.username || 'Unknown User'}</h1>
                    <p className="text-gray-700 dark:text-gray-300">{profileData?.email || 'No Email Provided'}</p>
                </div>

                <ul className="space-y-4 font-medium">
                    <li>
                        <NavLink to="/edit_profile" className={({ isActive }) => isActive ? "text-yellow-400 flex items-center" : "text-white flex items-center hover:text-yellow-400"}>
                            <FaUser className="mr-2" /> Edit Profile
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/appointments' className={({ isActive }) => isActive ? "text-yellow-400 flex items-center" : "text-white flex items-center hover:text-yellow-400"}>
                            <FaUser className="mr-2" /> Appointments
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/wallet" className={({ isActive }) => isActive ? "text-yellow-400 flex items-center" : "text-white flex items-center hover:text-yellow-400"}>
                            <FaWallet className="mr-2" /> Wallet
                        </NavLink>
                    </li>
                    <li>
                        <button 
                            onClick={logout} // Use a button for logout
                            className="text-white flex items-center hover:text-yellow-400"
                        >
                            <FaSignOutAlt className="mr-2" /> Logout
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export default ProfileSidebar;
