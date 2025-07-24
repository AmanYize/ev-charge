import React, { useEffect, useRef, useState } from 'react'; // Import useRef and useState
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion'; // Keep Framer Motion for internal tab animations
import { FaHome, FaBolt, FaQrcode, FaHistory, FaUser } from 'react-icons/fa';
import { gsap } from 'gsap'; // Import GSAP

const tabs = [
  { path: '/', icon: <FaHome /> },
  { path: '/charging-detail', icon: <FaBolt /> },
  { path: '/qr-scan', icon: <FaQrcode /> },
  { path: '/record', icon: <FaHistory /> },
  { path: '/profile', icon: <FaUser /> },
];

const TabBar = () => {
  const tabBarRef = useRef(null); // Ref for the tab bar div
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const initialLoadHandled = useRef(false); // To prevent initial fade-in on refresh

  // Initial animation for the tab bar on mount
  useEffect(() => {
    // Only run initial animation if not already handled (e.g., on route change)
    if (!initialLoadHandled.current) {
      gsap.fromTo(
        tabBarRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
      initialLoadHandled.current = true;
    }
  }, []);

  // Scroll Logic for TabBar Visibility
  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50; // Pixels to scroll before hiding/showing

      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        // Scrolling down and past an initial threshold
        if (isVisible) {
          // Animate out
          gsap.to(tabBarRef.current, {
            y: tabBarRef.current.offsetHeight + 20, // Move completely off screen + a little more
            opacity: 0,
            duration: 0.4,
            ease: 'power3.in',
            overwrite: true // Prevent conflicting animations
          });
          setIsVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        if (!isVisible) {
          // Animate in
          gsap.to(tabBarRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
            overwrite: true // Prevent conflicting animations
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
  }, [isVisible]); // Re-run effect if isVisible changes to ensure animation triggers correctly

  return (
    <motion.div
      ref={tabBarRef} // Attach the ref here
      className="fixed bottom-0 left-0 right-0 z-40
                 flex justify-around py-4 px-2
                 rounded-t-3xl border-t border-gray-300 backdrop-blur-xl bg-white/40 mt-16"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `relative flex items-center justify-center p-3 sm:p-4 rounded-full transition-all duration-300 ease-out group
             ${isActive ? 'text-white' : 'text-gray-600'}`
          }
          aria-label={`Maps to ${tab.path.substring(1) || 'Home'}`}
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

export default TabBar;