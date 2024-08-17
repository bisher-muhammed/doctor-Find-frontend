import React from 'react';
import { Card, CardBody, Avatar, Typography } from "@material-tailwind/react";

const ProfileCard = () => {
    return (
        <Card className="w-full max-w-sm mx-auto my-4 bg-gray-600 hover:bg-white">
            <CardBody className="flex items-center">
                <Avatar src="https://via.placeholder.com/150" alt="Doctor Image" />
                <div className="ml-4">
                    <Typography variant="h5" color="white">
                        Dr. Demo Name
                    </Typography>
                    <Typography variant="paragraph" color="gray">
                        Specialization
                    </Typography>
                </div>
            </CardBody>
        </Card>
    );
}

const DoctorProfiles = () => {
    return (
        <div className="flex flex-wrap justify-center">
            <ProfileCard />
            <ProfileCard />
            <ProfileCard />
        </div>
    );
}

export default DoctorProfiles;

