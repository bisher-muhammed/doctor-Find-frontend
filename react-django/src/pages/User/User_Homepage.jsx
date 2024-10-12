import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import User_Footer from "../../Components/Users/User_Footer";
import User_Navbar from "../../Components/Users/User_Navbar";
import homeImg from '../../assets/homeImg.jpg';
import cardimg1 from '../../assets/cardimg1.jpg';
import cardimg2 from '../../assets/cardimg2.jpg';
import role2 from '../../assets/role2.avif';
import call from  '../../assets/call.jpg';


import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

const cardsData = [
  {
    imgSrc:cardimg1,
    title: "Book Appoinment",
    description: "Find doctors near to you and book your slots."
  },
  {
    imgSrc: cardimg2,
    title: "Health Packages",
    description: "Best offers & deals on healthpackages"
  },
  {
    imgSrc: role2,
    title: "Treatments & Surgeries",
    description: "Get expert care from the bestsurgeons"
  },
  {
    imgSrc: call,
    title: "Video Consultations",
    description: "Consult your doctor from the comfort of your home."
  }
];

function User_Homepage() {
  const authentication_user = useSelector(state => state.authUser);
  console.log(authentication_user.name);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <User_Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="bg-white p-6 flex flex-col lg:flex-row items-center justify-between relative">
          {/* Text Content */}
          <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-teal-600 mb-4">Welcome</h2>
            <h1 className="text-3xl md:text-4xl text-black mb-6 font-mono subpixel-antialiased font-bold">
              Medical Clinic that<br />
            </h1>
            <h1 className="text-3xl md:text-4xl text-teal-700 mb-4 font-bold">
              You can Trust
            </h1>
            <p className="text-base md:text-lg text-red-300 mb-6">
              At Find Doctor, we are dedicated to connecting you with the best medical professionals who meet your specific needs.<br />
              Our platform provides easy access to a network of highly qualified doctors, making it simple to find and schedule consultations with specialists across various fields. Whether you're seeking a routine check-up or specialized treatment, Find Doctor offers a convenient and reliable way to receive the care you need from trusted healthcare providers.
            </p>
            <div className="flex flex-col sm:flex-row">
              <button className="bg-teal-400 px-4 py-2 mb-4 sm:mb-0 sm:mr-4 text-base md:text-lg border-2 border-black rounded-full hover:bg-green-900">
                Bookings
              </button>
              <button className="bg-white px-4 py-2 text-base md:text-lg border-2 border-teal-500 rounded-full hover:bg-neutral-900">
                More Info
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
            <img
              src={homeImg}
              alt="Home"
              className="max-w-full h-auto object-cover rounded"
            />
          </div>
        </div>

        {/* Card Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardsData.map((card, index) => (
            <Card key={index} className="mt-6 w-full  bg-white">
              <CardHeader color="blue-gray" className="relative h-56 pt-7">
                <img
                  src={card.imgSrc}
                  alt={`card-image-${index}`}
                  className="w-full h-full object-cover"
                />
              </CardHeader>
              <CardBody>
                <Typography variant="h5" color="red" className="mb-4">
                  {card.title}
                </Typography>
                <Typography color="gray">
                  {card.description}
                </Typography>
              </CardBody>
              <CardFooter className="pt-6">
                <Button className="mt-6" color="teal">Read More</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Feature Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Find Doctors</h2>
            <p className="text-gray-600 mb-4">
              Search for doctors based on specialty, location, and availability.
            </p>
            <Link to="/find-doctors" className="text-blue-500 hover:underline">
              Find Doctors
            </Link>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">My Appointments</h2>
            <p className="text-gray-600 mb-4">
              View and manage your upcoming and past appointments.
            </p>
            <Link to="/my-appointments" className="text-blue-500 hover:underline">
              View Appointments
            </Link>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600 mb-4">
              Update your personal information and manage your account settings.
            </p>
            <Link to="/profile" className="text-blue-500 hover:underline">
              Update Profile
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <User_Footer />
    </div>
  );
}

export default User_Homepage;