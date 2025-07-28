import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaWallet, FaCheckCircle, FaExclamationTriangle, FaStopCircle } from 'react-icons/fa';

const ChargingModal = ({ siteId, gunId, onClose }) => {
  const [chargingState, setChargingState] = useState('pre-charging'); // 'pre-charging', 'charging', 'post-charging', 'error'
  const [station, setStation] = useState(null);
  const [connector, setConnector] = useState(null);
  const [wallet, setWallet] = useState({ balance: 1000 }); // Mock wallet
  const [session, setSession] = useState({ kWh: 0, cost: 0, startTime: null, status: 'idle' });
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Mock station data
  const mockStation = {
    id: siteId,
    name: 'Downtown Charging Hub',
    address: '123 Main St, Addis Ababa',
    pricing: 'AC: 15 ETB/kWh, DC: 15 ETB/kWh',
    guns: [
      {
        id: gunId,
        type: 'DC',
        power: 50,
        status: 'available',
        connector: 'CCS2',
      },
    ],
  };

  // Load mock data and wallet
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching station data for siteId:', siteId);
        const response = { statusCode: 200, body: mockStation };
        if (response.statusCode === 200) {
          setStation(response.body);
          const gun = response.body.guns.find((g) => g.id === gunId);
          if (gun) {
            setConnector(gun);
          } else {
            setError('Connector not found.');
            setChargingState('error');
          }
        } else {
          setError('Failed to fetch station details.');
          setChargingState('error');
        }

        // Load and validate wallet from localStorage
        const savedWallet = JSON.parse(localStorage.getItem('mockWallet') || '{"balance": 1000}');
        const initialBalance = typeof savedWallet.balance === 'number' && savedWallet.balance >= 0 ? savedWallet.balance : 1000;
        console.log('Initial wallet balance:', initialBalance);
        setWallet({ balance: initialBalance });
        localStorage.setItem('mockWallet', JSON.stringify({ balance: initialBalance }));
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error loading data: ' + err.message);
        setChargingState('error');
      }
    };

    fetchData();

    return () => {
      if (intervalRef.current) {
        console.log('Clearing interval on cleanup');
        clearInterval(intervalRef.current);
      }
    };
  }, [siteId, gunId]);

  // Real-time charging simulation
  useEffect(() => {
    if (chargingState === 'charging') {
      console.log('Starting charging simulation, wallet:', wallet.balance);
      intervalRef.current = setInterval(() => {
        setSession((prev) => {
          const elapsedSeconds = (Date.now() - prev.startTime) / 1000;
          const kWh = Number((elapsedSeconds * 0.01).toFixed(2)); // 0.01 kWh/second
          const pricePerKWh = 15; // From pricing
          const cost = Number((kWh * pricePerKWh).toFixed(2));
          const newBalance = Number((wallet.balance - cost).toFixed(2));

          if (newBalance < 0) {
            console.log('Insufficient balance, stopping charging');
            clearInterval(intervalRef.current);
            setError('Insufficient wallet balance.');
            setChargingState('error');
            return prev;
          }

          console.log('Charging update:', { kWh, cost, newBalance });
          const updatedSession = { ...prev, kWh, cost, status: 'active' };
          setWallet((w) => {
            const updatedWallet = { balance: newBalance };
            localStorage.setItem('mockWallet', JSON.stringify(updatedWallet));
            return updatedWallet;
          });
          return updatedSession;
        });
      }, 1000);

      return () => {
        console.log('Clearing interval on charging state change');
        clearInterval(intervalRef.current);
      };
    }
  }, [chargingState, wallet.balance]);

  const startCharging = async () => {
    if (connector.status !== 'available') {
      setError('Connector is not available.');
      setChargingState('error');
      return;
    }

    try {
      console.log('Starting charging session:', { siteId, gunId });
      const response = { statusCode: 200, body: { sessionId: 'mock-session-123', status: 'active' } };
      if (response.statusCode === 200) {
        setSession({
          kWh: 0,
          cost: 0,
          startTime: Date.now(),
          status: 'active',
        });
        setChargingState('charging');
      } else {
        setError('Failed to start charging session.');
        setChargingState('error');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Error starting session: ' + err.message);
      setChargingState('error');
    }
  };

  const stopCharging = async () => {
    console.log('stopCharging called');
    try {
      console.log('Stopping charging session.');
      const response = { statusCode: 200, body: { status: 'completed' } };
      if (response.statusCode === 200) {
        setSession((prev) => ({ ...prev, status: 'completed' }));
        setChargingState('post-charging');
        clearInterval(intervalRef.current);
      } else {
        setError('Failed to stop charging session.');
        setChargingState('error');
      }
    } catch (err) {
      console.error('Error stopping session:', err);
      setError('Error stopping session: ' + err.message);
      setChargingState('error');
    }
  };

  const resetWallet = () => {
    console.log('Resetting wallet to 1000 ETB');
    const resetBalance = 1000;
    setWallet({ balance: resetBalance });
    localStorage.setItem('mockWallet', JSON.stringify({ balance: resetBalance }));
  };

  if (!station || !connector) {
    return null;
  }

  return (
    <motion.div
      style={{ background: 'transparent' }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-[calc(100%-1rem)] sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-100 overscroll-contain relative"
        style={{
          boxShadow: chargingState === 'charging' ? '0 0 20px 5px rgba(16, 185, 129, 0.5)' : 'none',
        }}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      >
        {chargingState === 'charging' && (
          <motion.div
            className="absolute inset-0 rounded-3xl border-4 border-emerald-300 opacity-50 z-0"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-emerald-800 flex items-center">
            <FaBolt className="mr-3 text-emerald-600" />
            {chargingState === 'pre-charging' && 'Start Charging'}
            {chargingState === 'charging' && 'Charging In Progress'}
            {chargingState === 'post-charging' && 'Charging Complete'}
            {chargingState === 'error' && 'Error'}
          </h2>
          <motion.button
            onClick={() => {
              resetWallet();
              onClose();
            }}
            onTouchStart={() => {
              resetWallet();
              onClose();
            }}
            className="p-3 sm:p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Close modal"
          >
            <FaExclamationTriangle className="text-base sm:text-lg md:text-xl lg:text-2xl" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {chargingState === 'error' && (
            <motion.div
              key="error"
              className="text-center text-red-600 bg-red-50 p-6 rounded-xl border border-red-200 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FaExclamationTriangle className="text-5xl mb-4 text-red-500 mx-auto" />
              <p className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">{error}</p>
              <motion.button
                onClick={() => {
                  resetWallet();
                  onClose();
                }}
                onTouchStart={() => {
                  resetWallet();
                  onClose();
                }}
                className="px-6 sm:px-8 md:px-10 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-transform duration-200 active:scale-95 flex items-center mx-auto"
                whileTap={{ scale: 0.95 }}
              >
                <FaRedo className="mr-2" /> Return to Home
              </motion.button>
            </motion.div>
          )}

          {chargingState === 'pre-charging' && (
            <motion.div
              key="pre-charging"
              className="space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="flex items-center">
                <FaBolt className="mr-2 text-emerald-500" /> Station: <span className="font-semibold ml-1">{station.name}</span>
              </p>
              <p className="flex items-center">
                <FaBolt className="mr-2 text-emerald-500" /> Connector: <span className="font-semibold ml-1">{connector.connector} ({connector.power} kW, {connector.type})</span>
              </p>
              <p className="flex items-center">
                <FaBolt className="mr-2 text-emerald-500" /> Pricing: <span className="font-semibold ml-1">{station.pricing}</span>
              </p>
              <p className="flex items-center">
                <FaWallet className="mr-2 text-emerald-500" /> Wallet Balance: <span className="font-semibold ml-1">{Number(wallet.balance).toFixed(2)} ETB</span>
              </p>
              <motion.button
                onClick={startCharging}
                onTouchStart={startCharging}
                className="w-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-xl text-lg sm:text-xl font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-transform duration-200 active:scale-95 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                disabled={connector.status !== 'available'}
              >
                <FaBolt className="mr-2" /> Start Charging
              </motion.button>
            </motion.div>
          )}

          {chargingState === 'charging' && (
            <motion.div
              key="charging"
              className="space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative flex justify-center">
                <motion.div
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-emerald-100 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FaBolt className="text-5xl sm:text-6xl md:text-7xl text-emerald-600" />
                </motion.div>
              </div>
              <p className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-emerald-700">
                Charging at {station.name}
              </p>
              <p className="flex items-center justify-center">
                <FaBolt className="mr-2 text-emerald-500" /> Energy: <span className="font-semibold ml-1">{Number(session.kWh).toFixed(2)} kWh</span>
              </p>
              <p className="flex items-center justify-center">
                <FaBolt className="mr-2 text-emerald-500" /> Cost: <span className="font-semibold ml-1">{Number(session.cost).toFixed(2)} ETB</span>
              </p>
              <p className="flex items-center justify-center">
                <FaWallet className="mr-2 text-emerald-500" /> Wallet Balance: <span className="font-semibold ml-1">{Number(wallet.balance).toFixed(2)} ETB</span>
              </p>
              <motion.button
                onClick={stopCharging}
                onTouchStart={stopCharging}
                className="w-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-red-500 text-white rounded-xl text-lg sm:text-xl font-bold shadow-lg hover:bg-red-600 transition-transform duration-200 active:scale-95 flex items-center justify-center z-20"
                whileTap={{ scale: 0.95 }}
              >
                <FaStopCircle className="mr-2" /> Stop Charging
              </motion.button>
            </motion.div>
          )}

          {chargingState === 'post-charging' && (
            <motion.div
              key="post-charging"
              className="space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FaCheckCircle className="text-5xl sm:text-6xl md:text-7xl text-emerald-500 mx-auto mb-4" />
              <p className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-emerald-700">
                Charging Complete!
              </p>
              <p className="flex items-center justify-center">
                <FaBolt className="mr-2 text-emerald-500" /> Energy Consumed: <span className="font-semibold ml-1">{Number(session.kWh).toFixed(2)} kWh</span>
              </p>
              <p className="flex items-center justify-center">
                <FaBolt className="mr-2 text-emerald-500" /> Total Cost: <span className="font-semibold ml-1">{Number(session.cost).toFixed(2)} ETB</span>
              </p>
              <p className="flex items-center justify-center">
                <FaWallet className="mr-2 text-emerald-500" /> Wallet Balance: <span className="font-semibold ml-1">{Number(wallet.balance).toFixed(2)} ETB</span>
              </p>
              <motion.button
                onClick={() => {
                  resetWallet();
                  onClose();
                }}
                onTouchStart={() => {
                  resetWallet();
                  onClose();
                }}
                className="w-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-xl text-lg sm:text-xl font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-transform duration-200 active:scale-95 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                <FaCheckCircle className="mr-2" /> Return to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ChargingModal;