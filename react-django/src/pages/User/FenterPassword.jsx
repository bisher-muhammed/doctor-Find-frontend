import React,{useState} from 'react'
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardBody,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";

function Fenterpassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handlePasswordReset = async (event) => {
    event.preventDefault();

   
    const formData = new FormData();
    formData.append('password', event.target.fpassword.value);


    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/users/changePassword/${id}/`,
        formData
      );

      if (response.data.success) {
        navigate("/login");
        toast.success(' Password Reset Successfull');
        localStorage.clear()
      } else {
        // Handle unsuccessful password reset
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
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

export default Fenterpassword
