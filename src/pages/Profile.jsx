import { motion } from 'framer-motion';
import { FaUserCircle, FaWallet, FaComment, FaCog, FaQuestionCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState({
    id: '',
    phoneNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    role: '',
    createdAt: '',
    updatedAt: '',
    avatar: null,
    balance: '0 ETB',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      console.log('No token or user data found, redirecting to signin');
      setIsAuthenticated(false);
      navigate('/auth/signin');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser({
        ...user,
        id: userData.id,
        phoneNumber: userData.phoneNumber,
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      });
      setError('');
    } catch (error) {
      console.error('Error parsing user data:', error);
      setError('Failed to load user data');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      navigate('/auth/signin');
    }
  }, [navigate, setIsAuthenticated]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSignOut = () => {
    console.log('Signing out, clearing tokens and user data');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/auth/signin');
  };

  return (
    <motion.div
      className="p-4 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {error && (
        <motion.div
          className="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}
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
          <h2 className="text-2xl font-extrabold text-gray-800">{`${user.firstName} ${user.lastName}`}</h2>
          <p className="text-gray-500 text-sm">User ID: {user.id}</p>
          <p className="text-gray-500 text-sm">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-500 text-sm">Role: {user.role || 'User'}</p>
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
          className="px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-all duration-300 active:scale-95"
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
          className="w-full px-6 py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-2xl text-xl font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-all duration-300 active:scale-98"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Submit Feedback
        </motion.button>

        {/* Settings */}
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
          <span className="text-gray-400 text-xl"></span>
        </motion.div>

        {/* Help & Support */}
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
          <span className="text-gray-400 text-xl"></span>
        </motion.div>

        {/* Sign Out */}
        <motion.button
          onClick={handleSignOut}
          className="w-full px-6 py-4 bg-gradient-to-br from-red-300 to-red-500 text-white rounded-2xl text-xl font-bold shadow-lg hover:from-red-400 hover:to-red-600 transition-all duration-300 active:scale-98"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Profile;