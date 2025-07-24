import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signup, signin } from '../services/api';

const Auth = ({ setIsAuthenticated }) => {
  const { mode } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }

    try {
      if (mode === 'signup') {
        const { data } = await signup({
          phoneNumber: formData.phoneNumber,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          password: formData.password,
        });
        if (data.statusCode === 201) {
          navigate('/auth/signin');
        } else if (data.statusCode === 409) {
          setError('Phone number already exists');
        } else {
          setError('Signup failed. Please try again.');
        }
      } else if (mode === 'signin') {
        const { data } = await signin({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        });
        if (data.statusCode === 200) {
          localStorage.setItem('token', data.body.token);
          localStorage.setItem('refreshToken', data.body.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.body.user));
          setIsAuthenticated(true);
          navigate('/profile');
        } else {
          setError('Invalid phone number or password');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <motion.div
      className="p-4 bg-gray-50 min-h-screen flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
          {mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </h2>
        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}
        <div className="mb-4">
          <button
            onClick={() => navigate(mode === 'signup' ? '/auth/signin' : '/auth/signup')}
            className="text-emerald-500 hover:underline"
          >
            {mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                placeholder="0941420279"
              />
            </div>
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Michael"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Abebe"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Tesfaye"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                placeholder="********"
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="********"
                />
              </div>
            )}
            <motion.button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-all duration-300 active:scale-95"
              whileTap={{ scale: 0.95 }}
            >
              {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Auth;