import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ModalProvider } from './context/ModalContext';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public login page wrapped with ModalProvider */}
        <Route path="/login" element={
          <ModalProvider>
            <LoginPage />
          </ModalProvider>
        } />
        
        {/* Protected routes with layout */}
        <Route path="/*" element={
          <ProtectedRoute>
            <ModalProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/trips/:tripId" element={<TripDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            </ModalProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;