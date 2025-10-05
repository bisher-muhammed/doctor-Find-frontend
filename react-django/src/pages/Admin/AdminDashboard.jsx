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
        <div className="flex h-screen">
            {/* Sidebar */}
            <AdminSidebar isAdmin={authentication_user.isAdmin} onLogout={logout} />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 bg-gray-100">
                {/* Header */}
                

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <TotalRevenueDisplay />

                    {/* Chart Section */}
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                        <RevenueChart />
                        {/* <ApexChart /> */}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;
