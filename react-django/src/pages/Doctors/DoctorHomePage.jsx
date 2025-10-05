import React from 'react';
import Sidebar from '../../Components/Doctors/Sidebar';
import SlotButton from '../../Components/Doctors/SlotButton';
import DoctorFooter from '../../Components/Doctors/DoctorFooter';

const DoctorHomePage = () => {
    return (
        <>
            {/* Sidebar */}
            <Sidebar />

            
                    {/* Metrics Cards */}
                    <SlotButton />
           
            {/* Footer */}
            <footer >
                <DoctorFooter />
            </footer>
        </>
    );
} 

export default DoctorHomePage;
