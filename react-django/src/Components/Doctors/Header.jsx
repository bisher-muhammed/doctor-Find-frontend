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
    <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-4 mt-2 mb-4 lg:mt-0 lg:mb-0 justify-center lg:justify-end">
      <li><Link to='/doctor/home' className="text-black p-2 font-medium">Home</Link></li>
      <li><Link to="/doctors" className="text-black p-2 font-medium">Doctors</Link></li>
      <li><Link to="/doctor/Slots/Slots" className="text-black p-2 font-medium">Slots</Link></li>
      <li><Link to='/doctor/chat_rooms' className="text-black p-2 font-medium">Rooms</Link></li>
      <li><Link to="/doctor/notification" className="text-black p-2 font-medium">Contacts</Link></li>
    </ul>
  );

  return (
    <>
      {/* Render regular header only if not on the message page */}
      {!isMessage && (
        <header className={`z-50 px-4 py-5 mt-1 sticky top-0 ${isHomePage ? 'bg-slate-400 ml-72 mr-1' : 'w-full bg-slate-300'}`}>
          <div className={`flex items-center ${isHomePage ? 'justify-between' : 'justify-between'}`}>
            <Link to='/doctor/home' className={`text-black font-bold text-xl ${isHomePage ? 'text-white' : 'text-black'}`}>
              Find Doctor
            </Link>

            <Link to="/doctor/notification" className={`ml-2 ${isHomePage ? 'text-white' : 'text-black'}`}>
              <UnreadNotificationCount />
              <FaBell size={20} />
            </Link>

            <div className="flex items-center lg:gap-4">
              <div className="hidden lg:flex">{navList}</div>
              <div className="flex items-center gap-x-1">
                {authentication_user.isAuthenticated ? (
                  <>
                    <span className={`hidden lg:inline-block ${isHomePage ? 'text-white' : 'text-black'}`}>
                      {authentication_user.name}
                    </span>
                    <button className={`hidden lg:inline-block ${isHomePage ? 'text-white' : 'text-blue-500'}`} onClick={logout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <button className={`hidden lg:inline-block ${isHomePage ? 'text-white' : 'text-blue-500'}`} onClick={() => navigate('/doctor/login')}>
                    Log In
                  </button>
                )}
                <button
                  className="lg:hidden flex items-center justify-center h-6 w-6 text-black"
                  onClick={() => setOpenNav(!openNav)}
                >
                  {openNav ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {openNav && (
            <nav className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
              {navList}
              <div className="flex flex-col items-center py-2">
                {authentication_user.isAuthenticated ? (
                  <button className="text-blue-500 w-full py-2" onClick={logout}>Logout</button>
                ) : (
                  <button className="text-blue-500 w-full py-2" onClick={() => navigate('/doctor/login')}>Log In</button>
                )}
              </div>
            </nav>
          )}
        </header>
      )}

      {/* Dropdown for messages displayed at top-left when on messages page */}
      {isMessage && (
  <div className="fixed top-0 left-0 z-50 pl-3">
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-slate-500 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          ☰
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {dropdownOpen && (
        <div className="right-0 z-10  w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <Link to="/doctor/home" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Home</Link>
            <Link to="/doctors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Doctors</Link>
            <Link to="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">About</Link>
            <Link to="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Contact</Link>
            <li>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </li>
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

