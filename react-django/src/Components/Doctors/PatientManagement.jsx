// src/components/PatientManagement.js
import React from 'react';
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";

const PatientManagement = ({ patients }) => {
    return (
        <Card className="max-w-3xl mx-auto my-4">
            <CardBody>
                <Typography variant="paragraph">Patient List</Typography>
                {/* Patient List */}
                <div className="flex justify-between mt-4">
                    <Typography variant="paragraph">John Doe</Typography>
                    <Button size="sm" color="blue">View Profile</Button>
                </div>
                {/* Add more patients as needed */}
            </CardBody>
        </Card>
    );
}

export default PatientManagement;
