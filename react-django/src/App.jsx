import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoutes from './Components/PrivateRoutes/PrivateRoutes';
import './App.css';

// Importing pages and components
import UserRegistration from './pages/User/UserRegistration';
import Loginpage from './pages/User/Loginpage';
import UserOtp from './pages/User/UserOtp';
import ForgotPassword from './pages/User/ForgotPassword';
import User_Homepage from './pages/User/User_Homepage';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import DoctorRegister from './pages/Doctors/DoctorRegister';
import DoctorLogin from './pages/Doctors/DoctorLogin';
import DoctorOtp from './pages/Doctors/DoctorOtp';
import FPotp from './pages/User/FPotp';
import Fenterpassword from './pages/User/FenterPassword';
import DoctorProfileForm from './pages/Doctors/DoctorProfileForm';
import DoctorHomePage from './pages/Doctors/DoctorHomePage';
import DoctorForgotPassword from './pages/Doctors/DoctorForgotPassword';
import DoctorFotp from './pages/Doctors/DoctorFotp';
import DoctorPasswordReset from './pages/Doctors/DoctorPasswordReset';
import UProfile from './pages/User/Profile/UProfile';
import EditProfile from './pages/User/Profile/EditProfile';
import SlotsPage from './pages/Doctors/Slots/SlotsPage';
import DoctorProfile from './pages/Doctors/DoctorProfile';
import EditDoctorProfile from './pages/Doctors/EditDoctorProfile';
import DocumentList from './pages/Admin/DocumentList';
import DoctorsList from './pages/User/Doctors_list';
import DoctorDetails from './pages/User/DoctorDetails';
import BookingList from './pages/Doctors/Bookings/BookingList';
import MyAppointments from './pages/User/Bookings/MyAppointments';
import BookingDetails from './pages/Doctors/Bookings/BookingDetails';
import PaymentComponent from './pages/User/Bookings/PaymentComponent';

import ChatMessage from './pages/Chats/ChatMessage';
import ChatRoomList from './pages/Chats/ChatRoomList';
import StartChat from './pages/Chats/StartChat';
import ChatLayout from './pages/Chats/ChatLayout';
import DoctorChatRoomList from './pages/Doctors/DoctorChatRoomList';
import DoctorChatMessage from './pages/Doctors/DoctorChatMessage';
import DoctorLayout from './Components/Chat/DoctorLayout';
import UserCall from './pages/User/UserCall';
import DoctorCall from './pages/Doctors/DoctorCall';
import HeaderLayout from './Components/Doctors/HeaderLayout';
import AdminDoctors from './pages/Admin/AdminDoctors';
import UserWallet from './pages/User/Profile/UserWallet';
import UserLayout from './Components/Users/UserLayout';
import AdminUsers from './pages/Admin/AdminUsers';
import SalesReport from './pages/Admin/SalesReport';
import DoctorNotification from './Components/Doctors/DoctorNotification';
import AboutPage from './pages/User/AboutPage';

