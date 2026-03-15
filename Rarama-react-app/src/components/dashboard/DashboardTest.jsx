import React from 'react';

const DashboardTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '32px', marginBottom: '20px' }}>
        Test Dashboard - Working!
      </h1>
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
        If you can see this, the dashboard routing is working correctly.
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Dashboard Content</h2>
        <p style={{ color: '#666' }}>This is a minimal test dashboard to verify the routing works.</p>
        <div style={{ marginTop: '20px' }}>
          <button 
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            Test Button 1
          </button>
          <button 
            style={{ 
              backgroundColor: '#28a745', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '4px'
            }}
          >
            Test Button 2
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;
