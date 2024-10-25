
import React from 'react';
import doctorConsultingImg from '../../assets/doctor-consulting.png'; // Add appropriate image path
import expertDoctorsImg from '../../assets/expert-doctors.avif'; // Add appropriate image path
import User_Navbar from "../../Components/Users/User_Navbar";
import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div className="bg-gray-100 py-12">
    <User_Navbar />
    {/* Hero Section */}
    <div className="relative bg-white pt-4">
        <div className="max-w-screen-xl mx-auto">
            <img
                src={doctorConsultingImg}
                alt="Doctor Consulting"
                className="w-full h-[700px] object-cover rounded-lg"
            />
            </div>
        <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">About Find Doctor</h1>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="container mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-semibold text-gray-800">
          Connecting You to Expert Healthcare Solutions
        </h2>
        <p className="mt-4 text-gray-600">
          Find Doctor is your trusted platform for professional medical consultations. Whether you're
          looking for expert advice, treatment plans, or specialist consultations, our experienced
          doctors are here to assist you with your healthcare needs.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto flex flex-col lg:flex-row items-center lg:space-x-8">
          <div className="lg:w-1/2">
            <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
            <p className="mt-4 text-gray-600">
              Our mission at Find Doctor is to provide accessible, quality healthcare to everyone.
              We believe in empowering patients with the information and consultations they need to
              take control of their health. Whether you're looking for a specialist or general
              healthcare advice, we're here to connect you with the right professionals.
            </p>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0">
            <img
              src={expertDoctorsImg}
              alt="Expert Doctors"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold text-gray-800 text-center">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h4 className="text-xl font-semibold text-gray-700">Online Consultations</h4>
            <p className="mt-2 text-gray-600">
              Consult with top doctors from the comfort of your home. Our platform allows you to
              book and receive online consultations at your convenience.
            </p>
          </div>
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h4 className="text-xl font-semibold text-gray-700">Specialist Appointments</h4>
            <p className="mt-2 text-gray-600">
              Connect with specialists in various fields such as cardiology, dermatology, and more
              to address specific health concerns.
            </p>
          </div>
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h4 className="text-xl font-semibold text-gray-700">Health Tips and Advice</h4>
            <p className="mt-2 text-gray-600">
              Get regular health tips, advice, and information from medical experts to help you stay
              informed about the latest in healthcare.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-teal-600 py-12 text-center text-white">
        <h3 className="text-3xl font-semibold">Ready to Find the Right Doctor?</h3>
        <p className="mt-4">
          Join thousands of patients who trust Find Doctor for their medical consultations. Book
          your consultation today and take control of your health.
        </p>
        
<Link to="/doctors_list">
  <button className="mt-6 px-6 py-3 bg-white text-teal-600 font-bold rounded-lg shadow-md hover:bg-gray-100">
    Book a Consultation
  </button>
</Link>
      </div>
    </div>
  );
}

export default AboutPage;