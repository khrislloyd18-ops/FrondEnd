import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaSave, FaBell, FaUser, FaLock, FaPalette } from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'EduSys Enrollment System',
    emailNotifications: true,
    smsNotifications: false,
    language: 'English',
    timezone: 'Asia/Manila',
    theme: 'light'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Configure system preferences and options</p>
        </div>

        <div className="content-card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaUser style={{ color: '#667eea' }} /> General Settings
              </h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Language</label>
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                      }}
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Timezone</label>
                    <select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                      }}
                    >
                      <option>Asia/Manila</option>
                      <option>Asia/Tokyo</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaBell style={{ color: '#667eea' }} /> Notification Settings
              </h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                  />
                  Email Notifications
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={handleChange}
                  />
                  SMS Notifications
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaPalette style={{ color: '#667eea' }} /> Appearance
              </h3>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Theme</label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  style={{
                    width: '200px',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1rem'
              }}
            >
              <FaSave /> Save Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;