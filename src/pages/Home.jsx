import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaTimes, FaCarBattery, FaChargingStation, FaBolt, FaList } from 'react-icons/fa';

const Home = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ gunType: '', power: 0, availability: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedGun, setSelectedGun] = useState(null);
  const [activeTab, setActiveTab] = useState('stationInfo');
  const [favorites, setFavorites] = useState([1]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const initializeMap = () => {
      if (window.googleMapsLoadError) {
        setMapError('Failed to load Google Maps API. Please check your API key.');
        return;
      }
      if (!window.google || !window.google.maps || !window.google.maps.marker || !mapRef.current) {
        setMapError('Google Maps API not available. Please try again later.');
        return;
      }

      if (mapRef.current && mapRef.current._googleMapInstance) {
        setMap(mapRef.current._googleMapInstance);
        window.google.maps.event.trigger(mapRef.current._googleMapInstance, 'resize');
        return;
      }

      try {
        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 9.03, lng: 38.74 },
          zoom: 13,
          mapId: 'YOUR_MAP_ID', // Replace with your Map ID
          disableDefaultUI: true,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            {
              featureType: 'landscape.natural',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }],
            },
            {
              featureType: 'road.arterial',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#787878' }],
            },
            {
              featureType: 'road.local',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#787878' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#a0d8f0' }],
            },
          ],
        });
        setMap(googleMap);
        mapRef.current._googleMapInstance = googleMap;

        const mockStations = [
          {
            id: 1,
            name: 'Station A - SwiftCharge',
            lat: 9.03,
            lng: 38.74,
            address: '123 Addis Street, Bole, Addis Ababa',
            hours: '24/7',
            contact: '+251 911 234567',
            pricing: '0.5 ETB/kWh',
            facilities: ['Restroom', 'Cafe', 'WiFi'],
            image: 'https://placehold.co/400x250/E0F2F1/047857?text=Station+A',
            guns: [
              { id: 'DC-001', type: 'DC', power: 50, status: 'available', connector: 'CCS2' },
              { id: 'AC-001', type: 'AC', power: 22, status: 'occupied', connector: 'Type 2' },
            ],
            distance: 2.5,
          },
          {
            id: 2,
            name: 'Station B - PowerUp Hub',
            lat: 9.04,
            lng: 38.75,
            address: '456 Bole Road, Saris, Addis Ababa',
            hours: '6 AM - 10 PM',
            contact: '+251 912 345678',
            pricing: '0.6 ETB/kWh',
            facilities: ['Shop', 'Waiting Area'],
            image: 'https://placehold.co/400x250/E0F2F1/047857?text=Station+B',
            guns: [
              { id: 'AC-002', type: 'AC', power: 22, status: 'available', connector: 'Type 2' },
              { id: 'DC-002', type: 'DC', power: 100, status: 'available', connector: 'CHAdeMO' },
            ],
            distance: 3.7,
          },
          {
            id: 3,
            name: 'Station C - EcoCharge Point',
            lat: 9.02,
            lng: 38.73,
            address: '789 Summit St, Piazza, Addis Ababa',
            hours: 'Mon-Fri 8AM-8PM',
            contact: '+251 913 456789',
            pricing: '0.55 ETB/kWh',
            facilities: ['Car Wash'],
            image: 'https://placehold.co/400x250/E0F2F1/047857?text=Station+C',
            guns: [
              { id: 'DC-003', type: 'DC', power: 50, status: 'occupied', connector: 'CCS2' },
              { id: 'AC-003', type: 'AC', power: 11, status: 'available', connector: 'Type 2' },
            ],
            distance: 1.2,
          },
        ];
        setStations(mockStations);
        setFilteredStations(mockStations);

        const markers = mockStations.map((station) => {
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: station.lat, lng: station.lng },
            map: googleMap,
            title: station.name,
            content: new window.google.maps.marker.PinElement({
              background: '#059669', // Emerald 600
              borderColor: '#047857', // Emerald 700
              glyphColor: 'white',
            }).element,
          });
          marker.addListener('click', () => {
            setSelectedStation(station);
            setSelectedGun(null);
            setActiveTab('stationInfo');
          });
          return marker;
        });

        mapRef.current._googleMapMarkers = markers;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
              googleMap.setCenter(pos);
              new window.google.maps.marker.AdvancedMarkerElement({
                position: pos,
                map: googleMap,
                title: 'Your Location',
                content: new window.google.maps.marker.PinElement({
                  glyphColor: 'white',
                  background: '#3B82F6', // Blue 500
                  borderColor: '#2563EB', // Blue 600
                }).element,
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              setMapError('Unable to retrieve your location. Please enable location services.');
            }
          );
        }
      } catch (error) {
        setMapError('Failed to initialize map: ' + error.message);
      }
    };

    if (window.googleMapsLoaded) {
      initializeMap();
    } else {
      window.addEventListener('googleMapsLoaded', initializeMap);
      return () => window.removeEventListener('googleMapsLoaded', initializeMap);
    }
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setSearchHistory((prev) => [...new Set([query, ...prev.filter(item => item !== query)])].slice(0, 5));
    applyFilters(query, filters);
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(search, newFilters);
  };

  const applyFilters = (currentSearch = search, currentFilters = filters) => {
    const searchLower = currentSearch.toLowerCase();
    const filtered = stations.filter((station) => {
      const matchesSearch =
        station.name.toLowerCase().includes(searchLower) ||
        station.address.toLowerCase().includes(searchLower);

      const gunMatch = !currentFilters.gunType || station.guns.some((gun) => gun.type === currentFilters.gunType);
      const powerMatch = currentFilters.power === 0 || station.guns.some((gun) => gun.power >= currentFilters.power);
      const availabilityMatch =
        !currentFilters.availability || station.guns.some((gun) => gun.status === currentFilters.availability);
      return matchesSearch && gunMatch && powerMatch && availabilityMatch;
    });
    setFilteredStations(filtered);

    if (map && mapRef.current && mapRef.current._googleMapMarkers) {
      const currentStationIds = new Set(filtered.map(s => s.id));
      mapRef.current._googleMapMarkers.forEach(marker => {
        const markerStation = stations.find(s => s.name === marker.title);
        if (markerStation) {
          marker.map = currentStationIds.has(markerStation.id) ? map : null;
        }
      });
    }
  };

  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleView = () => {
    setSelectedStation(null);
    setSelectedGun(null);
    setShowList(!showList);
    if (!showList && map) {
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
        map.setCenter(map.getCenter());
      }, 0);
    }
  };
  const clearFilters = () => {
    const newFilters = { gunType: '', power: 0, availability: '' };
    setFilters(newFilters);
    applyFilters(search, newFilters);
  };

  const toggleFavorite = (stationId) => {
    setFavorites((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  const showGunDetails = (gun, station) => {
    setSelectedGun(gun);
    setSelectedStation(station);
    setActiveTab('chargingGuns');
  };

  const startCharging = (gun, station) => {
    if (gun.status !== 'available') {
      alert('Charging gun is not available. Please select an available one.');
      return;
    }
    const balance = 100; // Mock balance
    if (balance < 10) { // Mock minimum balance
      alert('Insufficient balance. Please recharge.');
      window.location.hash = '/profile';
      return;
    }
    alert(`Initiating charge for ${gun.type} gun at ${station.name}.`);
    // In a real app, you'd navigate to a charging confirmation/progress page
    window.location.hash = `/charging-detail/${gun.id}`;
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans">
      {/* Top Search and Filter Bar */}
      <motion.div
        className="sticky top-0 z-20 bg-white p-4 pb-3 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search stations or destinations"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base placeholder-gray-500"
              aria-label="Search charging stations"
            />
          </div>
          <motion.button
            onClick={toggleFilters}
            className={`p-3 rounded-xl transition-colors duration-200 ease-in-out relative
              ${filters.gunType || filters.availability || filters.power > 0
                ? 'bg-gradient-to-br from-green-300 to-teal-400 text-white shadow-lg' // Gradient for active filters
                : 'bg-gray-200 text-gray-700'
              }`}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            whileTap={{ scale: 0.95 }}
          >
            <FaFilter className="text-xl" />
            {(filters.gunType || filters.availability || filters.power > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                !
              </span>
            )}
          </motion.button>
        </div>
        {search && searchHistory.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
                <span className="font-semibold mr-1">Recent:</span>
                {searchHistory.map((item, index) => (
                    <span key={index}
                        onClick={() => { setSearch(item); applyFilters(item, filters); }}
                        className="inline-block bg-gray-100 rounded-full px-2 py-0.5 mr-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        {item}
                    </span>
                ))}
            </div>
        )}
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            id="filter-panel"
            className="bg-white p-6 rounded-b-3xl shadow-lg border-b border-gray-100 z-20 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-bold text-emerald-700 mb-4">Refine Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gunType" className="block text-sm font-medium text-gray-700 mb-1">
                  Charger Type:
                </label>
                <select
                  id="gunType"
                  value={filters.gunType}
                  onChange={(e) => handleFilterChange('gunType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-700"
                  aria-label="Filter by charger type"
                >
                  <option value="">All Types</option>
                  <option value="AC">AC (Alternating Current)</option>
                  <option value="DC">DC (Direct Current)</option>
                </select>
              </div>
              <div>
                <label htmlFor="powerRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Power: {filters.power} kW
                </label>
                <input
                  id="powerRange"
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={filters.power}
                  onChange={(e) => handleFilterChange('power', parseInt(e.target.value))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  aria-label="Filter by minimum power range"
                />
              </div>
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                  Availability:
                </label>
                <select
                  id="availability"
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-700"
                  aria-label="Filter by availability status"
                >
                  <option value="">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2 hover:bg-gray-300 transition-colors font-semibold"
              >
                Clear Filters
              </button>
              <button
                onClick={toggleFilters}
                className="px-5 py-2 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg hover:from-green-400 hover:to-teal-500 transition-colors font-semibold shadow" // Gradient for apply button
              >
                Apply & Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area: Map or List View (flex-1 to take remaining vertical space) */}
      <div className="relative flex-1 rounded-2xl mx-4 my-2 shadow-xl overflow-hidden border border-gray-200">
        {mapError ? (
          <motion.div
            key="map-error"
            className="flex flex-col items-center justify-center h-full text-center text-red-600 bg-red-50 rounded-lg p-6 shadow-inner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xl font-semibold mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg shadow-md hover:from-green-400 hover:to-teal-500 transition-colors font-bold" // Gradient for retry button
            >
              Retry Loading Map
            </button>
          </motion.div>
        ) : (
          <>
            {/* Map Container - Always rendered, fills parent div */}
            <div
              ref={mapRef}
              className={`absolute inset-0 transition-opacity duration-300
                ${showList ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              role="region"
              aria-label="Map of charging stations"
            />

            {/* Station List View - Conditionally rendered */}
            <AnimatePresence>
              {showList && (
                <motion.div
                  key="station-list"
                  className="absolute inset-0 p-4 space-y-4 overflow-y-auto bg-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredStations.length ? (
                    filteredStations.map((station) => (
                      <motion.div
                        key={station.id}
                        className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:shadow-xl transition-shadow duration-200"
                        onClick={() => {
                          setSelectedStation(station);
                          setSelectedGun(null);
                          setActiveTab('stationInfo');
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div>
                          <h3 className="font-bold text-xl text-emerald-700 mb-1">{station.name}</h3>
                          <p className="text-sm text-gray-600 mb-1 flex items-center"><FaCarBattery className="mr-1 text-emerald-400" /> Price: <span className="font-medium ml-1">{station.pricing}</span></p>
                          <p className="text-sm text-gray-600 mb-1 flex items-center"><FaMapMarkerAlt className="mr-1 text-emerald-400" /> Distance: <span className="font-medium ml-1">{station.distance} km</span></p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <FaChargingStation className="mr-1 text-emerald-400" /> Availability:{' '}
                            <span className={`font-medium ml-1 ${
                              station.guns.some((gun) => gun.status === 'available')
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }`}>
                              {station.guns.some((gun) => gun.status === 'available')
                                ? 'Available'
                                : 'Occupied'}
                            </span>
                          </p>
                        </div>
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(station.id); }}
                          className="text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label={favorites.includes(station.id) ? "Remove from favorites" : "Add to favorites"}
                          whileTap={{ scale: 0.8 }}
                        >
                          <FaStar
                            className={favorites.includes(station.id) ? 'text-amber-400' : 'text-gray-300'}
                          />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-600 text-lg">
                      <p>No charging stations match your criteria.</p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-semibold"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Button to toggle between Map and List View */}
      <motion.button
        onClick={toggleView}
        className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-lg font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-colors flex items-center space-x-2" // Gradient for toggle view button
        aria-label={showList ? 'Switch to map view' : 'Switch to list view'}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        {showList ? (
          <>
            <FaMapMarkerAlt /> <span>Show Map</span>
          </>
        ) : (
          <>
            <FaList /> <span>Show List</span>
          </>
        )}
      </motion.button>

      {/* Overlays for Station/Gun Details */}
      <AnimatePresence>
        {selectedGun && selectedStation && (
          <motion.div
            key="gun-details-overlay"
            className="fixed inset-x-0 bottom-0 bg-white p-6 pt-8 rounded-t-3xl shadow-2xl z-30"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-700">
                {selectedStation?.name} - Charger {selectedGun.id}
              </h2>
              <button
                onClick={() => setSelectedGun(null)}
                className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                aria-label="Close gun details"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            {/* NEW SCROLLABLE CONTENT WRAPPER */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center text-lg"><FaChargingStation className="mr-2 text-emerald-500" /> Type: <span className="font-semibold ml-1">{selectedGun.type}</span></p>
                <p className="flex items-center text-lg"><FaBolt className="mr-2 text-emerald-500" /> Power: <span className="font-semibold ml-1">{selectedGun.power} kW</span></p>
                <p className="flex items-center text-lg">
                  <FaCarBattery className="mr-2 text-emerald-500" /> Status:{' '}
                  <span
                    className={`font-semibold ml-1 ${
                      selectedGun.status === 'available' ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {selectedGun.status.charAt(0).toUpperCase() + selectedGun.status.slice(1)}
                  </span>
                </p>
                <p className="flex items-center text-lg"><FaStar className="mr-2 text-emerald-500" /> Connector: <span className="font-semibold ml-1">{selectedGun.connector || 'N/A'}</span></p>
                <p className="text-lg">Pricing: <span className="font-semibold">{selectedStation?.pricing}</span></p>
              </div>
              <button
                onClick={() => startCharging(selectedGun, selectedStation)}
                className={`w-full mt-6 px-6 py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-xl text-lg font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-colors
                  ${selectedGun.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}`} // Gradient for Start Charging button
                disabled={selectedGun.status !== 'available'}
              >
                Start Charging Now
              </button>
            </div>
            {/* END NEW SCROLLABLE CONTENT WRAPPER */}
            <button
              onClick={() => setSelectedGun(null)}
              className="w-full mt-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to Station Details
            </button>
          </motion.div>
        )}

        {selectedStation && !selectedGun && (
          <motion.div
            key="station-details-overlay"
            className="fixed inset-x-0 bottom-0 bg-white p-6 pt-8 rounded-t-3xl shadow-2xl z-30"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-700">{selectedStation.name}</h2>
              <button
                onClick={() => setSelectedStation(null)}
                className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                aria-label="Close station details"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* NEW SCROLLABLE CONTENT WRAPPER */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 270px)' }}>
              <div className="rounded-xl overflow-hidden mb-4 shadow-md">
                <img
                  src={selectedStation.image || 'https://placehold.co/400x250/E0F2F1/047857?text=Station+Image'}
                  alt={`Image of ${selectedStation.name}`}
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                <button
                  onClick={() => setActiveTab('stationInfo')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-lg transition-colors
                    ${activeTab === 'stationInfo' ? 'bg-gradient-to-br from-green-300 to-teal-400 text-white shadow' : 'text-gray-700'}`} // Gradient for active tab in overlay
                >
                  Info
                </button>
                <button
                  onClick={() => setActiveTab('chargingGuns')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-lg transition-colors
                    ${activeTab === 'chargingGuns' ? 'bg-gradient-to-br from-green-300 to-teal-400 text-white shadow' : 'text-gray-700'}`} // Gradient for active tab in overlay
                >
                  Chargers
                </button>
              </div>

              <div className="py-2">
                {activeTab === 'stationInfo' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 text-gray-700 text-base"
                  >
                    <p className="flex items-center"><FaMapMarkerAlt className="mr-2 text-emerald-500" /> Address: <span className="ml-1 font-semibold">{selectedStation.address}</span></p>
                    <p className="flex items-center"><FaStar className="mr-2 text-emerald-500" /> Distance: <span className="ml-1 font-semibold">{selectedStation.distance} km</span></p>
                    <p className="flex items-center"><FaTimes className="mr-2 text-emerald-500" /> Hours: <span className="ml-1 font-semibold">{selectedStation.hours}</span></p>
                    <p className="flex items-center"><FaStar className="mr-2 text-emerald-500" /> Contact: <span className="ml-1 font-semibold">{selectedStation.contact}</span></p>
                    <p className="flex items-center"><FaCarBattery className="mr-2 text-emerald-500" /> Pricing: <span className="ml-1 font-semibold">{selectedStation.pricing}</span></p>
                    <p className="flex items-center">
                      <FaChargingStation className="mr-2 text-emerald-500" /> Facilities:{' '}
                      <span className="ml-1 font-semibold">
                        {selectedStation.facilities?.length ? selectedStation.facilities.join(', ') : 'None'}
                      </span>
                    </p>
                  </motion.div>
                )}
                {activeTab === 'chargingGuns' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {selectedStation.guns.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedStation.guns.map((gun) => (
                          <li
                            key={gun.id}
                            className={`p-4 rounded-xl shadow-sm border ${
                              gun.status === 'available' ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
                            } flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow duration-200`}
                            onClick={() => showGunDetails(gun, selectedStation)}
                          >
                            <div>
                              <p className="font-semibold text-lg text-gray-800">
                                Charger {gun.id} <span className="text-base font-normal text-gray-600">({gun.type}, {gun.power} kW)</span>
                              </p>
                              <p className={`text-sm font-medium ${
                                gun.status === 'available' ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                Status: {gun.status.charAt(0).toUpperCase() + gun.status.slice(1)}
                              </p>
                            </div>
                            <FaBolt className="text-xl text-emerald-600" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-600 py-4">No charging guns listed for this station.</p>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => toggleFavorite(selectedStation.id)}
                  className="flex-1 px-6 py-3 bg-amber-400 text-white rounded-xl text-lg font-bold shadow-md hover:bg-amber-500 transition-colors flex items-center justify-center"
                >
                  <FaStar className={`mr-2 ${favorites.includes(selectedStation.id) ? 'text-white' : 'text-amber-200'}`} />
                  {favorites.includes(selectedStation.id) ? 'Favorited' : 'Add to Fav'}
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `http://maps.google.com/?q=${selectedStation.lat},${selectedStation.lng}`, // Standard Google Maps navigation URL
                      '_blank'
                    )
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-xl text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-colors flex items-center justify-center" // Gradient for Navigate button
                >
                  <FaMapMarkerAlt className="mr-2" /> Navigate
                </button>
              </div>
            </div>
            {/* END NEW SCROLLABLE CONTENT WRAPPER */}
            <button
              onClick={() => setSelectedStation(null)}
              className="w-full mt-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;