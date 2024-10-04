import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';  // Import this hook
import { set_authentication } from '../../Redux/authenticationSlice';

const Header = () => {
  const [openNav, setOpenNav] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authUser);
  const location = useLocation();  // Use location to get the current route

  // Check if the current route is the homepage
  const isHomePage = location.pathname === '/doctor/home';

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
      <li><Link to="/contacts" className="text-black p-2 font-medium">Contacts</Link></li>
    </ul>
  );

  return (
    <header className={`z-50 px-4 py-5 mt-1 sticky top-0 ${isHomePage ? 'bg-slate-400 ml-72 mr-1 sticky top-0' : 'w-full bg-slate-300 '}`}>
      <div className={`flex items-center ${isHomePage ? 'justify-between' : 'justify-between'}`}>
        <Link to='/doctor/home' className={`text-black font-bold text-xl ${isHomePage ? 'text-white justify-start' : 'text-black'}`}>
          Find Doctor
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
  );
};

export default Header;
