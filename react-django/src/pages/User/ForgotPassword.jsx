import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button, Input } from "@material-tailwind/react";

function ForgotPassword() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL

  const handleEmail = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;

    try {
      const res = await axios.post(
        `${baseURL}/api/users/fpassword/`,
        {
          email: email,
        }
      );

      if (res.status === 200) {
        console.log('response is ', res.data);
        const registeredEmail = res.data.email;
        console.log(registeredEmail);
        localStorage.setItem('registeredEmail', registeredEmail);
        localStorage.setItem('user_id', res.data.user_id);
        toast.success('Email ID available');
        navigate("/FPotp");
      } else {
        toast.error('Email does not exist');
      }
    } catch (error) {
      console.log("Error occurred while checking the user's existence", error);
      toast.error('An error occurred. Please try again.');
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-700 via-gray-900 to-black">
      <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="font-bold text-3xl text-yello-gray-400">Forgot Password</h3>
        </div>
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-lg font-medium text-gray-300">Enter your registered email</h2>
          <form onSubmit={handleEmail} className="w-full max-w-md space-y-4">
            <Input
              type="email"
              name="email"
              color="yellow"
              size="lg"
              outline={true}
              placeholder="Email"
              required
            />
            <Button
              type="submit"
              color="teal"
              ripple=""
              className="w-full py-4 font-semibold rounded-xl shadow-md"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

