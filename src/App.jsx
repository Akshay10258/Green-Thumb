// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import Home from './pages/Home';
// import Analytics from './pages/Analytics';
// import background from './assets/background.png'; // Import background image
// import Garden from './pages/Garden';
// import Disease from './pages/Disease';
// import Community from './pages/Community';;
// import RegisterPage from './pages/Register';
// import 'bootstrap/dist/css/bootstrap.min.css';



import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Garden from './pages/Garden';
import Disease from './pages/Disease';
import Community from './pages/Community';
import RegisterPage from './pages/Register';
import background from './assets/background.png';
import LoginPage from "./pages/Login";
//import { getFirestore } from 'firebase/firestore';
//import {firebaseApp} from "./context/Firebase";




const App = () => {
  return (
    <Router>  {/* Make sure this is the only Router */}
      <div className="min-h-screen flex flex-col bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
          backgroundAttachment: 'fixed',
        }}>
       
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          < Route path="/login" element={<LoginPage/>}/>
          <Route path="/home" element={<Home />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/disease-detection" element={<Disease />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
