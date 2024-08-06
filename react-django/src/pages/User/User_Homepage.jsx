import React from "react";
import { Link } from "react-router-dom";
import User_Footer from "../../Components/Users/User_Footer"
import User_Navbar from "../../Components/Users/User_Navbar"
import { useSelector } from 'react-redux';


function User_Homepage() {

  const authentication_user = useSelector(state => state.authUser);
  console.log(authentication_user.name);
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <User_Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Find the Doctor</h1>
        <p className="text-lg text-gray-600 mb-6">
          Explore our platform to connect with doctors, book appointments, and manage your health.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Find Doctors</h2>
            <p className="text-gray-600 mb-4">
              Search for doctors based on specialty, location, and availability.
            </p>
            <Link to="/find-doctors" className="text-blue-500 hover:underline">
              Find Doctors
            </Link>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">My Appointments</h2>
            <p className="text-gray-600 mb-4">
              View and manage your upcoming and past appointments.
            </p>
            <Link to="/my-appointments" className="text-blue-500 hover:underline">
              View Appointments
            </Link>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600 mb-4">
              Update your personal information and manage your account settings.
            </p>
            <Link to="/profile" className="text-blue-500 hover:underline">
              Update Profile
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <User_Footer />
    </div>
  );
}

export default User_Homepage;
