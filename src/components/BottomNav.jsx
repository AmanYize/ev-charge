import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBolt, FaQrcode, FaHistory, FaUser } from 'react-icons/fa';
import { gsap } from 'gsap';

const tabs = [
  { path: '/', icon: <FaHome />, title: 'Home' },
  { path: '/charging-detail', icon: <FaBolt />, title: 'Charging' }, // Added title
  { path: '/qr-scan', icon: <FaQrcode />, title: 'Scan QR' },
  { path: '/record', icon: <FaHistory />, title: 'History' },
  { path: '/profile', icon: <FaUser />, title: 'Profile' },
];

const BottomNav = () => {
  const bottomNavRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const initialLoadHandled = useRef(false);

  // Initial animation for the bottom nav on mount
  useEffect(() => {
    if (!initialLoadHandled.current) {
      gsap.fromTo(
        bottomNavRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
      initialLoadHandled.current = true;
    }
  }, []);

  // Scroll Logic for BottomNav Visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50;

      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        if (isVisible) {
          gsap.to(bottomNavRef.current, {
            y: bottomNavRef.current.offsetHeight + 20,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.in',
            overwrite: true,
          });
          setIsVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current) {
        if (!isVisible) {
          gsap.to(bottomNavRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
            overwrite: true,
          });
          setIsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  return (
    <motion.div
      ref={bottomNavRef}
      className="fixed bottom-0 left-0 right-0 z-40
                 flex justify-around py-4 px-2
                 rounded-t-3xl border-t border-gray-300 backdrop-blur-xl bg-white/40 mt-16
                 md:hidden" // Hide on medium and large screens
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `relative flex items-center justify-center p-3 sm:p-4 rounded-full transition-all duration-300 ease-out group
             ${isActive ? 'text-white' : 'text-gray-600'}`
          }
          aria-label={`Maps to ${tab.title || 'Home'}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-full
                             bg-gradient-to-br from-green-300 to-teal-400 shadow-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                className={`relative z-10 text-2xl sm:text-3xl transition-colors duration-300 ease-out
                           ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-emerald-700'}`}
                whileTap={{ scale: 0.9 }}
                animate={{ color: isActive ? '#FFFFFF' : '#4B5563' }}
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

export default BottomNav;