import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import ScrollToTop from './components/ScrollToTop';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import VerifyCode from './components/VerifyCode';
import NewPassword from './components/NewPassword';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';

// Protected Route Wrapper
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

import Preloader from './components/Preloader'; // Import Preloader

// ... imports ...

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-gradient-to-br from-green-950 via-teal-900 to-cyan-950 flex flex-col font-sans">

          {/* Preloader - Plays once on load */}
          <Preloader />

          {/* Navbar with Auth Props */}
          <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

          {/* Main Content Area */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-code" element={<VerifyCode />} />
              <Route path="/new-password" element={<NewPassword />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard onLogout={handleLogout} />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Footer always stays at the bottom */}
          <Footer />

        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;