import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBolt, FaQrcode, FaHistory, FaUser } from 'react-icons/fa';

const tabs = [
  { path: '/', icon: <FaHome /> },
  { path: '/charging-detail', icon: <FaBolt /> },
  { path: '/qr-scan', icon: <FaQrcode /> },
  { path: '/record', icon: <FaHistory /> },
  { path: '/profile', icon: <FaUser /> },
];

const TabBar = () => {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40
                 flex justify-around py-4 px-2
                 rounded-t-3xl border-t border-gray-300 backdrop-blur-xl bg-white/40" // Glassmorphism: bg-white/40, backdrop-blur-xl, stronger border
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `relative flex items-center justify-center p-3 sm:p-4 rounded-full transition-all duration-300 ease-out group
             ${isActive ? 'text-white' : 'text-gray-600'}` // Inactive text color slightly darker for better contrast
          }
          aria-label={`Maps to ${tab.path.substring(1) || 'Home'}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator" // For shared layout animation
                  className="absolute inset-0 rounded-full
                             bg-gradient-to-br from-green-300 to-teal-400 shadow-lg" // Gradient background with a subtle shadow
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                className={`relative z-10 text-2xl sm:text-3xl transition-colors duration-300 ease-out
                           ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-emerald-700'}`} // Active is white, inactive is darker gray, hover on inactive is bolder emerald
                whileTap={{ scale: 0.9 }}
                animate={{ color: isActive ? '#FFFFFF' : '#4B5563' }} // Explicit color for inactive (gray-600)
                transition={{ duration: 0.2 }}
              >
                {tab.icon}
              </motion.div>
            </>
          )}
        </NavLink>
      ))}
    </motion.div>
  );
};

export default TabBar;