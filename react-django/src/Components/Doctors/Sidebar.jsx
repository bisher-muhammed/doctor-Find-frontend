import React from 'react'
import SlotButton from './SlotButton';



function Sidebar() {
      return (
        <aside
  id="doctor-sidebar"
  className="fixed top-0 left-0 z-40 w-62 h-screen transition-transform -translate-x-full sm:translate-x-0"
  aria-label="Sidebar"
>
  <div className="h-full  px-4 py-6 overflow-y-auto bg-gray-50 dark:bg-black">
    <ul className="space-y-4 font-medium">
      <li>
        <a
          href="#"
          className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 3v9.25a4.992 4.992 0 0 0-3 1.74V12h1.5v2.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V12H16V7a1 1 0 0 0-1-1h-2V4.5a1.5 1.5 0 0 0-3 0V6H6a1 1 0 0 0-1 1v5h1.5v-2.5a.5.5 0 0 0 .5-.5h1.5V3a1 1 0 0 0-1-1H6.5A.5.5 0 0 0 6 3v2H4a1 1 0 0 0-1 1v1.5h2.5V9H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1.5v-2.5a.5.5 0 0 0 .5-.5h1.5V15a4.992 4.992 0 0 0 3-1.74V15h1.5v-3.25a4.992 4.992 0 0 0 3-1.74V15h1.5v-2.5a.5.5 0 0 0 .5-.5h1.5V3h-1.5V2a1 1 0 0 0-1-1H12a1 1 0 0 0-1 1v1h-1.5a1 1 0 0 0-1 1v4h-1.5V6a1 1 0 0 0-1-1h-.5z" />
          </svg>
          <span className="ml-3">Dashboard</span>
        </a>
      </li>
      <li>
        <a
          href="#appointments"
          className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2a1 1 0 0 1 1 1v1h4a1 1 0 0 1 1 1v1h2v12h-2v-1a1 1 0 0 1-1-1H8a1 1 0 0 1-1 1v1H4V6h2V5a1 1 0 0 1 1-1h4V3a1 1 0 0 1 1-1zM3 8v12h18V8H3z" />
          </svg>
          <span className="ml-3">Appointments</span>
        </a>
      </li>
      <li>
        <a
          href="#patient-management"
          className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-7zM6 12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7z" />
          </svg>
          <span className="ml-3">Patient Management</span>
        </a>
      </li>
      <li>
        <a
          href="/doctor/doctor_details"
          className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8v5a8 8 0 0 1-8 8 8 8 0 0 1-8-8v-5z" />
          </svg>
          <span className="ml-3">Profile</span>
        </a>

        <a
          href='/doctor/edit_profile'
          className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8v5a8 8 0 0 1-8 8 8 8 0 0 1-8-8v-5z" />
          </svg>
          <span className="ml-3">EditProfile</span>
        </a>
      </li>
      <li>
        <SlotButton/>
      </li>

    
    </ul>
  </div>
</aside>
 );
}

    
export default Sidebar;

