import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Typography,
} from "@material-tailwind/react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function DoctorRegister() {
  const baseURL = "http://127.0.0.1:8000";
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [cpasswordError, setCPasswordError] = useState("");
  const [phone_numberError, setPhone_numberError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const navigate = useNavigate();
  const authentication_user = useSelector(state => state.authUser);
    
  useEffect(() => {
    if (authentication_user.isAuthenticated && !authentication_user.isAdmin) {
      navigate('/home');
    }
  }, [authentication_user, navigate]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowCPassword = () => {
    setShowCPassword(!showCPassword);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const email = event.target.email.value;
    const phone_number = event.target.phone_number.value;
    const password = event.target.password.value;
    const cpassword = event.target.cpassword.value;
    const alphabeticRegex = /^[A-Za-z]+$/;

    // Form validation
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }
    if (!alphabeticRegex.test(username)) {
      setUsernameError("Username must contain only alphabetic characters");
      return;
    }
    if (username.length > 0 && username.length < 4) {
      setUsernameError("Length must be at least 4 characters");
      return;
    }
    if (!email.trim()) {
      setEmailError("Email is required *");
      return;
    }
    if (!phone_number.trim()) {
      setPhone_numberError("Phone number is required *");
      return;
    }
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }
    if (password.length > 0 && password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (!cpassword.trim()) {
      setCPasswordError("Confirm password is required");
      return;
    }
    if (password !== cpassword) {
      setCPasswordError("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("phone_number", phone_number);
    formData.append("password", password);

    try {
      const res = await axios.post(`${baseURL}/api/doctors/doctor/register/`, formData);
      if (res.status === 201) { // Changed to 201 for successful creation
        console.log("Server response:", res.data);
        const registeredEmail = res.data.email;
        localStorage.setItem("registeredEmail", registeredEmail);
        localStorage.setItem("user_id", res.data.user_id);
        toast.success("OTP sent successfully");
        console.log("Navigating to /doctor/doctorOtp");
        navigate("/doctor/doctorOtp");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 406) {
          toast.error("Registration failed");
        } else if (error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData.email) {
            setEmailError(errorData.email);
          }
          toast.error("Registration failed");
        } else {
          toast.error("An unexpected error occurred");
        }
      } else {
        console.log(error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardBody>
          <Typography variant="h4" color="blue-gray" className="text-center">
            Doctor Registration
          </Typography>
          <form onSubmit={handleFormSubmit} className="mt-6">
            <div className="mb-4">
              <Input
                label="Username"
                type="text"
                name="username"
                error={!!usernameError}
              />
              {usernameError && (
                <Typography variant="small" color="red" className="mt-1">
                  {usernameError}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input label="Email" type="email" name="email" error={!!emailError} />
              {emailError && (
                <Typography variant="small" color="red" className="mt-1">
                  {emailError}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                label="Phone Number"
                type="text"
                name="phone_number"
                error={!!phone_numberError}
              />
              {phone_numberError && (
                <Typography variant="small" color="red" className="mt-1">
                  {phone_numberError}
                </Typography>
              )}
            </div>
            <div className="mb-4 relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                error={!!passwordError}
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={toggleShowPassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {passwordError && (
                <Typography variant="small" color="red" className="mt-1">
                  {passwordError}
                </Typography>
              )}
            </div>
            <div className="mb-4 relative">
              <Input
                label="Confirm Password"
                type={showCPassword ? "text" : "password"}
                name="cpassword"
                error={!!cpasswordError}
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={toggleShowCPassword}
              >
                {showCPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {cpasswordError && (
                <Typography variant="small" color="red" className="mt-1">
                  {cpasswordError}
                </Typography>
              )}
            </div>
            {loginError && (
              <Typography variant="small" color="red" className="mt-4">
                {loginError}
              </Typography>
            )}
            <CardFooter className="pt-0">
              <Button type="submit" fullWidth>
                Register
              </Button>
            </CardFooter>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default DoctorRegister;
