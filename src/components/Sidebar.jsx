// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBolt, FaQrcode, FaHistory, FaUser, FaBars } from 'react-icons/fa';
import { gsap } from 'gsap';

const tabs = [
  { path: '/', icon: <FaHome />, title: 'Home' },
  { path: '/charging-detail', icon: <FaBolt />, title: 'Charging' },
  { path: '/qr-scan', icon: <FaQrcode />, title: 'Scan QR' },
  { path: '/record', icon: <FaHistory />, title: 'History' },
  { path: '/profile', icon: <FaUser />, title: 'Profile' },
];

// Add onToggle to props
const Sidebar = ({ onToggle }) => { // <--- Added onToggle prop
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(sidebarRef.current, { width: '256px', duration: 0.3, ease: 'power3.out' });
    } else {
      gsap.to(sidebarRef.current, { width: '80px', duration: 0.3, ease: 'power3.out' });
    }
    // Inform parent about the new state
    if (onToggle) { // <--- Call onToggle when isOpen changes
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]); // <--- Added onToggle to dependency array

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-screen z-40
                  bg-white/90 backdrop-blur-xl border-r border-gray-300
                  flex flex-col items-center py-4 transition-all duration-300 ease-out
                  shadow-lg
                  hidden md:flex`}
      style={{ width: isOpen ? '256px' : '80px' }}
    >
      <button
        onClick={toggleSidebar}
        className="p-3 mb-8 rounded-full text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label="Toggle Sidebar"
      >
        <FaBars className="text-2xl" />
      </button>

      <nav className="flex flex-col gap-4 w-full px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `relative flex items-center gap-4 py-3 px-4 rounded-lg
               transition-all duration-300 ease-out group
               ${isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`
            }
            aria-label={`Maps to ${tab.title}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 rounded-lg
                               bg-gradient-to-br from-green-300 to-teal-400 shadow-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  className={`relative z-10 text-xl transition-colors duration-300 ease-out
                              ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-emerald-700'}`}
                  whileTap={{ scale: 0.9 }}
                  animate={{ color: isActive ? '#FFFFFF' : '#4B5563' }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.icon}
                </motion.div>
                {isOpen && (
                  <motion.span
                    className={`relative z-10 text-lg font-medium whitespace-nowrap
                                ${isActive ? 'text-white' : 'text-gray-800'}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    {tab.title}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;