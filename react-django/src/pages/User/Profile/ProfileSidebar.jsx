import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function ProfileSidebar({ profileData }) {
    const profilePic = profileData?.profile_pic ? `http://127.0.0.1:8000${profileData.profile_pic}` : 'image';

    return (
        <aside id="profile-sidebar" className="fixed top-0 left-0 mt-12 z-40 w-64 h-screen transition-transform bg-gray-50 dark:bg-black" aria-label="Sidebar">
            <div className="h-full px-4 py-6 overflow-y-auto">
                <div className="flex flex-col items-center mb-6">
                    <img src={profilePic} className="w-24 h-24 bg-gray-300 rounded-full mb-4" alt="Profile" />
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{profileData?.user?.username || 'Unknown User'}</h1>
                    <p className="text-gray-700 dark:text-gray-300">{profileData?.user?.email || 'No Email Provided'}</p>
                </div>

                <ul className="space-y-4 font-medium">
                    <li>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? "text-yellow-400 flex items-center" : "text-white flex items-center hover:text-yellow-400"}>
                            <FaUser className="mr-2" /> Profile
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? "text-yellow-400 flex items-center" : "text-white flex items-center hover:text-yellow-400"}>
                            <FaCog className="mr-2" /> Settings
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/logout" className={({ isActive }) => isActive ? "text-yellow-400 flex items-center" : "text-white flex items-center hover:text-yellow-400"}>
                            <FaSignOutAlt className="mr-2" /> Logout
                        </NavLink>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export default ProfileSidebar;
