import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { AlertCircle, CheckCircle, Loader, User, RotateCw } from "lucide-react";
import { fetchParticipantById, checkInParticipant } from "../services/api";

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  checked_in: boolean;
  check_in_time?: string;
}

const QRScanner: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [participantData, setParticipantData] = useState<Participant | null>(
    null
  );
  const [showScanner, setShowScanner] = useState<boolean>(true);

  const handleScan = async (result: any) => {
    if (result) {
      const scannedData = result?.text || result?.data || result;
      console.log("Scanned QR Data:", scannedData);

      if (!scannedData) {
        setError("Invalid QR Code.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      setParticipantData(null); // Reset participant data sebelum memulai proses baru

      try {
        console.log(`Fetching participant with ID: ${scannedData.trim()}`);
        const participant = await fetchParticipantById(scannedData.trim());

        if (!participant) {
          setError("Participant not found.");
          return;
        }

        console.log(`Processing check-in for ${participant.id}`);

        // Jika peserta sudah check-in, tampilkan pesan dan data
        if (participant.checked_in) {
          setSuccessMessage(`${participant.name} has already checked in.`);
          setParticipantData(participant);
          setShowScanner(false); // Sembunyikan scanner
          return;
        }

        // Jika belum check-in, lakukan check-in
        const checkInResponse = await checkInParticipant(participant.id);

        if (checkInResponse.success) {
          setSuccessMessage(`Checked in ${participant.name} successfully!`);
          setParticipantData({
            ...participant,
            checked_in: true,
            check_in_time: new Date().toLocaleString(),
          });
          setShowScanner(false); // Sembunyikan scanner setelah check-in berhasil
        } else {
          setError("Failed to check-in participant.");
        }
      } catch (err) {
        console.error("Error during check-in:", err);
        setError("Failed to process check-in.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scanner error:", err);
    setError("Error accessing camera. Please try again.");
  };

  const handleRescan = () => {
    setShowScanner(true); // Tampilkan kembali scanner
    setParticipantData(null); // Reset data peserta
    setSuccessMessage(null); // Reset pesan sukses
    setError(null); // Reset pesan error
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          <p>{successMessage}</p>
        </div>
      )}

      {participantData && (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <User className="h-8 w-8 text-gray-700" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {participantData.name}
              </h3>
              <p className="text-sm text-gray-600">
                {participantData.checked_in
                  ? `Checked in at: ${participantData.check_in_time}`
                  : "Not checked in yet."}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="text-gray-800">{participantData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone:</p>
              <p className="text-gray-800">{participantData.phone}</p>
            </div>
          </div>
          <button
            onClick={handleRescan}
            className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            <span>Scan Again</span>
          </button>
        </div>
      )}

      {showScanner && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div
              className={`relative ${
                window.innerWidth <= 768
                  ? "fixed inset-0 bg-black"
                  : "overflow-hidden rounded-lg border border-gray-200 bg-white p-4"
              }`}
            >
              <QrScanner
                delay={500}
                onScan={handleScan}
                onError={handleError}
                constraints={{ video: { facingMode: "environment" } }}
                style={{
                  width: "100%",
                  height: window.innerWidth <= 768 ? "100vh" : "auto",
                }}
              />

              {/* Overlay untuk mobile */}
              {window.innerWidth <= 768 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white rounded-lg w-64 h-64 animate-pulse"></div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRScanner;
