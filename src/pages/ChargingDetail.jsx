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

  if (!siteId || !gunId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p className="text-xl font-semibold">Invalid charging details.</p>
        <button
          onClick={handleClose}
          className="mt-4 px-6 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-lg font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return <ChargingModal siteId={siteId} gunId={gunId} onClose={handleClose} />;
};

export default ChargingDetail;