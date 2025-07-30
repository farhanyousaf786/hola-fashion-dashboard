import React, { useState, useEffect } from 'react';

function ApiTest() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/test');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMessage(data.message);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="api-test">
      <h2>API Connection Test</h2>
      {loading && <p>Loading message from server...</p>}
      {error && <p>Error connecting to server: {error}</p>}
      {!loading && !error && <p>Server says: <strong>{message}</strong></p>}
    </div>
  );
}

export default ApiTest;
