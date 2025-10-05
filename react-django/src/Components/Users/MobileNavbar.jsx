import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { set_authentication } from '../../Redux/authenticationSlice';

function MobileNavbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authentication_user = useSelector((state) => state.authUser);

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

    const navItems = [
        { to: "/edit_profile", icon: <FaUser />, label: "Edit" },
        { to: "/appointments", icon: <FaUser />, label: "Appt" },
        { to: "/wallet", icon: <FaWallet />, label: "Wallet" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50 pb-[env(safe-area-inset-bottom)]">
            <ul className="flex justify-around items-center h-16">
                {navItems.map((item, index) => (
                    <li key={index} className="w-1/4 text-center">
                        <NavLink 
                            to={item.to} 
                            className={({ isActive }) => 
                                isActive 
                                    ? "text-yellow-400 flex flex-col items-center justify-center" 
                                    : "text-gray-700 dark:text-gray-300 flex flex-col items-center justify-center hover:text-yellow-400"
                            }
                        >
                            <span className="text-xl mb-1">{item.icon}</span>
                            <span className="text-xs">{item.label}</span>
                        </NavLink>
                    </li>
                ))}
                <li className="w-1/4 text-center">
                    <button 
                        onClick={logout} 
                        className="text-gray-700 dark:text-gray-300 flex flex-col items-center justify-center w-full hover:text-yellow-400"
                    >
                        <span className="text-xl mb-1"><FaSignOutAlt /></span>
                        <span className="text-xs">Logout</span>
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default MobileNavbar;