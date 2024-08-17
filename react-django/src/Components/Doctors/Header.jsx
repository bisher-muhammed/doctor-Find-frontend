import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { set_authentication } from "../../Redux/authenticationSlice";
import { Navbar, MobileNav, Typography, Button, IconButton } from "@material-tailwind/react";

const Header = () => {
    const [openNav, setOpenNav] = React.useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
  
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 960) {
                setOpenNav(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    const logout = () => {
        console.log("Logging out...");
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
        navigate('/doctor/login');
    };
  
    const authentication_user = useSelector((state) => state.authUser);
  
    const navList = (
        <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-4 mt-2 mb-4 lg:mt-0 lg:mb-0 justify-center lg:justify-start">
            <li>
                <Link to="/" className="text-black p-1 font-normal">Home</Link>
            </li>
            <li>
                <Link to="/doctors" className="text-black p-1 font-normal">Doctors</Link>
            </li>
            <li>
                <Link to="/doctor/Slots/Slots" className="text-black p-1 font-normal">Slots</Link>
            </li>
            <li>
                <Link to="/contacts" className="text-black p-1 font-normal">Contacts</Link>
            </li>
        </ul>
    );
  
    return (
        <Navbar className="sticky  top-0 z-10 w-full bg-white border-b border-gray-200 shadow-lg">
            <div className="flex items-center justify-between px-4 py-2">
                <Link to="/" className="text-black font-bold text-xl">
                    Find Doctor
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex">
                        {navList}
                    </div>
                    <div className="flex items-center gap-x-1">
                        {authentication_user.isAuthenticated ? (
                            <>
                                <span className="hidden lg:inline-block">{authentication_user.name}</span>
                                <Button
                                    variant="text"
                                    size="sm"
                                    className="hidden lg:inline-block"
                                    onClick={logout}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="text"
                                    size="sm"
                                    className="hidden lg:inline-block"
                                    onClick={() => navigate('/doctor/login')}
                                >
                                    Log In
                                </Button>
                            </>
                        )}
                        <IconButton
                            variant="text"
                            className="ml-auto h-6 w-6 text-inherit lg:hidden"
                            ripple={false}
                            onClick={() => setOpenNav(!openNav)}
                        >
                            {openNav ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </IconButton>
                    </div>
                </div>
            </div>
            <MobileNav open={openNav}>
                {navList}
                <div className="flex flex-col items-center gap-x-1 mt-4">
                    {authentication_user.isAuthenticated ? (
                        <>
                            <span className="my-2">{authentication_user.name}</span>
                            <Button fullWidth variant="text" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button fullWidth variant="text" size="sm" onClick={() => navigate('/doctor/login')}>
                                Log In
                            </Button>
                        </>
                    )}
                </div>
            </MobileNav>
        </Navbar>
    );
};

export default Header;