import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SchedulingPage from './pages/SchedulingPage';
import BarbersPage from './pages/BarbersPage';
import ServicesPage from './pages/ServicesPage';
import ReportsPage from './pages/ReportsPage';

function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/agendar" element={<SchedulingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminPage />}>
        <Route index element={<Navigate to="/admin/barbers" replace />} />
        <Route path="barbers" element={<BarbersPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
