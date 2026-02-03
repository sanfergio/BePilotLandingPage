import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import BePilotAmbassador from './pages/FormInstructor/BePilotAmbassador.jsx';
import BePilotStudent from './pages/FormStudent/FormStudent.jsx';
import BePilotCFC from './pages/FormCFC/FormCFC.jsx';
import Plans from './pages/Plans/Plans.jsx';
import About from './pages/About/About.jsx';
import HowWork from './pages/HowWork/HowWork.jsx';
import BePilotInstructor from './pages/FormInstructor/BePilotInstructor.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/seja-instrutor" element={<BePilotInstructor />} />
        <Route path="/seja-embaixador" element={<BePilotAmbassador />} />
        <Route path="/seja-aluno" element={<BePilotStudent />} />
        <Route path="/seja-cfc" element={<BePilotCFC />} />
        <Route path="/planos" element={<Plans />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/como-funciona" element={<HowWork />} />

      </Routes>
    </div>
  );
}

export default App;