import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Debugging: Log device and browser info on mount
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(userAgent);
    console.log('Device Info:', {
      userAgent,
      isMobile,
      platform: navigator.platform,
      localStorageAvailable: !!window.localStorage,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Trim input to avoid mobile keyboard issues
    const cleanedValue = value.trim();
    setFormData({ ...formData, [name]: cleanedValue });
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
    console.log(`Input changed: ${name} = ${cleanedValue}`);
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

    console.log('Validation errors:', newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    setIsLoading(true);

    console.log('Form submitted:', { mode, formData });

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      if (validationErrors.phoneNumber) phoneInputRef.current.focus();
      else if (validationErrors.password) passwordInputRef.current.focus();
      console.log('Validation failed:', validationErrors);
      return;
    }

    try {
      if (mode === 'signup') {
        console.log('Sending signup request:', {
          phoneNumber: formData.phoneNumber,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          password: formData.password,
        });
        const { data } = await signup({
          phoneNumber: formData.phoneNumber,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          password: formData.password,
        });
        console.log('Signup response:', data);
        if (data.statusCode === 201) {
          navigate('/auth/signin');
        } else if (data.statusCode === 409) {
          setErrors({ phoneNumber: 'Phone number already exists' });
          phoneInputRef.current.focus();
        } else {
          setGlobalError(`Signup failed: ${data.message || 'Please try again.'}`);
        }
      } else if (mode === 'signin') {
        console.log('Sending signin request:', {
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        });
        const { data } = await signin({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        });
        console.log('Signin response:', data);
        if (data.statusCode === 200) {
          try {
            localStorage.setItem('token', data.body.token);
            localStorage.setItem('refreshToken', data.body.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.body.user));
            console.log('Tokens stored successfully');
            setIsAuthenticated(true);
            navigate('/profile');
          } catch (storageError) {
            console.error('LocalStorage error:', storageError);
            setGlobalError('Failed to store authentication data. Are you in private browsing mode?');
          }
        } else if (data.statusCode === 401) {
          setErrors({ phoneNumber: 'Invalid phone number or password' });
          phoneInputRef.current.focus();
        } else {
          setGlobalError(`Signin failed: ${data.message || 'Please try again.'}`);
        }
      }
    } catch (error) {
      console.error('API error:', error);
      const errorMessage =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK' ? 'Network error. Please check your connection.' : 'An unexpected error occurred.');
      setGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissGlobalError = () => {
    setGlobalError('');
    console.log('Global error dismissed');
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
    console.log('Password visibility toggled:', !showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
    console.log('Confirm password visibility toggled:', !showConfirmPassword);
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
            aria-live="assertive"
          >
            <span>{globalError}</span>
            <button
              onClick={dismissGlobalError}
              className="text-red-700 hover:text-red-900 text-lg font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
        <div className="mb-4">
          <button
            onClick={() => navigate(mode === 'signup' ? '/auth/signin' : '/auth/signup')}
            className="text-emerald-500 hover:underline"
            type="button"
          >
            {mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-teal-400`}
              placeholder="0941420279"
              ref={phoneInputRef}
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
              autoComplete="tel"
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
                  } focus:outline-none focus:ring-2 focus:ring-teal-400`}
                  placeholder="Michael"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  autoComplete="given-name"
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
                  className="w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Abebe"
                  autoComplete="additional-name"
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
                  } focus:outline-none focus:ring-2 focus:ring-teal-400`}
                  placeholder="Tesfaye"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-red-500 text-sm mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </>
          )}
          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-teal-400`}
              placeholder="********"
              ref={passwordInputRef}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            {errors.password && (
              <p id="password-error" className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>
          {mode === 'signup' && (
            <div className="relative">
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-400`}
                placeholder="********"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={toggleShowConfirmPassword}
                className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
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
            className={`w-full px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
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