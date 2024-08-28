import React, { useState } from 'react';
import axios from 'axios';

const DoctorProfileForm = () => {
  const baseURL = 'http://127.0.0.1:8000';
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    specification: '',
    bio: '',
    experience: '',
    available_from: '',
    available_to: '',
  });
  const [errors, setErrors] = useState({});

  // Function to get the authentication token
  const getAuthToken = () => localStorage.getItem('authToken');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${baseURL}/api/doctors/doctor/`, formData, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
      .then(response => {
        alert(response.data.success);
        // Handle successful profile update (e.g., redirect or show a message)
      })
      .catch(error => {
        if (error.response) {
          setErrors(error.response.data);
        }
        console.error("Error updating profile:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">Update Your Doctor Profile</h2>
      <form onSubmit={handleSubmit} className="max-w-lg bg-white rounded-xl p-8 shadow-lg">
        <div className="mb-4">
          <label htmlFor="first_name" className="block text-lg font-medium mb-1">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="second_name" className="block text-lg font-medium mb-1">Second Name</label>
          <input
            type="text"
            id="second_name"
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {errors.second_name && <p className="text-red-500 text-sm">{errors.second_name}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="specification" className="block text-lg font-medium mb-1">Specification</label>
          <input
            type="text"
            id="specification"
            name="specification"
            value={formData.specification}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {errors.specification && <p className="text-red-500 text-sm">{errors.specification}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="bio" className="block text-lg font-medium mb-1">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="experience" className="block text-lg font-medium mb-1">Experience (Years)</label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="available_from" className="block text-lg font-medium mb-1">Available From</label>
          <input
            type="time"
            id="available_from"
            name="available_from"
            value={formData.available_from}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {errors.available_from && <p className="text-red-500 text-sm">{errors.available_from}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="available_to" className="block text-lg font-medium mb-1">Available To</label>
          <input
            type="time"
            id="available_to"
            name="available_to"
            value={formData.available_to}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {errors.available_to && <p className="text-red-500 text-sm">{errors.available_to}</p>}
        </div>

        <div className="flex items-center justify-center">
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfileForm;
