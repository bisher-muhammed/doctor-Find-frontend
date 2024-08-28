import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCalendarAlt, FaUserMd, FaUserEdit, FaUserTie } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import SlotButton from './SlotButton';

const navItems = [
  { to: '/doctor/home', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/doctor/Bookings/bookings', icon: <FaCalendarAlt />, label: 'Appointments' },
  { to: '#', icon: <FaUserTie />, label: 'Patient Management' },
  { to: '/doctor/doctor_details', icon: <FaUserMd />, label: 'Profile' },
  { to: '/doctor/edit_profile', icon: <FaUserEdit />, label: 'Edit Profile' },
];

function Sidebar() {
  const authentication_user = useSelector((state) => state.authUser);
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

  useEffect(() => {
    if (authentication_user.isAuthenticated && authentication_user.isDoctor) {
      console.log('User is already authenticated. Redirecting...');
      navigate('/doctor/home');
    } else if (!authentication_user.isAuthenticated) {
      navigate('/doctor/login');
    }
  }, [authentication_user.isAuthenticated, authentication_user.isDoctor, navigate, token]);

  return (
    <aside
      id="doctor-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen bg-white shadow-lg sm:translate-x-0 md:w-64 lg:w-72"
      aria-label="Sidebar"
    >
      <div className="h-full px-4 py-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-900 dark:text-white font-bold text-xl mb-8">
          Doctor Dashboard
        </div>
        <nav>
          <ul className="space-y-4 font-medium">
            {navItems.map((item, index) => (
              <li key={index}>
                {item.to === '#' ? (
                  <div
                    className="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span
                      className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    >
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.label}</span>
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    className="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span
                      className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    >
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-10">
          <SlotButton />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
