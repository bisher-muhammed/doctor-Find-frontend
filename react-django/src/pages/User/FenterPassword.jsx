import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import {
  Card,
  CardBody,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";

// Define password validation schema
const passwordSchema = Yup.string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
  .matches(/\d/, 'Must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character');

function Fenterpassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      // Validate password
      await passwordSchema.validate(password);

      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const formData = new FormData();
      formData.append('password', password);

      const response = await axios.post(
        `${baseURL}/api/users/changePassword/${id}/`,
        formData
      );

      if (response.data.success) {
        toast.success('Password reset successful');
        localStorage.clear();
        navigate("/login");
      } else {
        setError(response.data.message || 'Password reset failed');
      }
    } catch (err) {
      setError(err.message); // Yup or request error
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <Typography variant="h4" className="text-center text-blue-500 mb-6">
          Reset Your Password
        </Typography>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <CardBody className="space-y-6">
            <div>
              <Input
                type="password"
                color="blue"
                size="lg"
                label="New Password"
                placeholder="Enter New Password"
                name="fpassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                color="blue"
                size="lg"
                label="Confirm Password"
                placeholder="Confirm Your Password"
                name="spassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            )}
            <div className="flex justify-center">
              <Button color="blue" fullWidth type="submit">
                Confirm
              </Button>
            </div>
          </CardBody>
        </form>
      </Card>
    </div>
  );
}

export default Fenterpassword;
