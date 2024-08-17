import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";

function User_Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authentication_user = useSelector((state) => state.authUser);

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

    return (
        <nav className="bg-white p-5 fixed top-0 left-0 w-full z-10">
            <div className="container h-2 flex justify-between items-center">
                <Link to="/" className="text-black text-md font-bold p-4">Find Doctor</Link>
                <div className="flex space-x-5">
                    <Link to="/" className="text-black hover:text-gray-600">Home</Link>
                    <Link to="/doctor" className="text-black hover:text-gray-600">Doctor</Link>
                    <Link to="/about" className="text-black hover:text-gray-600">About</Link>
                    <Link to="/contact" className="text-black hover:text-gray-600">Contact</Link>
                </div>
                <div className="flex-1 flex justify-end space-x-4 items-center">
                    {authentication_user.isAuthenticated && !authentication_user.isDoctor && !authentication_user.isAdmin ? (
                        <>
                            <Link to="/user_details" className="self-center text-black hover:text-gray-600">{authentication_user.name}</Link>
                            <button onClick={logout} className="bg-yellow-500 text-black px-4 py-2 rounded">Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
                            <button onClick={() => navigate('/signup')} className="bg-green-500 text-white px-4 py-2 rounded">Signup</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default User_Navbar;

