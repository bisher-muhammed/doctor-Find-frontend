import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

function DoctorFooter() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-black text-white  md:ml-56 sm:ml-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-3">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center lg:items-start">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                FIND<span className="text-teal-400">Doctor</span>
              </h1>
              <p className="mt-4 text-center text-sm text-gray-300 md:text-base lg:text-left pl-16">
                Connecting patients with top medical professionals nationwide.
              </p>
              
              <div className="mt-6">
                <div className="flex items-center justify-center gap-4 lg:justify-start">
                  <a href="tel:+0123456789" className="group flex items-center">
                    <span className="rounded-full bg-teal-500 p-2">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <span className="ml-3 text-lg font-medium group-hover:text-teal-400 transition-colors">
                      9847112061
                    </span>
                  </a>
                </div>

                {/* Social Media */}
                <div className="mt-8 flex justify-center space-x-6 lg:justify-start">
                  <a href="https://facebook.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                    <FaFacebook className="h-6 w-6" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="https://twitter.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                    <FaTwitter className="h-6 w-6" />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a href="https://linkedin.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                    <FaLinkedin className="h-6 w-6" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                  <a href="https://instagram.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                    <FaInstagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:col-span-2 ">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 pl-20">
              <div>
                <h3 className="text-lg font-semibold text-teal-400">Navigation</h3>
                <nav className="mt-4 space-y-2">
                  <Link to="/doctor/home" className="block text-gray-300 hover:text-teal-400 transition-colors hover:underline hover:underline-offset-4">
                    Home
                  </Link>
                  <Link to="/doctor/Bookings/bookings" className="block text-gray-300 hover:text-teal-400 transition-colors hover:underline hover:underline-offset-4">
                    Appointments
                  </Link>
                  <Link to="/doctor/doctor_details" className="block text-gray-300 hover:text-teal-400 transition-colors hover:underline hover:underline-offset-4">
                    Profile
                  </Link>
                </nav>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-teal-400">Support</h3>
                <nav className="mt-4 space-y-2">
                  <Link to="/doctor/edit_profile" className="block text-gray-300 hover:text-teal-400 transition-colors hover:underline hover:underline-offset-4">
                    Edit Profile
                  </Link>
                  <Link to="/doctor/Slots/Slots" className="block text-gray-300 hover:text-teal-400 transition-colors hover:underline hover:underline-offset-4">
                    Slots
                  </Link>
                  <Link to="/doctor/chat_rooms" className="block text-gray-300 hover:text-teal-400 transition-colors hover:underline hover:underline-offset-4">
                    Chats
                  </Link>
                </nav>
              </div>
            </div>

            {/* Working Hours */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="border-t border-gray-700 pt-8 sm:pt-0 lg:border-t-0 lg:pt-0 pl-20">
                <h3 className="text-lg font-semibold text-teal-400">Availability</h3>
                <div className="mt-4 space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>10am - 5pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10am - 3pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default DoctorFooter;
