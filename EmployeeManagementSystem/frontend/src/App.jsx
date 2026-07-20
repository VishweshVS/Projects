import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dasboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Absolute root path serves the Login gate */}
        <Route path="/" element={<Login />} />
        
        {/* Dashboard workspace route */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;