import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaCogs, FaSignOutAlt, FaCalendarCheck, FaStethoscope } from "react-icons/fa";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@material-tailwind/react";
import { useSelector, useDispatch } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";

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
      navigate("/");
    } else {
      alert("You are not authorized to log out from this section.");
    }
  };

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white min-h-screen">
        <div className="p-4">
          <h2 className="text-2xl font-bold backgroud-color- bg-red-400">Admin Panel</h2>
        </div>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/admin/dashboard"
                className="flex items-center p-4 hover:bg-gray-700"
                activeClassName="bg-gray-700"
              >
                <FaTachometerAlt className="mr-2 " />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                className="flex items-center p-4 hover:bg-gray-700"
                activeClassName="bg-gray-700"
              >
                <FaUsers className="mr-2" />
                Users
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/doctors"
                className="flex items-center p-4 hover:bg-gray-700"
                activeClassName="bg-gray-700"
              >
                <FaStethoscope className="mr-2" />
                Doctors
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/appointments"
                className="flex items-center p-4 hover:bg-gray-700"
                activeClassName="bg-gray-700"
              >
                <FaCalendarCheck className="mr-2" />
                Appointments
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/settings"
                className="flex items-center p-4 hover:bg-gray-700"
                activeClassName="bg-gray-700"
              >
                <FaCogs className="mr-2" />
                Settings
              </NavLink>
            </li>
            <li>
              <button
                onClick={logout}
                className="flex items-center w-full p-4 hover:bg-gray-700"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4 bg-gray-100">
        <Card>
          <CardHeader color="blue" className="text-white">
            <h2 className="text-2xl">Dashboard</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Total Users</h3>
                <p className="text-gray-700">Number of registered users: 500</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Total Doctors</h3>
                <p className="text-gray-700">Number of registered doctors: 150</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Appointments Today</h3>
                <p className="text-gray-700">Number of appointments scheduled: 75</p>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button color="red">View More</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default AdminDashboard;

