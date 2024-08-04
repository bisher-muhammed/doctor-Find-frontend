import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserRegistration from './pages/User/UserRegistration';
import './App.css';
import Loginpage  from './pages/User/Loginpage'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path='/signup' element={<UserRegistration />} />
          <Route exact path='/login' element={<Loginpage/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
