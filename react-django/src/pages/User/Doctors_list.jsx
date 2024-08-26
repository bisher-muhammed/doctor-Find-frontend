import axios from 'axios';
import React, { useEffect, useState } from 'react';
import User_Navbar from '../../Components/Users/User_Navbar';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FaUserMd, FaCalendarAlt } from 'react-icons/fa';

function DoctorsList() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const baseURL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('access');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/users/doctors_list/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDoctors(response.data);
            } catch (error) {
                setError(error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [token, navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading doctors: {error.message}</div>;

    return (
        <main className="container mx-auto p-4">
            <User_Navbar />
            <h2 className="text-2xl text-center text-lime-950 font-serif mb-8 mt-10">Meet Our Expert Doctors</h2>

            {doctors.length === 0 ? (
                <p className="text-center text-lg">No verified doctors found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 w-full px-4">
                    {doctors.map(doctor => (
                        <Card key={doctor.id} className="shadow-md rounded-lg overflow-hidden max-w-xs mx-auto">
                            <CardHeader className="relative h-56">
                                <img
                                    src={doctor.profile_pic}  // Ensure the URL is correct
                                    alt={`${doctor.username}'s profile`}
                                    className="w-full h-full object-cover rounded-t-lg"
                                />
                            </CardHeader>
                            <CardBody className="p-4">
                                <Typography variant="h4" color="blue-gray" className="mb-2 font-semibold text-lg uppercase">
                                    {doctor.username}
                                </Typography>
                                <Typography className="flex items-center mb-2 text-lg font-mono text-indigo-950">
                                    <FaUserMd className="mr-2 text-blue-500" />
                                    <strong className="text-lg text-neutral-900">Specification:</strong> {doctor.specification}
                                </Typography>
                                <Typography className="flex items-center mb-2 text-lg font-mono text-indigo-900">
                                    <FaCalendarAlt className="mr-2 text-red-500" />
                                    <strong className="text-lg text-neutral-900">Experience:</strong> {doctor.experience} years
                                </Typography>
                            </CardBody>
                            <CardFooter className="p-4">
                                <Button onClick={() => navigate(`/doctor_details/${doctor.id}`)} className="w-full" color="teal">
                                    Book Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}

export default DoctorsList;
