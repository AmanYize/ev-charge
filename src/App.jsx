import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Still used for overall page transitions if desired
import TabBar from './components/TabBar';
import Home from './pages/Home';
import ChargingDetail from './pages/ChargingDetail';
import QRScan from './pages/QRScan';
import Record from './pages/Record';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { Component } from 'react';
import { useState, useEffect } from 'react';

// No need to import useScrollHide anymore

class ErrorBoundary extends Component {
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
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    // Crucial: Remove 'h-screen' and 'overflow-y-auto' from the main div and its child.
    // The <body> or <html> element (controlled by global CSS) should now be scrollable.
    // This allows window.scrollY to correctly reflect the overall page scroll.
    <div className="flex flex-col min-h-screen bg-white"> {/* Use min-h-screen to ensure content dictates height */}
      <motion.div
        className="flex-1" // Remove overflow-y-auto here
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        // No ref needed here as TabBar listens to window scroll
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
            path="/charging-detail/:id?"
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
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth/signin"} />} />
        </Routes>
        {/* Add padding at the bottom for content to clear the tab bar when it's visible */}
        <div style={{ height: '70px', minHeight: '70px' }}></div>
      </motion.div>
      <TabBar /> {/* No prop needed */}
    </div>
  );
};

export default App;