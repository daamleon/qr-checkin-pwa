import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import ParticipantCard from '../components/ParticipantCard';
import { fetchParticipantById, checkInParticipant } from '../services/api';
import { Participant } from '../types';
import { AlertCircle, QrCode, RefreshCw } from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

const HomePage: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOnline } = useNetwork();

  const handleScan = async (data: string) => {
    if (!data || isLoading) return;
    
    setIsScanning(false);
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetchParticipantById(data);
      
      if (response.success && response.data) {
        setParticipant(response.data);
      } else {
        setError(response.message || 'Failed to find participant');
        setParticipant(null);
      }
    } catch (err) {
      console.error('Error scanning QR code:', err);
      setError('Failed to process QR code. Please try again.');
      setParticipant(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!participant || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    if (!isOnline) {
      // Store check-in request for later processing
      try {
        const pendingCheckIns = JSON.parse(localStorage.getItem('pendingCheckIns') || '[]');
        pendingCheckIns.push(participant.id);
        localStorage.setItem('pendingCheckIns', JSON.stringify(pendingCheckIns));
        
        setSuccessMessage('Check-in queued for processing when online');
      } catch (err) {
        console.error('Error storing offline check-in:', err);
        setError('Failed to store offline check-in');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    try {
      const response = await checkInParticipant(participant.id);
      
      if (response.success && response.data) {
        setParticipant(response.data);
        setSuccessMessage('Participant successfully checked in!');
      } else {
        setError(response.message || 'Failed to check in participant');
      }
    } catch (err) {
      console.error('Error checking in participant:', err);
      setError('Failed to check in participant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScan = () => {
    setIsScanning(true);
    setParticipant(null);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">QR Code Check-in</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            <p>{successMessage}</p>
          </div>
        )}
        
        {isScanning ? (
          <div className="mb-6">
            <QRScanner onScan={handleScan} isScanning={isScanning} />
          </div>
        ) : (
          <div className="mb-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
                <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="mt-4 text-gray-600">Processing...</p>
              </div>
            ) : participant ? (
              <ParticipantCard 
                participant={participant} 
                onCheckIn={handleCheckIn} 
                isLoading={isLoading} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="mt-4 text-red-600">No participant found</p>
              </div>
            )}
            
            <button
              onClick={resetScan}
              className="mt-6 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Scan Another QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;