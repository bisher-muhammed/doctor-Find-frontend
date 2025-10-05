import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import User_Footer from "../../Components/Users/User_Footer";
import User_Navbar from "../../Components/Users/User_Navbar";
import homeImg from '../../assets/homeImg.jpg';
import cardimg1 from '../../assets/cardimg1.jpg';
import cardimg2 from '../../assets/cardimg2.jpg';
import role2 from '../../assets/role2.avif';
import call from '../../assets/call.jpg';
import ArticleGenerator from "../../Components/Users/ArticleGenerator";

import '../../App.css';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { 
  ArrowRight, 
  Calendar, 
  Package, 
  Stethoscope, 
  Video,
  Heart,
  Shield,
  Clock,
  Users,
  DollarSign,
  Phone,
  CheckCircle,
  Activity
} from "lucide-react";

const User_Homepage = () => {
  const authentication_user = useSelector(state => state.authUser);
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState([
    { icon: Users, number: "0", label: "Patients Treated", loading: true },
    { icon: Stethoscope, number: "0", label: "Expert Doctors", loading: true },
    { icon: DollarSign, number: "₹0.00", label: "Total Revenue", loading: true },
    { icon: Activity, number: "24/7", label: "Medical Support", loading: false }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/admin/admin/total-revenue-and-counts/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { total_revenue, doctor_count, patient_count } = response.data;

        setStatsData([
          { 
            icon: Users, 
            number: patient_count.toLocaleString() + "+", 
            label: "Patients Treated", 
            loading: false 
          },
          { 
            icon: Stethoscope, 
            number: doctor_count.toLocaleString() + "+", 
            label: "Expert Doctors", 
            loading: false 
          },
          { 
            icon: DollarSign, 
            number: `₹${total_revenue.toFixed(2)}`, 
            label: "Total Revenue", 
            loading: false 
          },
          { 
            icon: Activity, 
            number: "24/7", 
            label: "Medical Support", 
            loading: false 
          }
        ]);

      } catch (err) {
        console.error("Error fetching stats data:", err);
        setError("Unable to load statistics");
        setStatsData([
          { icon: Users, number: "000+", label: "Patients Treated", loading: false },
          { icon: Stethoscope, number: "0+", label: "Expert Doctors", loading: false },
          { icon: DollarSign, number: "₹0.00", label: "Total Revenue", loading: false },
          { icon: Activity, number: "24/7", label: "Medical Support", loading: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, [baseURL, token]);

  const handleBookNow = () => {
    navigate("/doctors_list");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 via-white to-cyan-50">
      <User_Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="container mx-auto px-6 mt-24 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Typography className="text-cyan-600 text-lg font-medium tracking-wide">
                  Welcome to Healthcare
                </Typography>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  The hospital that cares for life and humanity
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Button 
                  size="lg"
                  onClick={handleBookNow}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 text-base font-medium shadow-lg rounded-lg"
                >
                  Discover More
                </Button>
                
                <div className="space-y-2">
                  <Typography className="text-gray-600 text-sm uppercase tracking-wider font-medium">
                    FOR APPOINTMENT
                  </Typography>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-cyan-600" />
                    <Typography className="text-2xl font-bold text-gray-900">
                      1800-657-876
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={homeImg}
                  alt="Medical Professional"
                  className="w-full h-[600px] object-cover"
                />
              </div>
            </div>
          </div>


          {/* Article Section */}
          <div className="py-20 bg-cyan-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <Typography className="text-cyan-600 text-sm uppercase tracking-wider font-semibold">
                  HEALTH ARTICLES
                </Typography>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Read Expert Health Articles
                </h2>
              </div>

              {/* Article Generator Component */}
              <ArticleGenerator />
            </div>
          </div>


        {/* About Section */}
        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 py-20">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left Content */}
              <div className="text-white space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Healthcare is dedicated to provide best treatment.
                </h2>
              </div>

              {/* Right Content */}
              <div className="text-white text-lg leading-relaxed space-y-4">
                <p>
                  A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.
                </p>
                <p>
                  I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine.
                </p>
              </div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <img
                  src={cardimg1}
                  alt="Pediatrician"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Typography className="text-cyan-300 text-sm mb-1">
                    For your child health
                  </Typography>
                  <Typography className="text-2xl font-bold">
                    Pediatrician
                  </Typography>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Typography className="text-cyan-300 text-sm mb-1">
                    For your child health
                  </Typography>
                  <Typography className="text-2xl font-bold">
                    Cardiologist
                  </Typography>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <img
                  src={role2}
                  alt="Dermatologist"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Typography className="text-cyan-300 text-sm mb-1">
                    For your child health
                  </Typography>
                  <Typography className="text-2xl font-bold">
                    Dermatologist
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="py-20 bg-gradient-to-b from-white to-cyan-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <Typography className="text-cyan-600 text-sm uppercase tracking-wider font-semibold">
                SERVICES & TREATMENTS
              </Typography>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                More than 40 specialty<br />and health care services
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <div className="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-pink-500" />
                </div>
                <Typography className="text-gray-900 font-semibold text-lg">
                  Mental Health
                </Typography>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-10 h-10 text-purple-500" />
                </div>
                <Typography className="text-gray-900 font-semibold text-lg">
                  Vaccination
                </Typography>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <div className="w-20 h-20 mx-auto mb-4 bg-cyan-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="w-10 h-10 text-cyan-500" />
                </div>
                <Typography className="text-gray-900 font-semibold text-lg">
                  Eye Diseases
                </Typography>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <div className="w-20 h-20 mx-auto mb-4 bg-yellow-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-yellow-500" />
                </div>
                <Typography className="text-gray-900 font-semibold text-lg">
                  Cardiology
                </Typography>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="w-10 h-10 text-gray-500" />
                </div>
                <Typography className="text-gray-900 font-semibold text-lg">
                  General Health
                </Typography>
              </div>
            </div>

            <div className="text-center">
              <Button 
                size="lg"
                onClick={handleBookNow}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 text-base font-medium shadow-lg rounded-lg"
              >
                See all Services
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-6">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-center">
                <Typography className="text-yellow-800 text-sm">
                  {error} - Showing default values
                </Typography>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-cyan-100 rounded-full flex items-center justify-center relative">
                      <IconComponent className="w-8 h-8 text-cyan-600" />
                      {stat.loading && (
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-200 border-t-cyan-600 animate-spin"></div>
                      )}
                    </div>
                    <div>
                      <Typography className="text-3xl md:text-4xl font-bold text-gray-900">
                        {stat.loading ? (
                          <div className="h-10 bg-gray-200 rounded animate-pulse mx-auto max-w-[120px]"></div>
                        ) : (
                          stat.number
                        )}
                      </Typography>
                      <Typography className="text-gray-600 text-sm mt-2">
                        {stat.label}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 py-16">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Take Control of Your Health?
              </h3>
              <Typography className="text-cyan-50 text-lg">
                Join thousands of satisfied patients who trust us with their healthcare needs.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg"
                  onClick={handleBookNow}
                  className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-base font-semibold shadow-xl flex items-center gap-3 rounded-lg"
                >
                  Book Appointment Now
                  <ArrowRight size={20} />
                </Button>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">100% Safe & Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <User_Footer />
    </div>
  );
};

export default User_Homepage;
