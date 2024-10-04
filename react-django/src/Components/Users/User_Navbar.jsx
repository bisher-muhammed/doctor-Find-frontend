import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";

function User_Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authentication_user = useSelector((state) => state.authUser);
    const location = useLocation(); // Use useLocation hook to get current location

    // Determine if the current path is a chat room
    const isChatRoom = location.pathname.startsWith('/chats/');

    // Logout function
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
        <nav className={`bg-white p-5 fixed top-0 left-0 ${isChatRoom ? 'w-1/3' : 'w-full'} z-10 ${isChatRoom ? 'bg-red-200' : 'bg-white'}`}>
            <div className={`container h-2 flex justify-between items-center ${isChatRoom ? ' container h-2 flex justify-start space-x-2 items- center text-gray-800' : 'text-black'}`}>
                <Link to="/" className="text-black text-md font-bold p-4 ">Find Doctor</Link>
                <div className="flex space-x-5">
                    <Link to="/" className={`hover:text-gray-600 ${isChatRoom ? 'text-red-800' : 'text-black'}`}>Home</Link>
                    <Link to="/doctors_list" className={`hover:text-gray-600 ${isChatRoom ? 'text-gray-800' : 'text-black'}`}>Doctor</Link>
                    <Link to="/about" className={`hover:text-gray-600 ${isChatRoom ? 'text-gray-800' : 'text-black'}`}>About</Link>
                    <Link to="/contact" className={`hover:text-gray-600 ${isChatRoom ? 'text-gray-800' : 'text-black'}`}>Contact</Link>
                </div>
                <div className="flex-1 flex justify-end space-x-4 items-center">
                    {authentication_user.isAuthenticated && !authentication_user.isDoctor && !authentication_user.isAdmin ? (
                        <>
                            <Link to="/user_details" className={`self-center ${isChatRoom ? 'text-gray-800' : 'text-black'} hover:text-gray-600`}>{authentication_user.name}</Link>
                            <button
    onClick={logout}
    className={`bg-yellow-500 text-black rounded ${isChatRoom ? 'px-2 py-2 text-sm' : 'px-4 py-2 text-base'} hover:bg-yellow-600 transition-colors duration-200`}
>
    Logout
</button>
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



