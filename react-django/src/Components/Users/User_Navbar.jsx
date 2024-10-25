import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";
import axios from "axios";

function User_Navbar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false); // State for chat room dropdown
    const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authentication_user = useSelector((state) => state.authUser);
    const location = useLocation();

    const isChatRoom = location.pathname.startsWith('/chats/');
    const token = localStorage.getItem('access');
    const baseURL = 'http://127.0.0.1:8000';

    const logout = () => {
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
        navigate('/login/');
    };

    const handleSearch = async (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        if (term) {
            try {
                const response = await axios.get(`${baseURL}/api/users/doctors_list/?search=${term}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFilteredResults(response.data);
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        } else {
            setFilteredResults([]); // Clear results if search term is empty
        }
    };

    return (
        <>
            {!isChatRoom ? (
                <nav className="bg-slate-400 p-4  fixed top-0 left-0 w-full z-10 shadow-md">
                    <div className="container mx-auto mb-1 flex justify-between items-center text-black">
                        <Link to="/" className="text-md font-bold">Find Doctor</Link>

                        {/* Mobile Menu Button */}
                        <button 
                            className="block md:hidden"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            ☰
                        </button>

                        {/* Search bar, login/signup/logout, and links */}
                        <div className="flex items-center space-x-4">
                            {/* Links for larger screens */}
                            <div className="hidden md:flex space-x-8">
                                <Link to="/" className="hover:text-gray-600">Home</Link>
                                <Link to="/doctors_list" className="hover:text-gray-600">Doctor</Link>
                                <Link to="/about" className="hover:text-gray-600">About</Link>
                                {/* <Link to="/contact" className="hover:text-gray-600">Contact</Link> */}
                            </div>

                            {/* Search Bar */}
                            <div className="relative border rounded-lg overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Login/Signup/Logout */}
                            <div className="flex items-center space-x-4">
                                {authentication_user.isAuthenticated ? (
                                    <>
                                        <Link to="/user_details" className="hover:text-gray-600">{authentication_user.name}</Link>
                                        <button onClick={logout} className="bg-yellow-500 text-black rounded px-4 py-2 hover:bg-yellow-600 transition-colors duration-200">Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200">Login</button>
                                        <button onClick={() => navigate('/signup')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200">Signup</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Render filtered results */}
                        {filteredResults.length > 0 && (
                            <div className="absolute z-50 mt-2 p-4 bg-white shadow rounded w-full">
                                <h2 className="text-lg font-semibold">Search Results:</h2>
                                <ul>
                                    {filteredResults.map((doctor) => (
                                        <li key={doctor.id} className="hover:text-blue-500">
                                            <Link to={`/doctor_details/${doctor.id}`}>{doctor.username}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div className="md:hidden bg-white shadow-md p-4">
                            <div className="flex flex-col space-y-2">
                                <Link to="/" className="hover:text-gray-600">Home</Link>
                                <Link to="/doctors_list" className="hover:text-gray-600">Doctor</Link>
                                <Link to="/about" className="hover:text-gray-600">About</Link>
                                {/* <Link to="/contact" className="hover:text-gray-600">Contact</Link> */}
                            </div>
                        </div>
                    )}
                </nav>
            ) : (
                // Dropdown for Chat Room
                <div className="bg-white p-5 fixed top-0 left-0 w-full z-10 shadow-md">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="text-black bg-gray-300 px-4 py-2 rounded-md"
                >
                    &#9776;
                </button>

                    {dropdownOpen && (
                        <div className="absolute top-12 left-0 bg-white shadow-lg rounded-md p-4 z-20">
                            <ul className="flex flex-col space-y-2">
                                <Link to="/" className="hover:text-gray-600">Home</Link>
                                <Link to="/doctors_list" className="hover:text-gray-600">Doctor</Link>
                                <Link to="/about" className="hover:text-gray-600">About</Link>
                                {/* <Link to="/contact" className="hover:text-gray-600">Contact</Link> */}
                                <li><button onClick={logout} className="hover:text-gray-600">Logout</button></li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default User_Navbar;

