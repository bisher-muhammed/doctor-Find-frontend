import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DoctorForgotPassword() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL

  const handleEmail = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;

    try {
      const res = await axios.post(
        `${baseURL}/api/doctors/doctor/forgotpassword/`,
        { email: email }
      );

      if (res.status === 200) {
        localStorage.setItem('registeredEmail', res.data.email);
        localStorage.setItem('user_id', res.data.user_id);
        toast.success('Email sent successfully');
        navigate("/doctor/FPotp");
      } else {
        toast.error('Email does not exist');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="font-semibold text-3xl text-black text-center mb-6">Forgot Password</h3>
        <form onSubmit={handleEmail} className="w-full max-w-md space-y-4">
          <input
            type="email"
            name="email"
            required
            className="w-full p-4 text-black rounded-xl border border-gray-500 bg-gray-600 focus:bg-gray-500 focus:outline-none"
            placeholder="Enter your registered email"
          />
          <input
            type="submit"
            value="Submit"
            className="py-4 px-8 bg-teal-600 text-black font-semibold rounded-xl shadow-sm cursor-pointer hover:bg-green-900"
          />
        </form>
      </div>
    </div>
  );
}

export default DoctorForgotPassword;
