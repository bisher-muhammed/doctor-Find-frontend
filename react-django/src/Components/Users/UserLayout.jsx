import React from "react";
import { Outlet } from "react-router-dom";
import User_Navbar from "./User_Navbar"; // Adjust the path as necessary
import ProfileSidebar from "./../../pages/User/Profile/ProfileSidebar";

function UserLayout() {
    return (
        <div className="flex">
            <User_Navbar />
            <ProfileSidebar/>
            <main className="flex-1 ml-64">
                <Outlet /> {/* This will render the child routes */}
            </main>
        </div>
    );
}

export default UserLayout;

