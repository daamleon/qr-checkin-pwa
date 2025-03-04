import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NetworkProvider } from './context/NetworkContext';
import Header from './components/Header';
import NetworkStatus from './components/NetworkStatus';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import { registerSW } from 'virtual:pwa-register';

function App() {
  useEffect(() => {
    // Register service worker for PWA
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });

    // Process pending check-ins when coming back online
    const processPendingCheckIns = async () => {
      if (navigator.onLine) {
        try {
          const pendingCheckIns = JSON.parse(localStorage.getItem('pendingCheckIns') || '[]');
          if (pendingCheckIns.length === 0) return;

          // Process each pending check-in
          // This is a simplified version - in a real app, you'd want to handle failures better
          const { checkInParticipant } = await import('./services/api');
          
          for (const id of pendingCheckIns) {
            try {
              await checkInParticipant(id);
            } catch (err) {
              console.error(`Failed to process offline check-in for ID: ${id}`, err);
            }
          }
          
          // Clear processed check-ins
          localStorage.setItem('pendingCheckIns', JSON.stringify([]));
        } catch (err) {
          console.error('Error processing pending check-ins:', err);
        }
      }
    };

    window.addEventListener('online', processPendingCheckIns);
    
    return () => {
      window.removeEventListener('online', processPendingCheckIns);
    };
  }, []);

  return (
    <NetworkProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <NetworkStatus />
          <main className="py-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </NetworkProvider>
  );
}

export default App;