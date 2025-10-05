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
import { registrationSchema } from "../validationSchema"; // Make sure the path is correct

function DoctorRegister() {
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();
  const authentication_user = useSelector(state => state.authUser);

  useEffect(() => {
    if (authentication_user.isAuthenticated && !authentication_user.isAdmin) {
      navigate('/home');
    }
  }, [authentication_user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' }); // clear field error as user types
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowCPassword = () => {
    setShowCPassword(!showCPassword);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      await registrationSchema.validate(formData, { abortEarly: false });
      setFormErrors({});
    } catch (validationErrors) {
      const errors = {};
      validationErrors.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      const res = await axios.post(`${baseURL}/api/doctors/doctor/register/`, {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password
      });

      if (res.status === 201) {
        const registeredEmail = res.data.email;
        localStorage.setItem("registeredEmail", registeredEmail);
        localStorage.setItem("user_id", res.data.user_id);
        toast.success("OTP sent successfully");
        navigate("/doctor/doctorOtp");
      }
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        if (error.response.status === 400) {
          if (errorData.email) {
            setFormErrors(prev => ({ ...prev, email: errorData.email[0] }));
          }
          toast.error("Registration failed");
        } else {
          toast.error("An unexpected error occurred");
        }
      } else {
        console.error("Request failed", error);
        toast.error("Network error. Please try again.");
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
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!formErrors.username}
              />
              {formErrors.username && (
                <Typography variant="small" color="red" className="mt-1">
                  {formErrors.username}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
              />
              {formErrors.email && (
                <Typography variant="small" color="red" className="mt-1">
                  {formErrors.email}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                error={!!formErrors.phone_number}
              />
              {formErrors.phone_number && (
                <Typography variant="small" color="red" className="mt-1">
                  {formErrors.phone_number}
                </Typography>
              )}
            </div>
            <div className="mb-4 relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={toggleShowPassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {formErrors.password && (
                <Typography variant="small" color="red" className="mt-1">
                  {formErrors.password}
                </Typography>
              )}
            </div>
            <div className="mb-4 relative">
              <Input
                label="Confirm Password"
                type={showCPassword ? "text" : "password"}
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                error={!!formErrors.password_confirm}
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={toggleShowCPassword}
              >
                {showCPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {formErrors.password_confirm && (
                <Typography variant="small" color="red" className="mt-1">
                  {formErrors.password_confirm}
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
