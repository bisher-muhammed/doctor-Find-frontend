import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { set_authentication } from '../../Redux/authenticationSlice';
import { FaBell } from 'react-icons/fa';
import UnreadNotificationCount from './UnreadNotificationCount';

const Header = () => {
  const [openNav, setOpenNav] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authUser);
  const location = useLocation();

  // Check if the current route is the homepage or messages
  const isHomePage = location.pathname === '/doctor/home';
  const isMessage = location.pathname.startsWith('/doctor/messages/'); // Updated to check for messages
  console.log("Current route:", location.pathname, "Is message page:", isMessage);

  // Logout function
  const logout = () => {
    localStorage.clear();
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
    navigate('/doctor/login');
  };

  // Navigation list
  const navList = (
    <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-6 mt-2 mb-4 lg:mt-0 lg:mb-0 justify-center lg:justify-end">
      <li>
        <Link 
          to='/doctor/home' 
          className="text-black hover:text-blue-600 p-2 font-medium transition-colors duration-200"
        >
          Home
        </Link>
      </li>
      <li>
        <Link 
          to="/doctor/Slots/Slots" 
          className="text-black hover:text-blue-600 p-2 font-medium transition-colors duration-200"
        >
          Slots
        </Link>
      </li>
      <li>
        <Link 
          to="/doctor/chat_rooms" 
          className="text-black hover:text-blue-600 p-2 font-medium transition-colors duration-200"
        >
          Contacts
        </Link>
      </li>
    </ul>
  );

  return (
    <>
      {!isMessage && (
        <header className={`z-50 px-6 py-4 sticky top-0 ${isHomePage ? 'bg-slate-400 xl:ml-60 md:ml-60 mr-1 ml-16 shadow-lg' : 'w-full bg-slate-300 shadow-md'}`}>
          <div className={`flex items-center ${isHomePage ? 'justify-between' : 'justify-between'}`}>
            <Link 
              to='/doctor/home' 
              className={`text-2xl font-bold ${isHomePage ? 'text-white hover:text-blue-100' : 'text-black hover:text-slate-700'} transition-colors duration-200`}
            >
              Find Doctor
            </Link>

            <div className="flex items-center gap-6">
              <Link 
                to="/doctor/notification" 
                className={`p-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-colors duration-200 ${isHomePage ? 'text-white' : 'text-black'}`}
              >
                <UnreadNotificationCount />
                <FaBell size={24} className="hover:scale-110 transition-transform" />
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden lg:flex">{navList}</div>
                <div className="flex items-center gap-x-4">
                  {authentication_user.isAuthenticated ? (
                    <>
                      <span className={`hidden lg:inline-block text-lg ${isHomePage ? 'text-white' : 'text-black'}`}>
                        👤 {authentication_user.name}
                      </span>
                      <button 
                        className={`hidden lg:inline-block px-2 py-2 rounded-lg ${isHomePage ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-200`}
                        onClick={logout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button 
                      className={`hidden lg:inline-block px-4 py-2 rounded-lg ${isHomePage ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-200`}
                      onClick={() => navigate('/doctor/login')}
                    >
                      Log In
                    </button>
                  )}
                  <button
                    className="lg:hidden bg-black flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-600 transition-colors duration-200"
                    onClick={() => setOpenNav(!openNav)}
                  >
                    {/* ... keep existing SVG icons ... */}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {openNav && (
            <nav className="lg:hidden bg-white border-t border-gray-200 shadow-lg rounded-b-lg">
              {navList}
              <div className="flex flex-col items-center py-2 space-y-3">
                {authentication_user.isAuthenticated ? (
                  <button 
                    className="w-1/  py-2 bg-slate-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={logout}
                  >
                    Logout
                  </button>
                ) : (
                  <button 
                    className="w-full max-w-xs py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => navigate('/doctor/login')}
                  >
                    Log In
                  </button>
                )}
              </div>
            </nav>
          )}
        </header>
      )}

      {/* Enhanced Dropdown for Messages */}
      {isMessage && (
        <div className="fixed top-4 left-4 z-50">
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              ☰ Menu
              <svg
                className="ml-2 -mr-1 h-5 w-5 transform transition-transform"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 z-10 w-56 mt-2 origin-top-left bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-transform duration-200">
                <div className="py-2 px-1" role="menu">
                  <Link 
                    to="/doctor/home" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg mx-1 transition-colors duration-200"
                  >
                    🏠 Home
                  </Link>
                  <Link 
                    to="/doctor/Slots/Slots" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg mx-1 transition-colors duration-200"
                  >
                    🕒 Slots
                  </Link>
                  <Link 
                    to="/contact" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg mx-1 transition-colors duration-200"
                  >
                    📞 Contact
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 rounded-lg mx-1 transition-colors duration-200"
                  >
                    🔒 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

