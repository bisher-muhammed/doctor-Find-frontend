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




function App() {
  return (
    <>
    
      <Router>
     
        <Routes>

          <Route exact path='/doctor/Slots/Slots' element ={<SlotsPage/>}/>




          {/* <Route exact path='/doctor/doctor_profile' element={<DoctorProfileForm/>}/> */}
          <Route exact path='/doctor/home' element ={<DoctorHomePage/>}/>
          <Route exact path='/doctor/login' element={<DoctorLogin/>}/>
          <Route exact path='/doctor/doctorOtp' element={<DoctorOtp/>}/>
          <Route exact path='/doctor/register' element={<DoctorRegister/>}/>
          <Route exact path='/doctor/fpassword' element={<DoctorForgotPassword/>}/>
          <Route exact path='/doctor/FPotp' element={<DoctorFotp/>}/>
          <Route exact path='/doctor/changePassword/:id' element={<DoctorPasswordReset/>}/>
          <Route exact path='/doctor/doctor_details' element={<DoctorProfile/>}/>
          <Route exact path='/doctor/edit_profile' element={<EditDoctorProfile/>}/>



          <Route exact path='/admin/document_list' element={<DocumentList/>}/>
          <Route exact path='/admin/dashboard' element={<AdminDashboard/>}/>
          <Route exact path='/admin/login' element={<AdminLogin/>}/>

          <Route exact path='/' element={<User_Homepage/>}/>
          <Route exact path='/home' element={<User_Homepage/>}/>
          <Route exact path='/otp' element={<UserOtp/>}/>
          <Route exact path='/signup' element={<UserRegistration />} />
          <Route exact path='/login' element={<Loginpage/>}/>
          <Route exact path='/fpassword' element={<ForgotPassword/>}/>
          <Route exact path='/FPotp' element={<FPotp/>}/>
          <Route exact path='/user_details' element={<UProfile/>}/>
          <Route exact path='/edit_profile' element={<EditProfile/>}/>
          <Route exact path='/doctors_list' element={<DoctorsList/>}/>
          <Route path='/doctor_details/:doctorId' element={<DoctorDetails />} />
          
          <Route exact path='/changePassword/:id' element={<Fenterpassword/>}/>


          

          
        </Routes>
      </Router>
    </>
  );
}

export default App;
