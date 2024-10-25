import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import footer from '../../assets/footer.jpg';


function User_Footer() {
  return (
    <footer className="bg-slate-500 lg:grid lg:grid-cols-5">
      <div className="relative block lg:col-span-2 lg:h-full">
        <img
          src={footer} 
          alt="Footer background"
          className="absolute inset-0 h-full px-4 py-4 w-1/2  object-cover rounded-lg opacity-50"
        />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:col-span-3 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FIND Doctor</h1>
            <p className="text-sm">&copy; {new Date().getFullYear()} All rights reserved.</p>

            <p>
              <span className="text-xs uppercase tracking-wide text-gray-500">Call us</span>
              <a href="tel:+0123456789" className="block text-2xl font-medium text-gray-900 hover:opacity-75 sm:text-3xl">
                9847112061
              </a>
            </p>
            <ul className="mt-8 space-y-1 text-sm text-gray-700">
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
            <h3 className="text-lg font-semibold">Links</h3>
            <nav className="mt-4 space-y-1 text-sm text-gray-700">
              <Link to="/" className="hover:underline">Home</Link>
              <Link to="/about" className="hover:underline">About Us</Link>
              <Link to="/services" className="hover:underline">Services</Link>
              <Link to="/contact" className="hover:underline">Contact</Link>
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms" className="hover:underline">Terms of Service</Link>
              <Link to="/faq" className="hover:underline">FAQ</Link>
              <Link to="/support" className="hover:underline">Support</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default User_Footer;


