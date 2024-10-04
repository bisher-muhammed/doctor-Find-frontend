import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserRegistration from './pages/User/UserRegistration';
import './App.css';
import Loginpage  from './pages/User/Loginpage'
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
import DoctorFotp from'./pages/Doctors/DoctorFotp';
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






function App() {
  return (
    <>
    
      <Router>
      
     
        <Routes>
          

        <Route element={<ChatLayout />}>
        <Route path="/chatrooms" element={<ChatRoomList />} />
        <Route path="/chats/:roomId" element={<ChatMessage />} />
        <Route path='/DoctorCall/:roomId/:callId' element={<DoctorCall/>}/>
        
        </Route>

          <Route element={<HeaderLayout/>}>
          <Route exact path='/doctor/home' element ={<DoctorHomePage/>}/>
          <Route exact path='/doctor/Slots/Slots' element ={<SlotsPage/>}/>
          <Route exact path='/doctor/Bookings/bookings' element= {<BookingList/>}/>
          <Route path="/doctor/Bookings/booking_details/:id" element={<BookingDetails />} />
          <Route exact path='/doctor/doctor_details' element={<DoctorProfile/>}/>
          <Route exact path='/doctor/edit_profile' element={<EditDoctorProfile/>}/>
          </Route>
          




          {/* <Route exact path='/doctor/doctor_profile' element={<DoctorProfileForm/>}/> */}
          
          <Route exact path='/doctor/login' element={<DoctorLogin/>}/>
          <Route exact path='/doctor/doctorOtp' element={<DoctorOtp/>}/>
          <Route exact path='/doctor/register' element={<DoctorRegister/>}/>
          <Route exact path='/doctor/fpassword' element={<DoctorForgotPassword/>}/>
          <Route exact path='/doctor/FPotp' element={<DoctorFotp/>}/>
          <Route exact path='/doctor/changePassword/:id' element={<DoctorPasswordReset/>}/>

          


          <Route element={<DoctorLayout/>}>
          <Route exact path='/doctor/chat_rooms' element={<DoctorChatRoomList/>}/>
          <Route exact path='/doctor/messages/:roomId' element ={<DoctorChatMessage/>}/>
          </Route>



          <Route exact path='/admin/document_list' element={<DocumentList/>}/>
          <Route exact path='/admin/dashboard' element={<AdminDashboard/>}/>
          <Route exact path='/admin/login' element={<AdminLogin/>}/>
          <Route exact path='/admin/doctors_list' element={<AdminDoctors/>}/>
          <Route exact path='/admin/users_list' element= {<AdminUsers/>}/>

          <Route exact path='/' element={<User_Homepage/>}/>
          <Route exact path='/home' element={<User_Homepage/>}/>
          <Route exact path='/otp' element={<UserOtp/>}/>
          <Route exact path='/signup' element={<UserRegistration />} />
          <Route exact path='/login' element={<Loginpage/>}/>
          <Route exact path='/fpassword' element={<ForgotPassword/>}/>
          <Route exact path='/FPotp' element={<FPotp/>}/>


          
          
          <Route exact path='/doctors_list' element={<DoctorsList/>}/>
          <Route path='/doctor_details/:doctorId' element={<DoctorDetails />} />
          
          <Route path="/payment/:transactionId" element={<PaymentComponent />} />
          <Route path="/Call/:roomId/:callId" element={<UserCall />} />
          
          <Route exact path='/changePassword/:id' element={<Fenterpassword/>}/>

              <Route element={<UserLayout/>}>
                        <Route exact path='/user_details' element={<UProfile/>}/>
                        <Route path="/wallet" element={<UserWallet />} />
                        <Route path="/edit_profile" element={<EditProfile />} />
                        <Route path="/appointments" element={<MyAppointments />} />
                    </Route>


          

          
        </Routes>
        
      </Router>
    </>
  );
}

export default App;
