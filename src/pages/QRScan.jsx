import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserQRCodeReader } from '@zxing/library';
import { FaQrcode, FaCamera, FaCheckCircle, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const QRScan = () => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const siteIdFromQuery = params.get('siteId');
  const gunIdFromQuery = params.get('gunId');

  // Mock data variable
  const mockQRResponse = {
    statusCode: 200,
    body: {
      siteId: '123',
      gunId: '456',
      station: {
        id: '123',
        name: 'Downtown Charging Hub',
        address: '123 Main St, Addis Ababa',
        pricing: 'AC: 15 ETB/kWh, DC: 15 ETB/kWh',
        guns: [{ id: '456', type: 'DC', power: 50, status: 'available', connector: 'CCS2' }],
      },
    },
  };

  const cleanupVideoAndScanner = () => {
    console.log('CleanupVideoAndScanner running.');
    setIsScanning(false);
    setCameraReady(false);
    setScannedData(null);

    if (codeReader.current) {
      console.log('Resetting ZXing codeReader.');
      codeReader.current.reset();
    }

    if (streamRef.current) {
      console.log('Stopping camera stream tracks.');
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.oncanplay = null;
    }
  };

  const startScanner = async () => {
    console.log('startScanner called. isScanning:', isScanning, 'scannedData:', !!scannedData);
    if (isScanning || scannedData || !mountedRef.current) {
      console.log('Skipping startScanner: already scanning, scanned, or unmounted.');
      return;
    }

    if (streamRef.current) {
      console.log('Stream already active, stopping existing stream.');
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsScanning(true);
    setError(null);
    setCameraReady(false);

    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (!mountedRef.current) {
        console.log('Component unmounted before stream setup. Stopping.');
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      console.log('Camera stream obtained:', stream);

      // Wait for video element to mount
      if (!videoRef.current) {
        console.error('videoRef.current is null before stream setup.');
        setError('Video element unavailable. Please try again.');
        setIsScanning(false);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return;
      }

      videoRef.current.srcObject = stream;
      console.log('Video srcObject set.');

      videoRef.current.onloadedmetadata = () => {
        if (!mountedRef.current || !videoRef.current) {
          console.warn('onloadedmetadata failed: unmounted or null.');
          return;
        }
        console.log('Video loadedmetadata fired:', `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          setCameraReady(true);
        } else {
          console.error('Invalid video dimensions.');
          setError('Camera stream not ready. Please retry.');
          setIsScanning(false);
          cleanupVideoAndScanner();
        }
      };

      videoRef.current.oncanplay = () => {
        if (!mountedRef.current || !videoRef.current) {
          console.warn('oncanplay failed: unmounted or null.');
          return;
        }
        console.log('oncanplay fired, video ready.');
      };

      videoRef.current.addEventListener(
        'canplay',
        async () => {
          if (!mountedRef.current || !videoRef.current || !codeReader.current) {
            console.warn('Cannot decode: unmounted or refs invalid.');
            return;
          }
          if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
            console.error('Video dimensions 0 on canplay.');
            setError('Camera stream not ready. Please retry.');
            setIsScanning(false);
            setCameraReady(false);
            cleanupVideoAndScanner();
            return;
          }

          console.log('Starting QR code decoding...');
          try {
            await codeReader.current.decodeFromVideoDevice(null, videoRef.current, async (result, err) => {
              if (!mountedRef.current) {
                console.log('Decode callback fired but unmounted.');
                return;
              }
              if (result) {
                console.log('QR Code Scanned:', result.text);
                setScannedData(result.text);
                setIsScanning(false);
                setCameraReady(false);
                if (codeReader.current) {
                  codeReader.current.reset();
                }
              }
              if (err) {
                if (
                  err.name !== 'NotFoundException' &&
                  err.name !== 'NotFoundException2' &&
                  err.name !== 'FormatException2' &&
                  err.name !== 'ChecksumException2'
                ) {
                  console.error('Scanning error:', err);
                  setError(`Scanning error: ${err.message}`);
                  setIsScanning(false);
                  setCameraReady(false);
                } else if (err.name === 'FormatException2' || err.name === 'ChecksumException2') {
                  console.warn(`${err.name} detected:`, err);
                  // Silent retry
                }
              }
            });
          } catch (decodeErr) {
            console.error('Failed to start QR decoder:', decodeErr);
            setError(`Failed to start QR decoder: ${decodeErr.message}`);
            setIsScanning(false);
            setCameraReady(false);
          }
        },
        { once: true }
      );
    } catch (err) {
      console.error('Camera access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow permissions.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : `Failed to access camera: ${err.message}`
      );
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (!codeReader.current) {
      codeReader.current = new BrowserQRCodeReader();
      console.log('BrowserQRCodeReader initialized.');
    }

    startScanner();

    return () => {
      console.log('useEffect cleanup running.');
      mountedRef.current = false;
      cleanupVideoAndScanner();
    };
  }, []);

  useEffect(() => {
    if (scannedData && mountedRef.current) {
      const validateQR = async () => {
        try {
          console.log('Validating QR code:', scannedData);
          const response = mockQRResponse;

          if (response.statusCode === 200) {
            const { siteId, gunId } = response.body;
            console.log('QR validation successful:', { siteId, gunId });

            if (siteIdFromQuery && gunIdFromQuery) {
              if (siteIdFromQuery !== siteId || gunIdFromQuery !== gunId) {
                console.warn('Query params mismatch:', {
                  query: { siteId: siteIdFromQuery, gunId: gunIdFromQuery },
                  qr: { siteId, gunId },
                });
                setError('Invalid station or connector. Please scan the correct QR.');
                setScannedData(null);
                setIsScanning(false);
                startScanner();
                return;
              }
            }

            setTimeout(() => {
              if (mountedRef.current) {
                console.log('Navigating to charging-detail:', { siteId, gunId });
                navigate(`/charging-detail/${siteId}?gunId=${gunId}`);
              }
            }, 2000);
          } else {
            console.error('QR validation failed:', response);
            setError('Invalid QR code. Please try again.');
            setScannedData(null);
            setIsScanning(false);
            startScanner();
          }
        } catch (err) {
          console.error('QR validation error:', err);
          setError('Failed to validate QR code: ' + err.message);
          setScannedData(null);
          setIsScanning(false);
          startScanner();
        }
      };

      validateQR();
    }
  }, [scannedData, navigate, siteIdFromQuery, gunIdFromQuery]);

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
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-800 mb-6 flex items-center">
          <FaQrcode className="mr-3 text-emerald-600" /> Scan to Charge
        </h2>

        {error ? (
          <motion.div
            className="text-center text-red-600 bg-red-50 p-6 rounded-xl border border-red-200 w-full flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaExclamationTriangle className="text-5xl mb-4 text-red-500" />
            <p className="text-lg font-semibold mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsScanning(false);
                setCameraReady(false);
                setScannedData(null);
                startScanner();
              }}
              className="mt-4 px-8 py-3 bg-gradient-to-br from-green-300 to-teal-400 text-white rounded-full text-lg font-bold shadow-md hover:from-green-400 hover:to-teal-500 transition-transform duration-200 active:scale-95 flex items-center"
            >
              <FaRedo className="mr-2" /> Try Again
            </button>
          </motion.div>
        ) : scannedData ? (
          <motion.div
            className="text-center text-emerald-700 bg-emerald-50 p-6 rounded-xl border border-emerald-200 w-full flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaCheckCircle className="text-5xl mb-4 text-emerald-500" />
            <p className="text-xl font-semibold mb-2">QR Code Scanned!</p>
            <p className="text-md text-gray-600 break-all px-4">Validating QR code...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait...</p>
          </motion.div>
        ) : (
          <>
            <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-2xl border-4 border-emerald-400 bg-gray-900 flex items-center justify-center">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform scale-105"
                autoPlay
                playsInline
                muted
              />
              {!cameraReady && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex flex-col items-center justify-center text-white text-center p-4">
                  <FaCamera className="text-5xl mb-3 animate-pulse" />
                  <p className="text-lg font-semibold">Initializing camera...</p>
                  <p className="text-sm text-gray-400">Please ensure camera permissions are granted.</p>
                </div>
              )}
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
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="absolute inset-0 border-[20px] border-gray-900 border-opacity-60 rounded-2xl" />
                </motion.div>
              )}
            </div>

            <p className="mt-8 text-center text-lg text-gray-700 max-w-xs leading-relaxed">
              <span className="font-semibold text-emerald-600">Align</span> the QR code fully within the frame to begin your charge.
            </p>

            <motion.button
              onClick={() => {
                cleanupVideoAndScanner();
                navigate('/home');
              }}
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