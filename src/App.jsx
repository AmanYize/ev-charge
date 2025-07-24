import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import ChargingDetail from './pages/ChargingDetail';
import QRScan from './pages/QRScan';
import Record from './pages/Record';
import Profile from './pages/Profile';
import { Component } from 'react'; // Keep this if you're using class components for ErrorBoundary

// ErrorBoundary remains the same
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
  return (
    <div className="flex flex-col h-screen bg-white"> {/* Changed bg-emerald-100 to bg-white for consistency */}
      <motion.div
        className="flex-1 overflow-y-auto" // Let flex-1 manage height based on content
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
          <Route path="/charging-detail/:id?" element={<ChargingDetail />} />
          <Route path="/qr-scan" element={<QRScan />} />
          <Route path="/record" element={<Record />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </motion.div>
      <TabBar /> {/* TabBar remains outside the Routes, at the bottom */}
    </div>
  );
};

export default App;