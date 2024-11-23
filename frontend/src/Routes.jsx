// src/Routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import BranchList from './pages/BranchList';
import ScheduleView from './pages/ScheduleView';
import ScheduleManagement from './pages/ScheduleManagement';
import TherapistManagement from './pages/TherapistManagement';
import Settings from './pages/Settings';
import ShiftSettings from './pages/ShiftSettings'; // Add this import
import PrivateRoute from './components/PrivateRoute';
import NavigationBar from './components/NavigationBar';

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Private Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <BranchList />
            </PrivateRoute>
          } />
          
          {/* Schedule Routes */}
          <Route path="/schedule/:branchCode" element={
            <PrivateRoute>
              <ScheduleView />
            </PrivateRoute>
          } />
          
          <Route path="/schedule/manage/:branchCode" element={
            <PrivateRoute>
              <ScheduleManagement />
            </PrivateRoute>
          } />

          {/* Shift Settings Route */}
          <Route path="/branches/:branchCode/shift-settings" element={
            <PrivateRoute>
              <ShiftSettings />
            </PrivateRoute>
          } />

          {/* Therapist Routes */}
          <Route path="/therapists/:branchCode" element={
            <PrivateRoute>
              <TherapistManagement />
            </PrivateRoute>
          } />

          {/* Settings */}
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />

          {/* 404 Page */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-xl text-gray-600">Page Not Found</p>
              <button 
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default AppRoutes;