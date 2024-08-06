import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserRegistration from './pages/User/UserRegistration';
import './App.css';
import Loginpage  from './pages/User/Loginpage'
import UserOtp from './pages/User/UserOtp';
import User_Homepage from './pages/User/User_Homepage';

function App() {
  return (
    <>
    
      <Router>
     
        <Routes>
          <Route exact path='/home' element={<User_Homepage/>}/>
          <Route exact path='/otp' element={<UserOtp/>}/>
          <Route exact path='/signup' element={<UserRegistration />} />
          <Route exact path='/login' element={<Loginpage/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
