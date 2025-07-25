import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
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
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear field-specific error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (mode === 'signup') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    setIsLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      // Focus the first invalid field
      if (validationErrors.phoneNumber) phoneInputRef.current.focus();
      else if (validationErrors.password) passwordInputRef.current.focus();
      return;
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
          setErrors({ phoneNumber: 'Phone number already exists' });
          phoneInputRef.current.focus();
        } else {
          setGlobalError('Signup failed. Please try again.');
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
          setErrors({ phoneNumber: 'Invalid phone number or password' });
          phoneInputRef.current.focus();
        }
      }
    } catch (error) {
      setGlobalError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissGlobalError = () => {
    setGlobalError('');
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
        {globalError && (
          <div
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center"
            role="alert"
          >
            <span>{globalError}</span>
            <button
              onClick={dismissGlobalError}
              className="text-red-700 hover:text-red-900"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}
        <div className="mb-4">
          <button
            onClick={() => navigate(mode === 'signup' ? '/auth/signin' : '/auth/signup')}
            className="text-emerald-500 hover:underline"
          >
            {mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0941420279"
              ref={phoneInputRef}
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
            />
            {errors.phoneNumber && (
              <p id="phoneNumber-error" className="text-red-500 text-sm mt-1">
                {errors.phoneNumber}
              </p>
            )}
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
                  className={`w-full p-2 border rounded-lg ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Michael"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg border-gray-300"
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
                  className={`w-full p-2 border rounded-lg ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tesfaye"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-red-500 text-sm mt-1">
                    {errors.lastName}
                  </p>
                )}
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
              className={`w-full p-2 border rounded-lg ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="********"
              ref={passwordInputRef}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>
          {mode === 'signup' && (
            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="********"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-all duration-300 active:scale-95 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
          >
            {isLoading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default Auth;