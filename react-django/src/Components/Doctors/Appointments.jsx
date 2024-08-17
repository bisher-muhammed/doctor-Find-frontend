import React from 'react';
import { Card, CardHeader, CardBody, Typography, IconButton } from "@material-tailwind/react";
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const Appointments = ({ appointments = [] }) => {
    return (
        <Card className="max-w-xl mx-auto shadow-lg">
            <CardHeader floated={false} shadow={false} className="bg-blue-500 py-4">
                <Typography variant="h5" color="white" className="text-center">
                    Upcoming Appointments
                </Typography>
            </CardHeader>
            <CardBody className="space-y-4">
                {appointments.length > 0 ? (
                    appointments.map((appointment, index) => (
                        <div key={index} className="flex items-start justify-between border-b pb-4">
                            <div>
                                <Typography variant="h6" className="font-medium">
                                    {appointment.name}
                                </Typography>
                                <div className="flex items-center text-sm text-gray-500">
                                    <FaCalendarAlt className="h-5 w-5 mr-2" />
                                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <FaClock className="h-5 w-5 mr-2" />
                                    <span>{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <IconButton color="blue" className="rounded-full">
                                {/* You can add an icon here for actions if needed */}
                            </IconButton>
                        </div>
                    ))
                ) : (
                    <Typography variant="paragraph" color="gray">
                        No upcoming appointments.
                    </Typography>
                )}
            </CardBody>
        </Card>
    );
}

export default Appointments;
