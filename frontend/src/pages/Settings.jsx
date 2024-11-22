import React, { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: false,
    darkMode: false,
    language: 'en',
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-4 max-w-md mx-auto">
        <div className="mb-4">
          <label className="flex items-center justify-between">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              className="form-checkbox h-5 w-5 text-blue-500"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="flex items-center justify-between">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
              className="form-checkbox h-5 w-5 text-blue-500"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block">
            <span>Language</span>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="en">English</option>
              <option value="id">Indonesian</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;