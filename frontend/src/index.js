import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes , Route} from 'react-router-dom'
import Home from './pages/home/home';
import Navbar from './components/Navbar/navbar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />  
      </Routes>
    </Router>
  </React.StrictMode>
);


