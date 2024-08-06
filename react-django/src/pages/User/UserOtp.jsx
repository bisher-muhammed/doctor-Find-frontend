import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserOtp() {
    const [otpDatas, setOtpDatas] = useState(['', '', '', '']);
    const inputRefs = useRef(Array.from({ length: 4 }, () => React.createRef()));
    const baseURL = 'http://127.0.0.1:8000';
    const navigate = useNavigate();
    const registeredEmail = localStorage.getItem('registeredEmail');

    const handleVerification = async (event) => {
        event.preventDefault();
        const enteredOtp = otpDatas.join('');
        console.log('Request payload:', { email: registeredEmail, otp: enteredOtp });

        try {
            const res = await axios.post(`${baseURL}/api/users/otpverify/`, {
                email: registeredEmail,
                otp: enteredOtp,
            });

            if (res.status === 200) {
                console.log('Account created successfully');
                navigate('/');
                localStorage.clear();
                toast.success('Account created successfully', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            } else {
                console.log('Verification failed');
            }
        } catch (error) {
            console.error("Error during OTP verification:", error);
            toast.error('Verification failed. Please try again.', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
        }
    };

    const handleInputChange = (index, value) => {
        if (value.length > 1) return;
        const newOtpDatas = [...otpDatas];
        newOtpDatas[index] = value;
        setOtpDatas(newOtpDatas);

        if (value !== '' && index < otpDatas.length - 1) {
            inputRefs.current[index + 1].current.focus();
        }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-600 p-4">
          <div className="w-full max-w-md mx-auto bg-slate-950 rounded-lg shadow-md overflow-hidden">
              <div className="p-8 text-center">
                  <h2 className="text-2xl font-semibold text-gray-800">Email Verification</h2>
                  <p className="mt-2 text-gray-600">Sent an OTP to your email {registeredEmail}</p>
              </div>
              <form onSubmit={handleVerification} method="post" className="px-8 pt-6 pb-8 mb-4">
                  <div className="flex justify-center gap-2 mb-6">
                      {otpDatas.map((value, index) => (
                          <input
                              key={index}
                              type="text"
                              name={`otp${index + 1}`}
                              value={value}
                              onChange={(e) => handleInputChange(index, e.target.value)}
                              className="w-12 h-12 text-center border rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                              ref={inputRefs.current[index]}
                              maxLength={1}
                              pattern="[0-9]"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              required
                          />
                      ))}
                  </div>
                  <div className="flex items-center justify-center">
                      <button
                          type="submit"
                          className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                          Verify Account
                      </button>
                      <a
                          href="#"
                          className="inline-block align-baseline font-bold text-sm text-teal-500 hover:text-teal-800 ml-4"
                      >
                          Resend OTP
                      </a>
                  </div>
              </form>
          </div>
          <ToastContainer />
      </div>
  );
}

export default UserOtp;


