import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminStats from './pages/AdminStats';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/trade" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/trade" replace />} />
        <Route path="/admin-stats" element={<AdminStats />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
