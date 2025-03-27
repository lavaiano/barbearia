import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SchedulingPage from './pages/SchedulingPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/agendar" element={<SchedulingPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
