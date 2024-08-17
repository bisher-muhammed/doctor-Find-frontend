import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DoctorPasswordReset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handlePasswordReset = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const formData = new FormData();
    formData.append('password', password);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/doctors/doctor/change-password/${id}/`,
        formData
      );

      if (response.data.success) {
        navigate("/doctor/login");
        toast.success('Password reset successful');
        localStorage.clear();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h2 className="text-3xl font-bold mb-6 text-yellow-500">Enter New Password</h2>
      <form onSubmit={handlePasswordReset} method="post" className="max-w-lg bg-yellow-600 rounded-xl p-8 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center border-2 py-2 px-3 rounded-2xl bg-yellow-200">
            <input
              className="pl-2 w-full outline-none border-none bg-yellow-200"
              type="password"
              name="password"
              placeholder="Enter New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center border-2 py-2 px-3 rounded-2xl bg-red-200">
            <input
              className="pl-2 w-full outline-none border-none bg-gray-200"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Your Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="w-full py-3 bg-gray-400 text-yellow-500 rounded-xl shadow-lg hover:bg-green-600 transition duration-300"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}

export default DoctorPasswordReset;
