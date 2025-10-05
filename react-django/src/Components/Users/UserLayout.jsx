import React from "react";
import { Outlet } from "react-router-dom";
import User_Navbar from "./User_Navbar"; 
import ProfileSidebar from "./../../pages/User/Profile/ProfileSidebar";
import MobileNavbar from "./MobileNavbar";

function UserLayout() {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Top Navbar */}
        <User_Navbar />
        
        {/* Main Content */}
        <div className="flex flex-1 pt-20">
          {/* Desktop Sidebar */}
          <ProfileSidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 w-full md:ml-60 overflow-y-auto px-4 pb-4">
            <div className="pb-4">
              <Outlet />
            </div>
            
            {/* Bottom spacer for mobile navigation */}
            <div className="md:hidden h-16" />
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavbar />
      </div>
    );
  }
  
  export default UserLayout;