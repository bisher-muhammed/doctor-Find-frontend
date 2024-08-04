import React, { useState, useRef } from "react";

import { useNavigate } from "react-router-dom";


import axios from "axios";


import { toast,ToastContainer } from 'react-toastify';


import 'react-toastify/dist/ReactToastify.css';



function UserOtp() {

    const [otpDatas, setOtpDatas] = useState(['', '', '', '']);


    const inputRefs = useRef(Array.from({ length: 4 }, () => React.createRef()));

    
    const baseURL = 'http://127.0.0.1:8000';


    const navigate = useNavigate();


    const registeredEmail = localStorage.getItem('registeredEmail');

    
    console.log(registeredEmail);

    
    const handleVerification = async (event) => {
        
        event.preventDefault();

        
        const enteredotp = otpDatas.join('');

        
        console.log('enteredotp');
        console.log('Request payload:', { email: registeredEmail, otp: enteredotp });

        try {
            // Sending a POST request to verify the OTP.
            const res = await axios.post(baseURL + '/api/users/otpverify/', {
                email: registeredEmail,
                otp: enteredotp,
            });

            // If the response status is 200 (OK), the verification is successful.
            if (res.status === 200) {
                // Logging a success message to the console.
                console.log('Account created successfully');

                // Navigating to the login page.
                navigate('/login');

                // Clearing local storage.
                localStorage.clear();

                // Displaying a success toast notification.
                toast.success('Account created successfully',{
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


                ;
            } else {
                // Logging a failure message to the console if the response status is not 200.
                console.log('Verification failed');
            }
        } catch (error) {
            // Logging any errors encountered during the OTP verification process.
            console.error("Error during OTP verification:", error);
        }
    };

    // Defining the `handleInputChange` function to handle changes in the OTP input fields.
    const handleInputChange = (index, value) => {
        // Creating a copy of the current OTP values.
        const newOtpDatas = [...otpDatas];

        // Setting the new value at the given index.
        newOtpDatas[index] = value;

        // Updating the state with the new OTP values.
        setOtpDatas(newOtpDatas);

        // If the current input value is not empty and there is a next input field, move focus to the next input field.
        if (value !== '' && index < otpDatas.length - 1 && inputRefs.current[index + 1]?.current) {
            inputRefs.current[index + 1].current.focus();
        }
    };

    return (
        <div>
          <div className="container flex flex-col items-center justify-center bg-slate-300 p-4">
            <div className="flex flex-col items-center justify-center text-center space-y-2 mb-10">
              <div className="font-semibold text-2xl text-red-400">
                <p>Email Verification</p>
              </div>
              <div className="flex flex-row text-sm font-medium text-gray-500">
                <p>Sent an OTP to your email {registeredEmail}</p>
              </div>
            </div>
            <form onSubmit={handleVerification} method="post" className="w-full max-w-gray-900 p-8 shadow-lg">
              <div className="flex flex-col space-y-8">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-md">
                  <div className="flex flex-col space-y-8">
                    <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                      {otpDatas.map((value, index) => (
                        <div key={index} className="w-16 h-16 border border-solid border-yellow-500 rounded-xl">
                          <input
                            type="text"
                            name={`otp${index + 1}`}
                            value={value}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-yellow-500 text-lg bg-yellow-500 text-black focus:bg-yellow-400 focus:ring-1 ring-yellow-700"
                            ref={inputRefs.current[index]}
                          />
                        </div>
                      ))}
                    </div>
                    <button className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-yellow-500 border-none text-black text-sm shadow-sm">
                      Verify Account
                    </button>
                    {/* <div className="flex flex-col items-center justify-center">
                      {timer === 0 ? (
                        <span className="text-center text-red-500" onClick={handleResendOTP}>Resend OTP</span>
                      ) : (
                        <span className="text-center text-blue-500">Time remaining: <span className="text-red-500">{timer}</span> seconds</span>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    }

export default UserOtp

