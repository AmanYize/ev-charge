import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChargingModal from '../components/ChargingModal';

const ChargingDetail = () => {
  const { id } = useParams(); // Scanned QR code data (siteId)
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const siteId = id || params.get('siteId');
  const gunId = params.get('gunId');

  const handleClose = () => {
    navigate('/');
  };

  const handleScanQr = () => {
    navigate('/qr-scan');
  };

  if (!siteId || !gunId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-800">
        <p className="text-xl font-semibold mb-4">No charging data available.</p>
        <p className="text-lg mb-8">Please scan a QR code to begin charging.</p>
        <button
          onClick={handleScanQr}
          className="px-8 py-4 bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-full text-xl font-bold shadow-lg transform hover:scale-105 transition-transform duration-300"
        >
          Scan QR to Start
        </button>
      </div>
    );
  }

  return <ChargingModal siteId={siteId} gunId={gunId} onClose={handleClose} />;
};

export default ChargingDetail;