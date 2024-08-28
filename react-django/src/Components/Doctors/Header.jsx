import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { set_authentication } from '../../Redux/authenticationSlice';

const Header = () => {
  const [openNav, setOpenNav] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem('access')
  const authentication_user = useSelector((state) => state.authUser);
  console.log('Header Authentication State:', authentication_user);



  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setOpenNav(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    console.log('Logging out...');
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
    console.log('Header Authentication State:', authentication_user);

    console.log('Navigating to /doctor/login');
    navigate('/doctor/login');
  };

  const navList = (
    <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-4 mt-2 mb-4 lg:mt-0 lg:mb-0 justify-center lg:justify-start">
      <li>
        <Link to='/doctor/home' className="text-black p-2 font-medium">Home</Link>
      </li>
      
      
      <li>
        <Link to="/doctors" className="text-black p-2 font-medium">Doctors</Link>
      </li>
      <li>
        <Link to="/doctor/Slots/Slots" className="text-black p-2 font-medium">Slots</Link>
      </li>
      <li>
        <Link to="/contacts" className="text-black p-2 font-medium">Contacts</Link>
      </li>
    </ul>
  );

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <Link to='/doctor/home' className="text-black font-bold text-xl flex items-center">
          Find Doctor
        </Link>
        <div className="flex items-center lg:gap-4">
          <div className="hidden lg:flex">
            {navList}
          </div>
          <div className="flex items-center gap-x-1">
            {authentication_user.isAuthenticated ? (
              <>
                <span className="hidden lg:inline-block">{authentication_user.name}</span>
                <button
                  className="hidden lg:inline-block text-blue-500"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="hidden lg:inline-block text-blue-500"
                onClick={() => navigate('/doctor/login')}
              >
                Log In
              </button>
            )}
            <button
              className="lg:hidden flex items-center justify-center h-6 w-6 text-black"
              onClick={() => setOpenNav(!openNav)}
            >
              {openNav ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
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
              <button
                className="text-blue-500 w-full py-2"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <button
                className="text-blue-500 w-full py-2"
                onClick={() => navigate('/doctor/login')}
              >
                Log In
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
