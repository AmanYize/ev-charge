import { motion } from 'framer-motion';
import { FaUserCircle, FaWallet, FaComment, FaCog, FaQuestionCircle, FaStar } from 'react-icons/fa'; // Added more icons for potential future use
import { useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState({
    username: 'John Doe',
    balance: '100 ETB',
    avatar: null, // Keep null for initial state if no image
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, avatar: URL.createObjectURL(file) });
    }
  };

  return (
    <motion.div
      className="p-4 bg-gray-50 min-h-screen" // Added light gray background and min-height for full page effect
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* User Profile Card */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg mb-6 flex items-center border border-gray-100"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <label htmlFor="avatar" className="cursor-pointer relative group">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-emerald-400 shadow-md transition-all duration-300 group-hover:border-emerald-500"
            />
          ) : (
            <FaUserCircle size={80} className="text-emerald-500 transition-colors duration-300 group-hover:text-emerald-600" />
          )}
          <input
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white text-xs font-semibold">Edit</span>
          </div>
        </label>
        <div className="ml-5">
          <h2 className="text-2xl font-extrabold text-gray-800">{user.username}</h2>
          <p className="text-gray-500 text-sm">User ID: 123456</p>
          <p className="text-gray-500 text-sm">Joined: July 2023</p>
        </div>
      </motion.div>

      {/* Balance Section */}
      <motion.div
        className="bg-white p-5 rounded-2xl shadow-lg mb-6 flex items-center justify-between border border-gray-100"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center">
          <FaWallet className="text-teal-600 text-2xl mr-3" />
          <div>
            <p className="text-gray-700 text-base">Current Balance:</p>
            <p className="text-2xl font-bold text-emerald-700">{user.balance}</p>
          </div>
        </div>
        <button
          className="px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-all duration-300 active:scale-95" // Applied gradient
        >
          Recharge
        </button>
      </motion.div>

      {/* Navigation/Action List */}
      <div className="space-y-4">
        {/* Messages */}
        <motion.div
          className="bg-white p-5 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow duration-200 border border-gray-100"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center">
            <FaComment className="text-teal-600 text-2xl mr-3" />
            <p className="text-lg text-gray-700 font-medium">Messages</p>
          </div>
          <span className="bg-red-500 text-white text-sm font-semibold rounded-full px-3 py-1 animate-pulse">
            3 New
          </span>
        </motion.div>

        {/* Feedback Button */}
        <motion.button
          className="w-full px-6 py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-2xl text-xl font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-all duration-300 active:scale-98" // Applied gradient, larger button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Submit Feedback
        </motion.button>

        {/* Example: Settings */}
        <motion.div
          className="bg-white p-5 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow duration-200 border border-gray-100"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="flex items-center">
            <FaCog className="text-gray-600 text-2xl mr-3" />
            <p className="text-lg text-gray-700 font-medium">Settings</p>
          </div>
          <span className="text-gray-400 text-xl">&gt;</span>
        </motion.div>

        {/* Example: Help & Support */}
        <motion.div
          className="bg-white p-5 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow duration-200 border border-gray-100"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="flex items-center">
            <FaQuestionCircle className="text-gray-600 text-2xl mr-3" />
            <p className="text-lg text-gray-700 font-medium">Help & Support</p>
          </div>
          <span className="text-gray-400 text-xl">&gt;</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;