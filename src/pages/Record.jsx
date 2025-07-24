import { motion } from 'framer-motion';
import { useState } from 'react';

const Record = () => {
  // Mock charging records (replace with API call)
  const [records] = useState([
    {
      id: 'ORD001',
      station: 'Addis Station 1',
      startTime: '2025-07-24 08:00',
      duration: '2h 30m',
      cost: '50 ETB',
    },
    {
      id: 'ORD002',
      station: 'Addis Station 2',
      startTime: '2025-07-23 14:00',
      duration: '1h 45m',
      cost: '35 ETB',
    },
  ]);

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-emerald-600 mb-4">Charging Records</h2>
      {records.length ? (
        records.map((record) => (
          <div key={record.id} className="bg-white p-4 rounded-lg shadow mb-4">
            <p className="font-medium text-emerald-600">{record.station}</p>
            <p className="text-sm text-gray-600">Order ID: {record.id}</p>
            <p className="text-sm text-gray-600">Start: {record.startTime}</p>
            <p className="text-sm text-gray-600">Duration: {record.duration}</p>
            <p className="text-sm text-gray-600">Cost: {record.cost}</p>
            <button className="mt-2 text-teal-600">View Details</button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600">No records found</p>
      )}
    </motion.div>
  );
};

export default Record;