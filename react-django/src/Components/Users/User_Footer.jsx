import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import footer from '../../assets/footer.jpg';

function User_Footer() {
  return (
    <footer className="bg-black w-full lg:grid lg:grid-cols-5">
      <div className="relative block lg:col-span-2 lg:h-full">
        <img
          src={footer} 
          alt="Footer background"
          className="absolute inset-0 h-1/2 w-1/2 object-cover opacity-50 mt-20 ml-10 "
        />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:col-span-3 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h1 className="text-2xl font-bold text-white">FIND Doctor</h1>
            <p className="text-sm text-gray-300">&copy; {new Date().getFullYear()} All rights reserved.</p>

            <p className="mt-4">
              <span className="text-xs uppercase tracking-wide text-gray-300">Call us</span>
              <a href="tel:+0123456789" className="block text-2xl font-medium text-white hover:opacity-75 sm:text-3xl mt-1">
                9847112061
              </a>
            </p>
            <ul className="mt-8 space-y-1 text-sm text-gray-300">
              <li>Monday to Friday: 10am - 5pm</li>
              <li>Weekend: 10am - 3pm</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook className="text-xl hover:text-teal-400 transition-colors duration-300" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter className="text-xl hover:text-teal-400 transition-colors duration-300" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin className="text-xl hover:text-teal-400 transition-colors duration-300" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="text-xl hover:text-teal-400 transition-colors duration-300" />
              </a>
            </div>
          </div>

          <div>
            <nav className="mt-4 space-y-1 text-sm text-gray-300 flex flex-col gap-3 pt-5">
              <Link to="/" className="hover:text-white">Home</Link>
              <Link to="/about" className="hover:text-white">About</Link>
              <Link to="/user_details" className="hover:text-white">Profile</Link>
              <Link to="/doctors_list" className="hover:text-white">Doctors</Link>
              <Link to="/appoinments" className="hover:text-white">Appointments</Link>
              <Link to="/wallet" className="hover:text-white">Wallet</Link>
              <Link to="/edit_profile" className="hover:text-white">Edit Profile</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default User_Footer;
