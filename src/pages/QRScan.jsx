import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserQRCodeReader } from '@zxing/library';
import { FaQrcode, FaCamera, FaExclamationTriangle, FaRedo } from 'react-icons/fa'; // Import icons for better visuals

const QRScan = () => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false); // New state to indicate camera stream is active

  useEffect(() => {
    // Initialize ZXing only once
    if (!codeReader.current) {
      codeReader.current = new BrowserQRCodeReader();
    }

    const startScanner = async () => {
      if (isScanning) return; // Prevent multiple scan attempts if already running
      setIsScanning(true);
      setError(null); // Clear previous errors

      try {
        // Request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.oncanplay = async () => {
            setCameraReady(true); // Camera stream is now ready
            if (!isScanning) return; // Avoid starting if already stopped during oncanplay setup

            try {
              // Start decoding from the video feed
              await codeReader.current.decodeFromVideoDevice(
                null,
                videoRef.current,
                (result, err) => {
                  if (result) {
                    // QR code successfully scanned!
                    setIsScanning(false); // Stop scanning on success
                    // Navigate to charging detail page with QR code result
                    window.location.hash = `/charging-detail/${result.text}`;
                  }
                  if (err) {
                    // Handle non-critical errors (e.g., no QR code found yet)
                    if (err.name !== 'NotFoundException') {
                        setError('Scanning error: ' + err.message);
                        setIsScanning(false);
                    }
                  }
                }
              );
            } catch (decodeErr) {
              setError('Failed to start QR decoder: ' + decodeErr.message);
              setIsScanning(false);
            }
          };
        }
      } catch (err) {
        // Handle camera access denial or unavailability
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Failed to access camera: ' + err.message);
        }
        setIsScanning(false);
        setCameraReady(false);
      }
    };

    startScanner(); // Initiate scan on component mount

    return () => {
      // Cleanup function
      setIsScanning(false);
      setCameraReady(false);
      if (codeReader.current) {
        codeReader.current.reset(); // Stop ongoing decoding
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop()); // Stop camera stream
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full w-full bg-gray-50 p-4 text-gray-800 font-sans"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-800 mb-6 flex items-center">
          <FaQrcode className="mr-3 text-emerald-600" /> Scan to Charge
        </h2>

        {error ? (
          /* Error State UI */
          <motion.div
            className="text-center text-red-600 bg-red-50 p-6 rounded-xl border border-red-200 w-full flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaExclamationTriangle className="text-5xl mb-4 text-red-500" />
            <p className="text-lg font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-8 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-transform duration-200 active:scale-95 flex items-center" // Gradient added here
            >
              <FaRedo className="mr-2" /> Try Again
            </button>
          </motion.div>
        ) : (
          /* Scanning UI */
          <>
            <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-2xl border-4 border-emerald-400 bg-gray-900 flex items-center justify-center">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform scale-105" // Slightly scale for full coverage
                autoPlay
                playsInline
                muted
              />
              {!cameraReady && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex flex-col items-center justify-center text-white text-center p-4">
                  <FaCamera className="text-5xl mb-3 animate-pulse" />
                  <p className="text-lg font-semibold">Waiting for camera...</p>
                  <p className="text-sm text-gray-400">Please ensure camera permissions are granted.</p>
                </div>
              )}
              {/* Scanning animation overlay */}
              {cameraReady && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="w-4/5 h-4/5 border-2 border-dashed border-emerald-300 rounded-lg animate-pulse opacity-50" />
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-emerald-300 opacity-70"
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 border-[20px] border-gray-900 border-opacity-60 rounded-2xl" /> {/* Dark borders for focus effect */}
                </motion.div>
              )}
            </div>

            <p className="mt-8 text-center text-lg text-gray-700 max-w-xs leading-relaxed">
              <span className="font-semibold text-emerald-600">Align</span> the QR code within the frame to begin your charge.
            </p>

            <motion.button
              onClick={() => window.location.hash = '/home'} // Example: Button to go back or select manually
              className="mt-8 px-8 py-3 bg-gray-100 text-gray-700 rounded-full text-lg font-semibold shadow-md hover:bg-gray-200 transition-transform duration-200 active:scale-95"
              whileTap={{ scale: 0.95 }}
            >
              Cancel Scan
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QRScan;