import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import BePilotAmbassador from './pages/FormInstructor/FormInstructor.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />

        <Route path="/seja-instrutor" element={<BePilotAmbassador />} />

      </Routes>
    </div>
  );
}

export default App;