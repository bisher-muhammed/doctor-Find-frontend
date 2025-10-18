import React, { useEffect, useState, useRef } from "react";
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
  Activity,
  Star,
  Award,
  ThumbsUp,
  ArrowUpRight
} from "lucide-react";

const User_Homepage = () => {
  const authentication_user = useSelector(state => state.authUser);
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

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

  const handleEmergencyCall = () => {
    window.open('tel:1800657876');
  };

  const services = [
    { icon: Heart, name: "Mental Health", color: "pink", description: "Professional mental health support" },
    { icon: Activity, name: "Vaccination", color: "purple", description: "Complete vaccination services" },
    { icon: Stethoscope, name: "Eye Diseases", color: "cyan", description: "Advanced eye care treatments" },
    { icon: Heart, name: "Cardiology", color: "yellow", description: "Heart health and cardiology" },
    { icon: Stethoscope, name: "General Health", color: "gray", description: "Comprehensive health checkups" }
  ];

  const features = [
    { icon: Clock, title: "24/7 Availability", description: "Round the clock medical support" },
    { icon: Shield, title: "Safe & Secure", description: "Your health data is protected" },
    { icon: Award, title: "Quality Care", description: "Certified healthcare professionals" },
    { icon: ThumbsUp, title: "Easy Booking", description: "Simple and fast appointments" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 via-white to-cyan-50">
      <User_Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-6 mt-24 mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-600 text-lg font-medium tracking-wide">
                    <Star className="w-5 h-5 fill-cyan-600" />
                    Welcome to Healthcare
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                    The hospital that{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
                      cares
                    </span>{" "}
                    for life
                  </h1>
                  
                  <Typography className="text-xl text-gray-600 leading-relaxed">
                    Experience world-class healthcare with compassionate professionals 
                    dedicated to your well-being and recovery.
                  </Typography>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <Button 
                    size="lg"
                    onClick={handleBookNow}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 text-base font-medium shadow-lg rounded-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    Book Appointment
                    <ArrowRight size={20} />
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="lg"
                    onClick={handleEmergencyCall}
                    className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 px-8 py-4 text-base font-medium rounded-lg transition-all duration-300"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Emergency Call
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">50+</div>
                    <div className="text-sm text-gray-600">Specialties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">99%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">5★</div>
                    <div className="text-sm text-gray-600">Rated Care</div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative animate-fade-in">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                  <img
                    src={homeImg}
                    alt="Medical Professional"
                    className="w-full h-[600px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  {/* Floating Card */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <Typography className="font-semibold text-gray-900">
                          Instant Online Consultation
                        </Typography>
                        <Typography className="text-sm text-gray-600">
                          Connect with doctors in minutes
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index}
                    className="text-center p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-cyan-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-cyan-600" />
                    </div>
                    <Typography className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </Typography>
                    <Typography className="text-gray-600">
                      {feature.description}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Article Section */}
        <section className="py-20 bg-cyan-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 animate-fade-in-up">
              <Typography className="text-cyan-600 text-sm uppercase tracking-wider font-semibold mb-2">
                HEALTH ARTICLES
              </Typography>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Read Expert Health Articles
              </h2>
              <Typography className="text-gray-600 text-lg max-w-2xl mx-auto">
                Stay informed with the latest medical insights and health tips from our expert doctors
              </Typography>
            </div>

            {/* Article Generator Component */}
            <ArticleGenerator />
          </div>
        </section>

        {/* About Section */}
        <section className="bg-gradient-to-br from-cyan-500 to-teal-600 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left Content */}
              <div className="text-white space-y-6 animate-fade-in-left">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Healthcare dedicated to provide{" "}
                  <span className="text-cyan-200">exceptional</span> treatment.
                </h2>
              </div>

              {/* Right Content */}
              <div className="text-white text-lg leading-relaxed space-y-4 animate-fade-in-right">
                <p>
                  Our state-of-the-art facilities and experienced medical professionals 
                  work together to provide you with the highest quality healthcare experience.
                </p>
                <p>
                  We believe in treating not just the illness, but the whole person - 
                  with compassion, dignity, and respect.
                </p>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outlined" 
                    className="border-white text-white hover:bg-white/10"
                    onClick={handleBookNow}
                  >
                    Learn More
                  </Button>
                  <Button 
                    className="bg-white text-cyan-600 hover:bg-gray-100"
                    onClick={handleBookNow}
                  >
                    Our Services
                  </Button>
                </div>
              </div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[cardimg1, cardimg2, role2].map((img, index) => (
                <div 
                  key={index}
                  className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
                >
                  <img
                    src={img}
                    alt={`Service ${index + 1}`}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Typography className="text-cyan-300 text-sm mb-1">
                      Specialized Care
                    </Typography>
                    <Typography className="text-2xl font-bold mb-2">
                      {['Pediatrician', 'Cardiologist', 'Dermatologist'][index]}
                    </Typography>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm">Learn more</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gradient-to-b from-white to-cyan-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4 animate-fade-in-up">
              <Typography className="text-cyan-600 text-sm uppercase tracking-wider font-semibold">
                SERVICES & TREATMENTS
              </Typography>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                More than 40 specialty<br />and health care services
              </h2>
              <Typography className="text-gray-600 text-lg max-w-2xl mx-auto">
                Comprehensive medical services tailored to meet all your healthcare needs 
                with cutting-edge technology and compassionate care.
              </Typography>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                const colorClasses = {
                  pink: 'bg-pink-50 text-pink-500',
                  purple: 'bg-purple-50 text-purple-500',
                  cyan: 'bg-cyan-50 text-cyan-500',
                  yellow: 'bg-yellow-50 text-yellow-500',
                  gray: 'bg-gray-50 text-gray-500'
                };

                return (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${colorClasses[service.color]}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <Typography className="text-gray-900 font-semibold text-lg mb-2">
                      {service.name}
                    </Typography>
                    <Typography className="text-gray-600 text-sm">
                      {service.description}
                    </Typography>
                  </div>
                );
              })}
            </div>

            <div className="text-center animate-fade-in-up">
              <Button 
                size="lg"
                onClick={handleBookNow}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 text-base font-medium shadow-lg rounded-lg transform hover:scale-105 transition-all duration-300"
              >
                Explore All Services
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="bg-white py-20">
          <div className="container mx-auto px-6">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-center max-w-2xl mx-auto animate-fade-in">
                <Typography className="text-yellow-800 text-sm">
                  {error} - Showing default values
                </Typography>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="text-center space-y-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="w-20 h-20 mx-auto bg-cyan-100 rounded-full flex items-center justify-center relative transform hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 text-cyan-600" />
                      {stat.loading && (
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-200 border-t-cyan-600 animate-spin"></div>
                      )}
                    </div>
                    <div>
                      <Typography className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {stat.loading ? (
                          <div className="h-10 bg-gray-200 rounded animate-pulse mx-auto max-w-[120px]"></div>
                        ) : (
                          stat.number
                        )}
                      </Typography>
                      <Typography className="text-gray-600 text-sm">
                        {stat.label}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-cyan-600 to-teal-600 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="container mx-auto px-6 text-center relative">
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Take Control of Your Health?
              </h3>
              <Typography className="text-cyan-50 text-lg">
                Join thousands of satisfied patients who trust us with their healthcare needs. 
                Your journey to better health starts here.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg"
                  onClick={handleBookNow}
                  className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-base font-semibold shadow-xl flex items-center gap-3 rounded-lg transform hover:scale-105 transition-all duration-300"
                >
                  Book Appointment Now
                  <ArrowRight size={20} />
                </Button>
                <Button
                  variant="outlined"
                  size="lg"
                  onClick={handleEmergencyCall}
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-base font-semibold rounded-lg transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Help
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 pt-6 text-cyan-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">100% Safe & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Certified Professionals</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <User_Footer />
    </div>
  );
};

export default User_Homepage;
