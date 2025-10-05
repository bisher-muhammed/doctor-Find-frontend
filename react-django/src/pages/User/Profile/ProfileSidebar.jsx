import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { set_authentication } from "../../../Redux/authenticationSlice";

function ProfileSidebar() {
    const profileData = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authentication_user = useSelector((state) => state.authUser);
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

    const logout = () => {
        if (authentication_user.isAuthenticated) {
            localStorage.clear();
            dispatch(set_authentication({
                userid: null, name: null, token: null, isAuthenticated: false,
                isAdmin: false, isActive: false, isDoctor: false
            }));
            navigate("/login");
        } else {
            alert("You are not authorized to log out from this section.");
        }
    };

    const profilePic = profileData?.profile_pic 
        ? `${baseURL}${profileData.profile_pic}` 
        : 'default-image-url';

    const navItems = [
        { to: "/edit_profile", icon: <FaUser />, label: "Edit Profile" },
        { to: "/appointments", icon: <FaUser />, label: "Appointments" },
        { to: "/wallet", icon: <FaWallet />, label: "Wallet" },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block fixed top-0 left-0 mt-20 z-40 w-60 h-screen bg-gray-50 dark:bg-black">
                <div className="h-full px-4 py-6 overflow-y-auto">
                    <div className="flex flex-col items-center mb-6">
                        <img src={profilePic} className="w-24 h-24 bg-gray-300 rounded-full mb-4" alt="Profile" />
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {profileData?.username || 'Unknown User'}
                        </h1>
                        <p className="text-gray-700 dark:text-gray-300">{profileData?.email || 'No Email Provided'}</p>
                    </div>

                    <ul className="space-y-4 font-medium">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <NavLink 
                                    to={item.to} 
                                    className={({ isActive }) => 
                                        isActive ? "text-yellow-400 flex items-center" : "text-white flex items-center hover:text-yellow-400"
                                    }
                                >
                                    <span className="mr-2">{item.icon}</span> {item.label}
                                </NavLink>
                            </li>
                        ))}
                        <li>
                            <button onClick={logout} className="text-white flex items-center hover:text-yellow-400">
                                <FaSignOutAlt className="mr-2" /> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default ProfileSidebar;