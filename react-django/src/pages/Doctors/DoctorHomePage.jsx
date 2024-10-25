import React from 'react';

import Sidebar from '../../Components/Doctors/Sidebar';
import SlotButton from '../../Components/Doctors/SlotButton';

const DoctorHomePage = () => {
    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-64"> {/* Add margin-left to offset the sidebar */}
                {/* Header */}
                

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Metrics Cards */}
                    <SlotButton />

                    {/* Additional content such as ProfileCard and Appointments can go here */}
                </div>
            </div>
        </div>
    );
}

export default DoctorHomePage;
