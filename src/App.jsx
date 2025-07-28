import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import ChargingDetail from './pages/ChargingDetail';
import QRScan from './pages/QRScan';
import Record from './pages/Record';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold text-red-500">Something went wrong</h2>
          <p className="text-gray-600">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => {
              window.location.href = '/home';
            }}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    console.log('Navigated to route:', location.pathname, location.search);
  }, [location]);

  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  const mainContentMargin = isSidebarOpen ? '256px' : '80px';

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onToggle={handleSidebarToggle} />

      <motion.div
        className="flex-1 flex flex-col"
        style={{ marginLeft: window.innerWidth >= 768 ? mainContentMargin : '0px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <Home />
              </ErrorBoundary>
            }
          />
          <Route
            path="/charging-detail/:id"
            element={
              <ErrorBoundary>
                {isAuthenticated ? <ChargingDetail /> : <Navigate to="/auth/signin" />}
              </ErrorBoundary>
            }
          />
          <Route
            path="/qr-scan"
            element={
              <ErrorBoundary>
                {isAuthenticated ? <QRScan /> : <Navigate to="/auth/signin" />}
              </ErrorBoundary>
            }
          />
          <Route
            path="/record"
            element={
              <ErrorBoundary>
                {isAuthenticated ? <Record /> : <Navigate to="/auth/signin" />}
              </ErrorBoundary>
            }
          />
          <Route
            path="/profile"
            element={
              <ErrorBoundary>
                {isAuthenticated ? <Profile setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/auth/signin" />}
              </ErrorBoundary>
            }
          />
          <Route
            path="/auth/:mode"
            element={<Auth setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/auth/signin"} />} />
        </Routes>
        <div className="md:hidden" style={{ height: '70px', minHeight: '70px' }}></div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default App;