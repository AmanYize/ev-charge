import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaTimes, FaCarBattery, FaChargingStation, FaBolt, FaList, FaPhone, FaQrcode } from 'react-icons/fa';
import api from '../services/api';

const Home = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ connectorType: '', chargeMode: '', power: 0, availability: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedGun, setSelectedGun] = useState(null);
  const [activeTab, setActiveTab] = useState('stationInfo');
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [evseStatuses, setEvseStatuses] = useState([]);
  const [connectorTypes, setConnectorTypes] = useState([]);
  const [chargeModes, setChargeModes] = useState([]);

  // Map API statuses to internal statuses
  const statusMapping = {
    ACTIVE: 'available',
    INACTIVE: 'occupied',
    MAINTENANCE: 'maintenance',
  };

  // Reverse mapping for display purposes
  const reverseStatusMapping = Object.fromEntries(
    Object.entries(statusMapping).map(([apiStatus, internalStatus]) => [internalStatus, apiStatus])
  );

  useEffect(() => {
    const initializeMap = async () => {
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
          center: { lat: 9.0, lng: 38.74 },
          zoom: 13,
          mapId: 'YOUR_MAP_ID', // Replace with your actual Map ID
          disableDefaultUI: true,
          gestureHandling: 'greedy',
        });
        setMap(googleMap);
        mapRef.current._googleMapInstance = googleMap;

        // Fetch EVSE status values
        let fetchedStatuses = [];
        try {
          const statusResponse = await api.get('/charging/evse/status_values');
          if (statusResponse.data.statusCode === 200 && Array.isArray(statusResponse.data.body)) {
            fetchedStatuses = statusResponse.data.body;
            setEvseStatuses(fetchedStatuses);
          } else {
            console.warn('Unexpected EVSE status API response:', statusResponse.data);
            fetchedStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
            setEvseStatuses(fetchedStatuses);
          }
        } catch (error) {
          console.error('Failed to fetch EVSE statuses:', error);
          fetchedStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
          setEvseStatuses(fetchedStatuses);
        }

        // Fetch connector types
        let fetchedConnectorTypes = [];
        try {
          const connectorTypeResponse = await api.get('/charging/connectors/connector_types');
          if (connectorTypeResponse.data.statusCode === 200 && Array.isArray(connectorTypeResponse.data.body)) {
            fetchedConnectorTypes = connectorTypeResponse.data.body;
            setConnectorTypes(fetchedConnectorTypes);
          } else {
            console.warn('Unexpected connector types API response:', connectorTypeResponse.data);
            fetchedConnectorTypes = ['TYPE1', 'TYPE2', 'CCS', 'CHADEMO', 'GB_T', 'NACS'];
            setConnectorTypes(fetchedConnectorTypes);
          }
        } catch (error) {
          console.error('Failed to fetch connector types:', error);
          fetchedConnectorTypes = ['TYPE1', 'TYPE2', 'CCS', 'CHADEMO', 'GB_T', 'NACS'];
          setConnectorTypes(fetchedConnectorTypes);
        }

        // Fetch charge modes
        let fetchedChargeModes = [];
        try {
          const chargeModeResponse = await api.get('/charging/connectors/charge_modes');
          if (chargeModeResponse.data.statusCode === 200 && Array.isArray(chargeModeResponse.data.body)) {
            fetchedChargeModes = chargeModeResponse.data.body;
            setChargeModes(fetchedChargeModes);
          } else {
            console.warn('Unexpected charge modes API response:', chargeModeResponse.data);
            fetchedChargeModes = ['AC', 'DC'];
            setChargeModes(fetchedChargeModes);
          }
        } catch (error) {
          console.error('Failed to fetch charge modes:', error);
          fetchedChargeModes = ['AC', 'DC'];
          setChargeModes(fetchedChargeModes);
        }

        // Fetch sites
        let fetchedStations = [];
        try {
          const siteResponse = await api.get('/charging/sites/get_all');
          if (siteResponse.data.statusCode === 201 && Array.isArray(siteResponse.data.body?.items)) {
            fetchedStations = siteResponse.data.body.items.map((item) => {
              // Format pricing from embedded acPricing and dcPricing
              const pricingParts = [];
              if (item.acPricing) {
                pricingParts.push(`AC: ${item.acPricing.energyKwh} ETB/kWh`);
                if (item.acPricing.serviceFee) pricingParts.push(`Service: ${item.acPricing.serviceFee} ETB`);
                if (item.acPricing.parkingPerHour) pricingParts.push(`Parking: ${item.acPricing.parkingPerHour} ETB/hr`);
              }
              if (item.dcPricing) {
                pricingParts.push(`DC: ${item.dcPricing.energyKwh} ETB/kWh`);
                if (item.dcPricing.serviceFee) pricingParts.push(`Service: ${item.dcPricing.serviceFee} ETB`);
                if (item.dcPricing.parkingPerHour) pricingParts.push(`Parking: ${item.dcPricing.parkingPerHour} ETB/hr`);
              }
              const pricingString = pricingParts.length ? pricingParts.join(', ') : 'Pricing not available';

              // Validate latitude and longitude
              const lat = Number(item.latitude);
              const lng = Number(item.longitude);
              const validLat = lat >= -90 && lat <= 90 ? lat : 9.0;
              const validLng = lng >= -180 && lng <= 180 ? lng : 38.74;

              return {
                id: item.id || Date.now() + Math.random(),
                name: item.name || 'Unknown Station',
                lat: validLat,
                lng: validLng,
                address: item.address || 'No address provided',
                hours: item.hours || 'N/A',
                contact: item.contact || 'N/A',
                pricing: pricingString,
                facilities: item.facilities || [],
                image: `https://placehold.co/400x250/E0F2F1/047857?text=${encodeURIComponent(item.name || 'Station')}`,
                guns: [],
                distance: item.distance || 0,
              };
            });
          } else {
            console.warn('Unexpected site API response:', siteResponse.data);
            setMapError('Unexpected site data format. Displaying partial data.');
          }
        } catch (error) {
          console.error('Failed to fetch sites:', error);
          setMapError('Failed to fetch charging sites. Please try again later.');
          return;
        }

        // Fetch EVSEs and connectors for each site
        if (fetchedStations.length) {
          for (let station of fetchedStations) {
            try {
              const devicesResponse = await api.get(`/charging/sites/devices/${station.id}`);
              if (devicesResponse.data.statusCode === 200 && Array.isArray(devicesResponse.data.body)) {
                const evses = devicesResponse.data.body;
                let guns = [];
                for (let evse of evses) {
                  try {
                    const connectorsResponse = await api.get(`/charging/evse/connectors/${evse.id}`);
                    if (connectorsResponse.data.statusCode === 200 && Array.isArray(connectorsResponse.data.body)) {
                      const connectors = connectorsResponse.data.body.map((connector) => ({
                        id: connector.id || `CONN-${Date.now() + Math.random()}`,
                        type: connector.chargeMode || 'DC',
                        power: connector.maxPowerKw || 50,
                        status: statusMapping[evse.status] || 'available',
                        connector: connector.connectorType || 'CCS2',
                        name: `Connector ${connector.id}`,
                      }));
                      guns = [...guns, ...connectors];
                    }
                  } catch (error) {
                    console.error(`Failed to fetch connectors for EVSE ${evse.id}:`, error);
                  }
                }
                station.guns = guns;
              } else if (devicesResponse.data.statusCode === 404) {
                station.guns = [];
              } else {
                console.warn(`Unexpected devices API response for site ${station.id}:`, devicesResponse.data);
                station.guns = [];
              }
            } catch (error) {
              console.error(`Failed to fetch devices for site ${station.id}:`, error);
              station.guns = [];
            }
          }
          setStations(fetchedStations);
          setFilteredStations(fetchedStations);

          // Create markers for each station
          const markers = fetchedStations.map((station) => {
            const marker = new window.google.maps.marker.AdvancedMarkerElement({
              position: { lat: station.lat, lng: station.lng },
              map: googleMap,
              title: station.name,
              content: new window.google.maps.marker.PinElement({
                background: '#059669',
                borderColor: '#047857',
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
        }

        // Initialize favorites from localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(savedFavorites);

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
                  background: '#3B82F6',
                  borderColor: '#2563EB',
                  glyphColor: 'white',
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
    setSearchHistory((prev) => [...new Set([query, ...prev.filter((item) => item !== query)])].slice(0, 5));
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

      const connectorTypeMatch =
        !currentFilters.connectorType || (station.guns && station.guns.some((gun) => gun.connector === currentFilters.connectorType));
      const chargeModeMatch =
        !currentFilters.chargeMode || (station.guns && station.guns.some((gun) => gun.type === currentFilters.chargeMode));
      const powerMatch =
        currentFilters.power === 0 || (station.guns && station.guns.some((gun) => gun.power >= currentFilters.power));
      const availabilityMatch =
        !currentFilters.availability || (station.guns && station.guns.some((gun) => gun.status === currentFilters.availability));
      return matchesSearch && connectorTypeMatch && chargeModeMatch && powerMatch && availabilityMatch;
    });
    setFilteredStations(filtered);

    if (map && mapRef.current && mapRef.current._googleMapMarkers) {
      const currentStationIds = new Set(filtered.map((s) => s.id));
      mapRef.current._googleMapMarkers.forEach((marker) => {
        const markerStation = stations.find((s) => s.name === marker.title);
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
    const newFilters = { connectorType: '', chargeMode: '', power: 0, availability: '' };
    setFilters(newFilters);
    applyFilters(search, newFilters);
  };

  const toggleFavorite = (stationId) => {
    setFavorites((prev) => {
      const updated = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const showGunDetails = (gun, station) => {
    setSelectedGun(gun);
    setSelectedStation(station);
    setActiveTab('chargingGuns');
  };

  const startCharging = (gun, station) => {
    if (gun.status !== 'available') {
      alert('Connector is not available. Please select an available one.');
      return;
    }
    window.location.hash = `/qr-scan?siteId=${station.id}&gunId=${gun.id}`;
  };

  return (
    <div
      className="flex flex-col h-screen bg-white text-gray-800 font-sans"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 70px)' }}
    >
      {/* Top Search and Filter Bar */}
      <motion.div
        className="sticky top-0 z-20 bg-white p-4 sm:p-6 md:p-8 lg:p-4 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="flex items-center space-x-2 sm:space-x-4 max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base md:text-lg lg:text-base" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search stations or destinations"
              className="w-full pl-10 sm:pl-12 lg:pl-10 pr-4 py-2 sm:py-3 md:py-3.5 lg:py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm md:text-base lg:text-base placeholder-gray-500"
              aria-label="Search charging stations"
            />
          </div>
          <motion.button
            onClick={toggleFilters}
            className={`p-2 sm:p-3 md:p-4 lg:p-3 rounded-xl transition-colors duration-200 ease-in-out relative min-h-10 sm:min-h-12 lg:min-h-10 ${
              filters.connectorType || filters.chargeMode || filters.availability || filters.power > 0
                ? 'bg-gradient-to-br from-green-300 to-teal-400 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700'
            }`}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            whileTap={{ scale: 0.95 }}
          >
            <FaFilter className="text-sm sm:text-base md:text-lg lg:text-base" />
            {(filters.connectorType || filters.chargeMode || filters.availability || filters.power > 0) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs text-white">
                !
              </span>
            )}
          </motion.button>
        </div>
        {search && searchHistory.length > 0 && (
          <div className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base lg:text-base text-gray-600 flex flex-wrap gap-2 max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto">
            <span className="font-semibold mr-1">Recent:</span>
            {searchHistory.map((item, index) => (
              <span
                key={index}
                onClick={() => {
                  setSearch(item);
                  applyFilters(item, filters);
                }}
                className="inline-block bg-gray-100 rounded-full px-2 sm:px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors"
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
            className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-b-3xl shadow-lg border-b border-gray-100 z-20 relative max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto overflow-y-auto max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-100 overscroll-contain"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-700 mb-4">Refine Search</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label htmlFor="connectorType" className="block text-xs sm:text-sm md:text-base lg:text-lg font-medium text-gray-700 mb-1">
                  Connector Type:
                </label>
                <select
                  id="connectorType"
                  value={filters.connectorType}
                  onChange={(e) => handleFilterChange('connectorType', e.target.value)}
                  className="w-full p-2 sm:p-3 md:p-3.5 lg:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-xs sm:text-sm md:text-base lg:text-lg"
                  aria-label="Filter by connector type"
                >
                  <option value="">All Types</option>
                  {connectorTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="chargeMode" className="block text-xs sm:text-sm md:text-base lg:text-lg font-medium text-gray-700 mb-1">
                  Charge Mode:
                </label>
                <select
                  id="chargeMode"
                  value={filters.chargeMode}
                  onChange={(e) => handleFilterChange('chargeMode', e.target.value)}
                  className="w-full p-2 sm:p-3 md:p-3.5 lg:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-xs sm:text-sm md:text-base lg:text-lg"
                  aria-label="Filter by charge mode"
                >
                  <option value="">All Modes</option>
                  {chargeModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="powerRange" className="block text-xs sm:text-sm md:text-base lg:text-lg font-medium text-gray-700 mb-1">
                  Minimum Power: {filters.power} kW
                </label>
                <input
                  id="powerRange"
                  type="range"
                  min="0"
                  max="600"
                  step="10"
                  value={filters.power}
                  onChange={(e) => handleFilterChange('power', parseInt(e.target.value))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  aria-label="Filter by minimum power range"
                />
              </div>
              <div>
                <label htmlFor="availability" className="block text-xs sm:text-sm md:text-base lg:text-lg font-medium text-gray-700 mb-1">
                  Availability:
                </label>
                <select
                  id="availability"
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full p-2 sm:p-3 md:p-3.5 lg:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-xs sm:text-sm md:text-base lg:text-lg"
                  aria-label="Filter by availability status"
                >
                  <option value="">All Statuses</option>
                  {evseStatuses.map((status) => (
                    <option key={status} value={statusMapping[status] || status.toLowerCase()}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 sm:mt-6 space-x-2 sm:space-x-3">
              <button
                onClick={clearFilters}
                className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-3.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-xs sm:text-sm md:text-base lg:text-lg min-h-10 sm:min-h-12"
              >
                Clear Filters
              </button>
              <button
                onClick={toggleFilters}
                className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-3.5 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg hover:from-green-400 hover:to-teal-500 transition-colors font-semibold shadow text-xs sm:text-sm md:text-base lg:text-lg min-h-10 sm:min-h-12"
              >
                Apply & Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area: Map or List View */}
      <div className="relative flex-1 mx-2 sm:mx-4 md:mx-6 lg:mx-8 my-2 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {mapError ? (
          <motion.div
            key="map-error"
            className="flex flex-col items-center justify-center h-full text-center text-red-600 bg-red-50 rounded-lg p-4 sm:p-6 md:p-8 lg:p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-lg shadow-md hover:from-green-400 hover:to-teal-500 transition-colors font-bold text-xs sm:text-sm md:text-base lg:text-lg min-h-12"
            >
              Retry Loading Map
            </button>
          </motion.div>
        ) : (
          <>
            {/* Map Container */}
            <div
              ref={mapRef}
              className={`absolute inset-0 transition-opacity duration-300 ${
                showList ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              role="region"
              aria-label="Map of charging stations"
            />

            {/* Station List View */}
            <AnimatePresence>
              {showList && (
                <motion.div
                  key="station-list"
                  className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 sm:space-y-6 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-100 overscroll-contain"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredStations.length ? (
                    filteredStations.map((station) => (
                      <motion.div
                        key={station.id}
                        className="bg-white p-4 sm:p-5 md:p-6 lg:p-7 rounded-xl shadow-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:shadow-xl transition-shadow duration-200"
                        onClick={() => {
                          setSelectedStation(station);
                          setSelectedGun(null);
                          setActiveTab('stationInfo');
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div>
                          <h3 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-emerald-700 mb-1 sm:mb-2">{station.name}</h3>
                          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-1 sm:mb-2 flex items-center">
                            <FaCarBattery className="mr-1 sm:mr-2 text-emerald-400" /> Pricing:{' '}
                            <span className="font-medium ml-1">{station.pricing}</span>
                          </p>
                          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-1 sm:mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-1 sm:mr-2 text-emerald-400" /> Distance:{' '}
                            <span className="font-medium ml-1">{station.distance} km</span>
                          </p>
                          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 flex items-center">
                            <FaChargingStation className="mr-1 sm:mr-2 text-emerald-400" /> Availability:{' '}
                            <span
                              className={`font-medium ml-1 ${
                                station.guns.some((gun) => gun.status === 'available')
                                  ? 'text-green-600'
                                  : 'text-orange-600'
                              }`}
                            >
                              {station.guns.some((gun) => gun.status === 'available')
                                ? 'Available'
                                : 'No connectors available'}
                            </span>
                          </p>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(station.id);
                          }}
                          className="text-base sm:text-lg md:text-xl lg:text-2xl p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label={favorites.includes(station.id) ? 'Remove from favorites' : 'Add to favorites'}
                          whileTap={{ scale: 0.8 }}
                        >
                          <FaStar className={favorites.includes(station.id) ? 'text-amber-400' : 'text-gray-300'} />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-10 md:py-12 lg:py-16 text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl">
                      <p>No charging stations match your criteria.</p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 sm:mt-6 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-semibold text-xs sm:text-sm md:text-base lg:text-lg min-h-10 sm:min-h-12"
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
        className="fixed bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-32 left-1/2 -translate-x-1/2 z-10 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-colors flex items-center space-x-2 min-h-12 sm:min-h-14"
        aria-label={showList ? 'Switch to map view' : 'Switch to list view'}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        {showList ? (
          <>
            <FaMapMarkerAlt className="text-sm sm:text-base md:text-lg lg:text-xl" /> <span>Show Map</span>
          </>
        ) : (
          <>
            <FaList className="text-sm sm:text-base md:text-lg lg:text-xl" /> <span>Show List</span>
          </>
        )}
      </motion.button>

      {/* Station Details Modal */}
      <AnimatePresence>
        {selectedStation && !selectedGun && (
          <motion.div
            key="station-details-overlay"
            className="fixed inset-x-0 bottom-0 bg-white p-4 sm:p-6 md:p-8 lg:p-10 pt-6 sm:pt-8 md:pt-10 rounded-t-3xl shadow-2xl z-50 max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-y-auto max-w-[calc(100%-1rem)] sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-100 overscroll-contain"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 70px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-700">{selectedStation.name}</h2>
              <button
                onClick={() => setSelectedStation(null)}
                className="p-3 sm:p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                aria-label="Close station details"
              >
                <FaTimes className="text-base sm:text-lg md:text-xl lg:text-2xl" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden mb-4 sm:mb-6 shadow-md">
              <img
                src={selectedStation.image}
                alt={`Image of ${selectedStation.name}`}
                className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover"
              />
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 sm:p-1.5 mb-4 sm:mb-6">
              <button
                onClick={() => setActiveTab('stationInfo')}
                className={`flex-1 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base lg:text-lg transition-colors ${
                  activeTab === 'stationInfo' ? 'bg-gradient-to-br from-green-300 to-teal-400 text-white shadow' : 'text-gray-700'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('chargingGuns')}
                className={`flex-1 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base lg:text-lg transition-colors ${
                  activeTab === 'chargingGuns' ? 'bg-gradient-to-br from-green-300 to-teal-400 text-white shadow' : 'text-gray-700'
                }`}
              >
                Connectors
              </button>
            </div>

            <div className="py-2 sm:py-3">
              {activeTab === 'stationInfo' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 sm:space-y-4 text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg"
                >
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-emerald-500" /> Address:{' '}
                    <span className="ml-1 font-semibold">{selectedStation.address}</span>
                  </p>
                  <p className="flex items-center">
                    <FaStar className="mr-2 text-emerald-500" /> Distance:{' '}
                    <span className="ml-1 font-semibold">{selectedStation.distance} km</span>
                  </p>
                  <p className="flex items-center">
                    <FaTimes className="mr-2 text-emerald-500" /> Hours:{' '}
                    <span className="ml-1 font-semibold">{selectedStation.hours}</span>
                  </p>
                  <p className="flex items-center">
                    <FaPhone className="mr-2 text-emerald-500" /> Contact:{' '}
                    <span className="ml-1 font-semibold">{selectedStation.contact}</span>
                  </p>
                  <p className="flex items-center">
                    <FaCarBattery className="mr-2 text-emerald-500" /> Pricing:{' '}
                    <span className="ml-1 font-semibold">{selectedStation.pricing}</span>
                  </p>
                  <p className="flex items-center">
                    <FaChargingStation className="mr-2 text-emerald-500" /> Facilities:{' '}
                    <span className="ml-1 font-semibold">
                      {selectedStation.facilities.length ? selectedStation.facilities.join(', ') : 'None'}
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
                  className="space-y-3 sm:space-y-4"
                >
                  {selectedStation.guns.length > 0 ? (
                    <ul className="space-y-3 sm:space-y-4">
                      {selectedStation.guns.map((gun) => (
                        <li
                          key={gun.id}
                          className={`p-4 sm:p-5 rounded-xl shadow-sm border ${
                            gun.status === 'available' ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
                          } flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow duration-200`}
                          onClick={() => showGunDetails(gun, selectedStation)}
                        >
                          <div>
                            <p className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800">
                              Connector {gun.id}{' '}
                              <span className="text-xs sm:text-sm md:text-base font-normal text-gray-600">
                                ({gun.connector}, {gun.power} kW)
                              </span>
                            </p>
                            <p
                              className={`text-xs sm:text-sm md:text-base lg:text-lg font-medium ${
                                gun.status === 'available' ? 'text-green-600' : 'text-orange-600'
                              }`}
                            >
                              Status:{' '}
                              {reverseStatusMapping[gun.status] ||
                                gun.status.charAt(0).toUpperCase() + gun.status.slice(1)}
                            </p>
                          </div>
                          <FaBolt className="text-sm sm:text-base md:text-lg lg:text-xl text-emerald-600" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-600 py-4 sm:py-6 text-xs sm:text-sm md:text-base lg:text-lg">
                      No connectors listed for this station.
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
              <button
                onClick={() => toggleFavorite(selectedStation.id)}
                className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-amber-400 text-white rounded-xl text-xs sm:text-sm md:text-base lg:text-lg font-bold shadow-md hover:bg-amber-500 transition-colors flex items-center justify-center min-h-12 sm:min-h-14"
              >
                <FaStar
                  className={`mr-2 ${favorites.includes(selectedStation.id) ? 'text-white' : 'text-amber-200'}`}
                />
                {favorites.includes(selectedStation.id) ? 'Favorited' : 'Add to Fav'}
              </button>
              <a
                href={`tel:${selectedStation.contact}`}
                className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm md:text-base lg:text-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center min-h-12 sm:min-h-14"
              >
                <FaPhone className="mr-2" /> Call
              </a>
              <a
                href={`http://maps.google.com/?q=${selectedStation.lat},${selectedStation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-xl text-xs sm:text-sm md:text-base lg:text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-colors flex items-center justify-center min-h-12 sm:min-h-14"
              >
                <FaMapMarkerAlt className="mr-2" /> Navigate
              </a>
            </div>
            <button
              onClick={() => setSelectedStation(null)}
              className="w-full mt-2 sm:mt-3 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm md:text-base lg:text-lg font-semibold hover:bg-gray-200 transition-colors min-h-12 sm:min-h-14"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connector Details Modal */}
      <AnimatePresence>
        {selectedGun && selectedStation && (
          <motion.div
            key="gun-details-overlay"
            className="fixed inset-x-0 bottom-0 bg-white p-4 sm:p-6 md:p-8 lg:p-10 pt-6 sm:pt-8 md:pt-10 rounded-t-3xl shadow-2xl z-50 max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-y-auto max-w-[calc(100%-1rem)] sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-100 overscroll-contain"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 70px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-700">
                {selectedStation.name} - Connector {selectedGun.id}
              </h2>
              <button
                onClick={() => setSelectedGun(null)}
                className="p-3 sm:p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                aria-label="Close connector details"
              >
                <FaTimes className="text-base sm:text-lg md:text-xl lg:text-2xl" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4 text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg">
              <p className="flex items-center">
                <FaChargingStation className="mr-2 text-emerald-500" /> Charge Mode:{' '}
                <span className="font-semibold ml-1">{selectedGun.type}</span>
              </p>
              <p className="flex items-center">
                <FaBolt className="mr-2 text-emerald-500" /> Power:{' '}
                <span className="font-semibold ml-1">{selectedGun.power} kW</span>
              </p>
              <p className="flex items-center">
                <FaCarBattery className="mr-2 text-emerald-500" /> Status:{' '}
                <span
                  className={`font-semibold ml-1 ${
                    selectedGun.status === 'available' ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {reverseStatusMapping[selectedGun.status] ||
                    selectedGun.status.charAt(0).toUpperCase() + selectedGun.status.slice(1)}
                </span>
              </p>
              <p className="flex items-center">
                <FaStar className="mr-2 text-emerald-500" /> Connector Type:{' '}
                <span className="font-semibold ml-1">{selectedGun.connector}</span>
              </p>
              <p className="flex items-center">
                <FaCarBattery className="mr-2 text-emerald-500" /> Pricing:{' '}
                <span className="font-semibold ml-1">{selectedStation.pricing}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
              <button
                onClick={() => startCharging(selectedGun, selectedStation)}
                className={`flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-xl text-xs sm:text-sm md:text-base lg:text-lg font-bold shadow-lg hover:from-green-400 hover:to-teal-500 transition-colors min-h-12 sm:min-h-14 flex items-center justify-center ${
                  selectedGun.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={selectedGun.status !== 'available'}
              >
                <FaQrcode className="mr-2" /> Scan QR
              </button>
              <button
                onClick={() => setSelectedGun(null)}
                className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-3.5 lg:py-4 bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm md:text-base lg:text-lg font-semibold hover:bg-gray-200 transition-colors min-h-12 sm:min-h-14"
              >
                Back to Station Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;