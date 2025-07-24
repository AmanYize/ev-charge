import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaPhone, FaBolt, FaCarBattery, FaChargingStation } from 'react-icons/fa';
import { useState } from 'react';

const ChargingDetail = () => {
  const { id } = useParams();
  // Mock station data (replace with API call)
  const station = {
    id: id || 1,
    name: 'Addis Station 1',
    address: '123 Bole Rd, Addis Ababa',
    hours: '24/7',
    contact: '+251 911 123 456',
    pricing: '0.5 ETB/kWh',
    image: 'https://placehold.co/600x400/E0F2F1/047857?text=Station+Image', // Added a mock image
    guns: [
      { id: 'G1', type: 'DC', power: '50kW', status: 'Available', connector: 'CCS2' },
      { id: 'G2', type: 'AC', power: '22kW', status: 'In Use', connector: 'Type 2' },
      { id: 'G3', type: 'DC', power: '100kW', status: 'Available', connector: 'CHAdeMO' },
    ],
  };

  const [isFavorite, setIsFavorite] = useState(false); // Consider managing favorites globally or with localStorage

  return (
    <motion.div
      className="p-4 bg-gray-50 min-h-screen pb-24" // Added pb-24 here!
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Station Header and Image */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100 overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <img
          src={station.image}
          alt={`Image of ${station.name}`}
          className="w-full h-48 object-cover"
        />
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-extrabold text-gray-800">{station.name}</h2>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-3xl p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              whileTap={{ scale: 0.8 }}
            >
              <FaStar className={isFavorite ? 'text-amber-400' : 'text-gray-300'} />
            </button>
          </div>
          <p className="text-gray-600 flex items-center mb-1 text-base">
            <FaMapMarkerAlt className="mr-2 text-emerald-500" /> {station.address}
          </p>
          <p className="text-gray-600 flex items-center mb-1 text-base">
            <FaChargingStation className="mr-2 text-emerald-500" /> Hours: {station.hours}
          </p>
          <p className="text-gray-600 flex items-center mb-3 text-base">
            <FaBolt className="mr-2 text-emerald-500" /> Pricing: <span className="font-semibold">{station.pricing}</span>
          </p>

          <div className="flex items-center gap-4 mt-4">
            <a
              href={`tel:${station.contact}`}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <FaPhone className="mr-2" /> Call
            </a>
            <a
              href={`http://maps.google.com/?q=${encodeURIComponent(station.address)}`} // Using standard Google Maps URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-colors flex items-center justify-center"
            >
              <FaMapMarkerAlt className="mr-2" /> Navigate
            </a>
          </div>
        </div>
      </motion.div>

      {/* Charging Guns Section */}
      <motion.div
        className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Available Chargers</h3>
        <div className="space-y-4">
          {station.guns.length > 0 ? (
            station.guns.map((gun) => (
              <motion.div
                key={gun.id}
                className={`p-4 rounded-xl shadow-sm border ${
                  gun.status === 'Available' ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
                } flex flex-col sm:flex-row justify-between items-center sm:items-start transition-shadow duration-200`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="mb-3 sm:mb-0 sm:mr-4 text-center sm:text-left">
                  <p className="font-semibold text-lg text-gray-800">
                    Charger {gun.id} <span className="text-base font-normal text-gray-600">({gun.type}, {gun.power})</span>
                  </p>
                  <p className="text-sm text-gray-600">Connector: <span className="font-medium">{gun.connector || 'N/A'}</span></p>
                  <p className={`text-base font-bold ${
                    gun.status === 'Available' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    Status: {gun.status}
                  </p>
                </div>
                <button
                  onClick={() => window.location.hash = `/charging-detail/${id}/gun/${gun.id}`}
                  className={`px-6 py-3 text-white rounded-full text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-all duration-300 active:scale-95
                    ${gun.status === 'Available'
                      ? 'bg-gradient-to-br from-green-300 to-teal-400'
                      : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  disabled={gun.status !== 'Available'}
                  aria-label={gun.status === 'Available' ? `Start charging with ${gun.id}` : `Charger ${gun.id} is ${gun.status}`}
                >
                  Start Charging
                </button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-5 text-gray-600">
              <p>No charging guns listed for this station.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChargingDetail;