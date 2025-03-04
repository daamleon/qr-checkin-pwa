import React, { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import { Camera, RefreshCw } from "lucide-react";
import { useNetwork } from "../context/NetworkContext";

interface QRScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, isScanning }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const { isOnline } = useNetwork();

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setHasPermission(true);

        // Dapatkan daftar kamera yang tersedia
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList.filter((device) => device.kind === "videoinput"));
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasPermission(false);
        setError("Camera access denied. Please enable camera permissions.");
      }
    };

    checkCameraPermission();
  }, []);

  const handleScan = (result: any) => {
    if (result && result.text && isScanning) {
      onScan(result.text);
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scanner error:", err);
    setError("Error accessing camera. Please try again.");
  };

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
        <RefreshCw className="h-12 w-12 text-gray-400 animate-spin" />
        <p className="mt-4 text-gray-600">Requesting camera permission...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
        <Camera className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-red-600">{error || "Camera access denied"}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg">
        <Camera className="h-12 w-12 text-yellow-500" />
        <p className="mt-4 text-yellow-600">
          You are offline. QR scanning is available but check-in will be queued
          until you're back online.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg shadow-lg">
        <QrScanner
          delay={500}
          onScan={handleScan}
          onError={handleError}
          constraints={{ video: { facingMode: "environment" } }} // Perbaikan facingMode
          style={{ width: "100%" }}
        />
      </div>

      {/* Debugging: Tampilkan daftar kamera */}
      <div className="mt-4 text-center text-gray-600">
        <p>Available Cameras:</p>
        <ul className="text-sm text-gray-500">
          {devices.map((device, index) => (
            <li key={index}>{device.label || `Camera ${index + 1}`}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-center text-gray-600">
        <p>Position the QR code within the frame to scan</p>
      </div>
    </div>
  );
};

export default QRScanner;