function App() {
  const { isAuthenticated } = useSelector(state => state.authUser);
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route exact path="/" element={<User_Homepage />} />
          
          <Route exact path="/otp" element={<UserOtp />} />
          <Route exact path="/signup" element={<UserRegistration />} />
          <Route exact path="/login" element={<Loginpage />} />
          <Route exact path="/fpassword" element={<ForgotPassword />} />
          <Route exact path="/FPotp" element={<FPotp />} />
          <Route exact path="/changePassword/:id" element={<Fenterpassword />} />
          
          {/* Admin Routes */}
          <Route exact path="/admin/login" element={<AdminLogin />} />
          <Route exact path="/admin/document_list" element={
            <PrivateRoutes role="admin">
              <DocumentList />
            </PrivateRoutes>
          } />
          <Route exact path="/admin/dashboard" element={
            <PrivateRoutes role="admin">
              <AdminDashboard />
            </PrivateRoutes>
          } />
          <Route exact path="/admin/doctors_list" element={
            <PrivateRoutes role="admin">
              <AdminDoctors />
            </PrivateRoutes>
          } />
          <Route exact path="/admin/users_list" element={
            <PrivateRoutes role="admin">
              <AdminUsers />
            </PrivateRoutes>
          } />
          <Route exact path="/admin/sales_report" element={
            <PrivateRoutes role="admin">
              <SalesReport />
            </PrivateRoutes>
          } />

          {/* Doctor Routes */}
          <Route exact path="/doctor/login" element={<DoctorLogin />} />
          <Route exact path="/doctor/register" element={<DoctorRegister />} />
          <Route exact path="/doctor/doctorOtp" element={<DoctorOtp />} />
          <Route exact path="/doctor/fpassword" element={<DoctorForgotPassword />} />
          <Route exact path="/doctor/FPotp" element={<DoctorFotp />} />
          <Route exact path="/doctor/changePassword/:id" element={<DoctorPasswordReset />} />
          
          <Route element={<HeaderLayout />}>
            <Route exact path="/doctor/home" element={
              <PrivateRoutes role="doctor">
                <DoctorHomePage />
              </PrivateRoutes>
            } />
            <Route exact path="/doctor/Slots/Slots" element={
              <PrivateRoutes role="doctor">
                <SlotsPage />
              </PrivateRoutes>
            } />
            <Route exact path="/doctor/Bookings/bookings" element={
              <PrivateRoutes role="doctor">
                <BookingList />
              </PrivateRoutes>
            } />
            <Route exact path="/doctor/Bookings/booking_details/:id" element={
              <PrivateRoutes role="doctor">
                <BookingDetails />
              </PrivateRoutes>
            } />
            <Route exact path="/doctor/doctor_details" element={
              <PrivateRoutes role="doctor">
                <DoctorProfile />
              </PrivateRoutes>
            } />
            <Route exact path="/doctor/edit_profile" element={
              <PrivateRoutes role="doctor">
                <EditDoctorProfile />
              </PrivateRoutes>
            } />
          </Route>

          <Route exact path="/doctor/Doctor_call/:roomId/:callId" element={
            <PrivateRoutes role="doctor">
              <DoctorCall />
            </PrivateRoutes>
          } />
          <Route exact path="/doctor/notification" element={
            <PrivateRoutes role="doctor">
              <DoctorNotification />
            </PrivateRoutes>
          } />

          <Route element={<DoctorLayout />}>
            <Route exact path="/doctor/chat_rooms" element={
              <PrivateRoutes role="doctor">
                <DoctorChatRoomList />
              </PrivateRoutes>
            } />
            <Route exact path="/doctor/messages/:roomId" element={
              <PrivateRoutes role="doctor">
                <DoctorChatMessage />
              </PrivateRoutes>
            } />
          </Route>

          {/* User Routes */}
          <Route exact path="/doctors_list" element={<DoctorsList />} />
          <Route exact path="/doctor_details/:doctorId" element={
          <PrivateRoutes role="user">
    <DoctorDetails />
  </PrivateRoutes>
} />
<Route 
  exact 
  path="/home" 
  element={
    <PrivateRoutes role='user'>
      <User_Homepage />
    </PrivateRoutes>
  }
/>
<Route
exact
path='/about'
element={
  <PrivateRoutes role='user'>
  <AboutPage/>
  </PrivateRoutes>

}
/>

<Route exact path="/payment/:transactionId" element={
  <PrivateRoutes role="user">
    <PaymentComponent />
  </PrivateRoutes>
} />

<Route exact path="/Call/:roomId/:callId" element={
  <PrivateRoutes role="user">
    <UserCall />
  </PrivateRoutes>
} />

          <Route element={<UserLayout />}>
            <Route exact path="/user_details" element={
              <PrivateRoutes role="user">
                <UProfile />
              </PrivateRoutes>
            } />
            <Route exact path="/wallet" element={
              <PrivateRoutes role="user">
                <UserWallet />
              </PrivateRoutes>
            } />
            <Route exact path="/edit_profile" element={
              <PrivateRoutes role="user">
                <EditProfile />
              </PrivateRoutes>
            } />
            <Route exact path="/appointments" element={
              <PrivateRoutes role="user">
                <MyAppointments />
              </PrivateRoutes>
            } />
          </Route>

          {/* Chat Routes */}
          <Route element={<ChatLayout />}>
            <Route exact path="/chatrooms" element={
              <PrivateRoutes role="user">
                <ChatRoomList />
              </PrivateRoutes>
            } />
            <Route exact path="/chats/:roomId" element={
              <PrivateRoutes role="user">
                <ChatMessage />
              </PrivateRoutes>
            } />
          </Route>

        </Routes>
      </Router>
    </>
  );
}

export default App;
