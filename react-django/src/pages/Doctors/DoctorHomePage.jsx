import React from 'react';
import Header from '../../Components/Doctors/Header';
import Sidebar from '../../Components/Doctors/Sidebar';
import Card from '../../Components/Doctors/CardLIst'; // Ensure the correct import

const DoctorHomePage = () => {
    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-64"> {/* Add margin-left to offset the sidebar */}
                {/* Header */}
                <Header />

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <Card title="Appointments" count={20} bgColor="#C70039" />
                        <Card title="Doctors Count" count={14} bgColor="#336eff" />
                        <Card title="Patients Count" count={50} bgColor="#581845" />
                    </div>

                    {/* Additional content such as ProfileCard and Appointments can go here */}
                </div>
            </div>
        </div>
    );
}

export default DoctorHomePage;
