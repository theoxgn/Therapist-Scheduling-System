import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import BranchList from './pages/BranchList';
import ScheduleView from './pages/ScheduleView';
import TherapistManagement from './pages/TherapistManagement';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <NavigationBar />
        <Routes>
          <Route path="/" element={<BranchList />} />
          <Route path="/schedule/:branchCode" element={<ScheduleView />} />
          <Route path="/therapists/:branchCode" element={<TherapistManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;