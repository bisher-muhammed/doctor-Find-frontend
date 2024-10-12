// src/Components/Admin/AdminDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import RevenueChart from "../../Components/Admin/RevenueChart";
import TotalRevenueDisplay from "../../Components/Admin/TotalRevenueDisplay";
// import ApexChart from "../../Components/Admin/ApexChart";

function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authentication_user = useSelector((state) => state.authUser);

    const logout = () => {
        if (authentication_user.isAdmin) {
            localStorage.clear();
            dispatch(
                set_authentication({
                    userid: null,
                    name: null,
                    token: null,
                    isAuthenticated: false,
                    isAdmin: false,
                    isActive: false,
                    isDoctor: false,
                })
            );
            navigate("/admin/login");
        } else {
            alert("You are not authorized to log out from this section.");
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Replace the sidebar with the new AdminSidebar component */}
            <AdminSidebar isAdmin={authentication_user.isAdmin} onLogout={logout} />

            {/* Main Content Area */}
            <div style={{ flexGrow: 1, padding: 16, backgroundColor: '#f4f6f8' }}>
                {/* Total Revenue, Doctors, and Patients Boxes */}
                <TotalRevenueDisplay />

                {/* Chart Section */}
                <RevenueChart />
                {/* <ApexChart /> */}
            </div>
        </div>
    );
}

export default AdminDashboard;
